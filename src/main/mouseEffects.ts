import { BrowserWindow, screen, ipcMain, app } from 'electron'
import * as path from 'path'
import * as fs from 'fs'

let clickEffectWindow: BrowserWindow | null = null
let currentClickEffect: string | null = null
let mainWindow: BrowserWindow | null = null

// 设置主窗口引用
export function setMainWindow(win: BrowserWindow) {
  mainWindow = win
}

// 获取 click-effect.html 的正确路径
function getClickEffectHTMLPath() {
  const isDev = !app.isPackaged || process.argv.includes('--dev')

  if (isDev) {
    return path.join(__dirname, '../../src/renderer/click-effect.html')
  } else {
    return path.join(__dirname, '../renderer/click-effect.html')
  }
}

// 创建点击效果窗口
function createClickEffectWindow() {
  const htmlPath = getClickEffectHTMLPath()

  if (!fs.existsSync(htmlPath)) {
    console.error('click-effect.html not found at:', htmlPath)
    return
  }

  // 如果没有主窗口，无法创建效果窗口
  if (!mainWindow || mainWindow.isDestroyed()) {
    console.error('Main window not available')
    return
  }

  const [mainX, mainY] = mainWindow.getPosition()
  const [mainWidth, mainHeight] = mainWindow.getSize()

  clickEffectWindow = new BrowserWindow({
    width: mainWidth,
    height: mainHeight,
    x: mainX,
    y: mainY,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,
    hasShadow: false,
    resizable: false,
    movable: false,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  clickEffectWindow.setAlwaysOnTop(true, 'screen-saver')

  // 设置窗口穿透点击
  clickEffectWindow.setIgnoreMouseEvents(true)

  clickEffectWindow.loadFile(htmlPath)

  if (process.argv.includes('--dev')) {
    clickEffectWindow.webContents.openDevTools()
  }

  clickEffectWindow.on('closed', () => {
    clickEffectWindow = null
  })

  clickEffectWindow.webContents.on('did-finish-load', () => {
    console.log('Click effect window loaded')
    clickEffectWindow?.show()
  })

  clickEffectWindow.show()
}

// 设置点击效果
export function setClickEffect(effectType: string) {
  currentClickEffect = effectType

  if (!clickEffectWindow) {
    createClickEffectWindow()
  }

  if (clickEffectWindow && !clickEffectWindow.isDestroyed()) {
    clickEffectWindow.webContents.send('set-click-effect', effectType)
  }

  return { success: true }
}

// 关闭点击效果
export function closeClickEffect() {
  currentClickEffect = null

  if (clickEffectWindow && !clickEffectWindow.isDestroyed()) {
    clickEffectWindow.close()
    clickEffectWindow = null
  }

  return { success: true }
}

// 获取当前点击效果
export function getCurrentClickEffect() {
  return { currentEffect: currentClickEffect }
}

// 初始化 IPC 处理器（已废弃，点击效果现在由动态壁纸处理）
export function setupMouseEffectsIPC() {
  // 不再注册这些处理器，因为已经在 index.ts 中注册了
  // ipcMain.handle('set-click-effect', (_, effectType: string) => setClickEffect(effectType))
  // ipcMain.handle('close-click-effect', () => closeClickEffect())
  // ipcMain.handle('get-current-click-effect', () => getCurrentClickEffect())

  // 监听点击转发事件
  ipcMain.on('click-forward', (_, { x, y }) => {
    // 可以在这里处理点击转发逻辑
    console.log('Click forwarded to:', x, y)
  })
}
