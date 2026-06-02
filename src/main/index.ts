import { app, BrowserWindow, ipcMain, dialog, screen, protocol } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { setupConfiguration } from './configuration'
import { handleWallpaperActions } from './wallpaper'
import { setDynamicWallpaper, closeDynamicWallpaper, getCurrentWallpaper, setEffect } from './dynamicWallpaper'
import { setupMouseEffectsIPC, setMainWindow } from './mouseEffects'

// === 配置应用缓存目录，避免权限问题 ===
const userDataPath = path.join(app.getPath('home'), '.xrtl_desktop_wallpaper', 'app_data')
app.setPath('userData', userDataPath)
app.setPath('cache', path.join(userDataPath, 'cache'))

// === VSCode-style Chromium flags: 防止窗口最小化后白屏闪烁 ===
// 参考 VSCode src/vs/platform/windows/electron-main/windowImpl.ts
// 让 Chromium 在窗口被遮挡/后台时仍然维持渲染帧缓存
app.commandLine.appendSwitch('disable-backgrounding-occluded-windows')
app.commandLine.appendSwitch('disable-renderer-backgrounding')

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  const windowWidth = Math.floor(width * 0.75)
  const windowHeight = Math.floor(height * 0.75)

  const isDev = !app.isPackaged || process.argv.includes('--dev')
  const iconPath = app.isPackaged
    ? path.join(process.resourcesPath, 'icon.png')
    : path.join(__dirname, '../../public/icon.png')

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    frame: false,
    backgroundColor: '#1a1a1a',
    transparent: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
    title: '桌面壁纸',
    icon: iconPath,
    show: false,
    titleBarStyle: 'hidden',
  })

  mainWindow.on('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show()
      // 设置主窗口引用给鼠标效果模块
      setMainWindow(mainWindow)
    }
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  // Register custom protocol to serve local files safely
  // Supports HTTP Range requests for video playback
  protocol.handle('local-file', (request) => {
    try {
      const url = new URL(request.url)
      const rawPath = decodeURIComponent(url.pathname)
      const filePath = rawPath.replace(/^\//, '')
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
      }
      const mimeType = mimeTypes[ext] || 'application/octet-stream'
      const fileSize = fs.statSync(filePath).size

      // 检查 Range 请求头（视频播放必须）
      const rangeHeader = request.headers.get('range')
      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
        if (match) {
          const start = parseInt(match[1], 10)
          const end = match[2] ? parseInt(match[2], 10) : fileSize - 1
          const chunkSize = end - start + 1

          // 读取文件的指定范围
          const buf = Buffer.alloc(chunkSize)
          const fd = fs.openSync(filePath, 'r')
          fs.readSync(fd, buf, 0, chunkSize, start)
          fs.closeSync(fd)

          return new Response(buf, {
            status: 206,
            headers: {
              'Content-Type': mimeType,
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': String(chunkSize),
            },
          })
        }
      }

      // 完整文件返回
      const data = fs.readFileSync(filePath)
      return new Response(data, {
        headers: {
          'Content-Type': mimeType,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(fileSize),
        },
      })
    } catch {
      return new Response('Not Found', { status: 404 })
    }
  })

  await setupConfiguration()
  handleWallpaperActions()

  ipcMain.handle('show-open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
        { name: 'Videos', extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov'] },
        { name: 'HTML', extensions: ['html', 'htm'] },
      ],
    })
    return result
  })

  ipcMain.handle('close-window', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })

  ipcMain.handle('minimize-window', () => {
    if (mainWindow) {
      mainWindow.minimize()
    }
  })

  // 动态壁纸相关 IPC 处理器
  ipcMain.handle('set-dynamic-wallpaper', (_, htmlPath: string) => setDynamicWallpaper(htmlPath))
  ipcMain.handle('close-dynamic-wallpaper', () => closeDynamicWallpaper())
  ipcMain.handle('get-current-wallpaper', () => getCurrentWallpaper())
  ipcMain.handle('set-effect', (_, effect: any) => setEffect(effect))

  // 点击效果 IPC 处理器

  // 初始化鼠标效果 IPC
  setupMouseEffectsIPC()

  createWindow()

  let activateDebounceTimer: NodeJS.Timeout | null = null
  let isActivating = false

  app.on('activate', () => {
    if (isActivating) return

    if (activateDebounceTimer) {
      clearTimeout(activateDebounceTimer)
    }

    activateDebounceTimer = setTimeout(() => {
      isActivating = true

      try {
        if (mainWindow) {
          if (mainWindow.isMinimized()) {
            mainWindow.restore()
          } else if (!mainWindow.isVisible()) {
            mainWindow.show()
          }
          mainWindow.focus()
        } else {
          createWindow()
        }
      } finally {
        setTimeout(() => {
          isActivating = false
        }, 200)
      }
    }, 50)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
