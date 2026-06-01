import { ipcMain, app } from 'electron'
import wallpaper from 'wallpaper'
import { getWallpapers, addWallpaper, deleteWallpaper, toggleFavorite, resetDatabase, getFavoriteWallpapers, setFavoriteWithLocalPath } from './database'
import { Wallpaper } from '../shared/types'
import * as path from 'path'
import * as fs from 'fs'

async function resolveLocalPath(imagePath: string): Promise<string> {
  if (imagePath.startsWith('builtin_pictures/')) {
    const appPath = app.getAppPath()
    let builtinPath = path.join(appPath, 'public', imagePath)

    if (!fs.existsSync(builtinPath)) {
      builtinPath = path.join(appPath, 'build', 'renderer', imagePath)
    }

    if (!fs.existsSync(builtinPath)) {
      builtinPath = path.join(appPath, 'renderer', imagePath)
    }

    if (fs.existsSync(builtinPath)) {
      return builtinPath
    }
    throw new Error(`Builtin picture not found: ${imagePath}`)
  }

  return imagePath.replace(/^file:\/\//, '')
}

async function downloadToFavorites(imagePath: string, title: string): Promise<string> {
  const userDataPath = app.getPath('userData')
  const favoritesDir = path.join(userDataPath, '.xrtl_desktop_wallpaper')

  if (!fs.existsSync(favoritesDir)) {
    fs.mkdirSync(favoritesDir, { recursive: true })
  }

  const ext = path.extname(imagePath) || '.jpg'
  const fileName = `${title}_${Date.now()}${ext}`
  const destPath = path.join(favoritesDir, fileName)

  const sourcePath = await resolveLocalPath(imagePath)
  fs.copyFileSync(sourcePath, destPath)

  return destPath
}

export function handleWallpaperActions() {
  ipcMain.handle('set-wallpaper', async (_, imagePath: string) => {
    try {
      const localPath = await resolveLocalPath(imagePath)
      await wallpaper.set(localPath)
      return { success: true }
    } catch (error) {
      console.error('Failed to set wallpaper:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('get-wallpapers', () => {
    return getWallpapers()
  })

  ipcMain.handle('get-favorite-wallpapers', () => {
    return getFavoriteWallpapers()
  })

  ipcMain.handle('add-wallpaper', (_, wallpaperData: Omit<Wallpaper, 'id'>) => {
    return addWallpaper(wallpaperData)
  })

  ipcMain.handle('delete-wallpaper', (_, id: number) => {
    deleteWallpaper(id)
  })

  ipcMain.handle('toggle-favorite', async (_, id: number, imageUrl: string, title: string) => {
    try {
      const wallpapers = getWallpapers()
      const wallpaper = wallpapers.find(w => w.id === id)

      if (wallpaper && wallpaper.isFavorite) {
        toggleFavorite(id)
        return { success: true, isFavorite: false }
      } else {
        const localPath = await downloadToFavorites(imageUrl, title)
        setFavoriteWithLocalPath(id, localPath)
        return { success: true, isFavorite: true, localPath }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('reset-database', () => {
    resetDatabase()
  })

  ipcMain.handle('import-wallpaper', async (_, filePath: string) => {
    try {
      const fileName = path.basename(filePath)
      const ext = path.extname(fileName)
      const title = path.basename(fileName, ext)

      const destDir = path.join(app.getPath('userData'), 'wallpapers')
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true })
      }

      const destPath = path.join(destDir, fileName)
      fs.copyFileSync(filePath, destPath)

      const wallpaperData: Omit<Wallpaper, 'id'> = {
        url: `file://${destPath}`,
        title,
        category: '自定义',
        isFavorite: false,
        createdAt: new Date().toISOString(),
      }

      return addWallpaper(wallpaperData)
    } catch (error) {
      console.error('Failed to import wallpaper:', error)
      throw error
    }
  })
}
