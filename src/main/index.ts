import { app, BrowserWindow, ipcMain, dialog, screen, protocol } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { setupConfiguration } from './configuration'
import { handleWallpaperActions } from './wallpaper'
import { setDynamicWallpaper, closeDynamicWallpaper, getCurrentWallpaper } from './dynamicWallpaper'

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
  protocol.handle('local-file', (request) => {
    try {
      const url = new URL(request.url)
      // local-file:///C:/Users/.../xxx.jpg → url.pathname starts with /
      const rawPath = decodeURIComponent(url.pathname)
      // Remove leading / to get Windows path like C:/Users/...
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
      const data = fs.readFileSync(filePath)
      return new Response(data, {
        headers: { 'Content-Type': mimeTypes[ext] || 'image/jpeg' },
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
