import { app, BrowserWindow, ipcMain, dialog, screen, protocol } from 'electron'
import * as path from 'path'
import * as fs from 'fs'
import { setupDatabase } from './database'
import { handleWallpaperActions } from './wallpaper'

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
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    title: '桌面壁纸',
    icon: iconPath,
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
      }
      const data = fs.readFileSync(filePath)
      return new Response(data, {
        headers: { 'Content-Type': mimeTypes[ext] || 'image/jpeg' },
      })
    } catch {
      return new Response('Not Found', { status: 404 })
    }
  })

  await setupDatabase()
  handleWallpaperActions()

  ipcMain.handle('show-open-dialog', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp'] },
      ],
    })
    return result
  })

  ipcMain.handle('close-window', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
