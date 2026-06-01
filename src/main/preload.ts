import { contextBridge, ipcRenderer } from 'electron'
import { Wallpaper } from '../shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  setWallpaper: (imagePath: string) => ipcRenderer.invoke('set-wallpaper', imagePath),
  getWallpapers: () => ipcRenderer.invoke('get-wallpapers'),
  getFavoriteWallpapers: () => ipcRenderer.invoke('get-favorite-wallpapers'),
  addWallpaper: (wallpaper: Omit<Wallpaper, 'id'>) => ipcRenderer.invoke('add-wallpaper', wallpaper),
  deleteWallpaper: (id: number) => ipcRenderer.invoke('delete-wallpaper', id),
  toggleFavorite: (id: number, imageUrl: string, title: string) => ipcRenderer.invoke('toggle-favorite', id, imageUrl, title),
  resetDatabase: () => ipcRenderer.invoke('reset-database'),
  importWallpaper: (filePath: string) => ipcRenderer.invoke('import-wallpaper', filePath),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
})

declare global {
  interface Window {
    electronAPI: {
      setWallpaper: (imagePath: string) => Promise<{ success: boolean; error?: string }>
      getWallpapers: () => Promise<Wallpaper[]>
      getFavoriteWallpapers: () => Promise<Wallpaper[]>
      addWallpaper: (wallpaper: Omit<Wallpaper, 'id'>) => Promise<number>
      deleteWallpaper: (id: number) => Promise<void>
      toggleFavorite: (id: number, imageUrl: string, title: string) => Promise<{ success: boolean; localPath?: string; error?: string }>
      resetDatabase: () => Promise<void>
      importWallpaper: (filePath: string) => Promise<number>
      showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>
      closeWindow: () => Promise<void>
    }
  }
}
