import { contextBridge, ipcRenderer } from 'electron'
import { Wallpaper } from '../shared/types'

contextBridge.exposeInMainWorld('electronAPI', {
  setWallpaper: (imagePath: string) => ipcRenderer.invoke('set-wallpaper', imagePath),
  getWallpapers: () => ipcRenderer.invoke('get-wallpapers'),
  getFavoriteWallpapers: () => ipcRenderer.invoke('get-favorite-wallpapers'),
  addWallpaper: (wallpaper: Omit<Wallpaper, 'id'>) => ipcRenderer.invoke('add-wallpaper', wallpaper),
  deleteWallpaper: (id: number) => ipcRenderer.invoke('delete-wallpaper', id),
  toggleFavorite: (id: number, imageUrl: string, title: string) => ipcRenderer.invoke('toggle-favorite', id, imageUrl, title),

  importWallpaper: (filePath: string) => ipcRenderer.invoke('import-wallpaper', filePath),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  // 动态壁纸相关 API
  setDynamicWallpaper: (htmlPath: string) => ipcRenderer.invoke('set-dynamic-wallpaper', htmlPath),
  closeDynamicWallpaper: () => ipcRenderer.invoke('close-dynamic-wallpaper'),
  getCurrentWallpaper: () => ipcRenderer.invoke('get-current-wallpaper'),
  // 系统美化 API
  setEffect: (effect: any) => ipcRenderer.invoke('set-effect', effect),
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

      importWallpaper: (filePath: string) => Promise<number>
      showOpenDialog: () => Promise<{ canceled: boolean; filePaths: string[] }>
      closeWindow: () => Promise<void>
      minimizeWindow: () => Promise<void>
      setDynamicWallpaper: (htmlPath: string) => Promise<{ success: boolean; error?: string }>
      closeDynamicWallpaper: () => Promise<{ success: boolean }>
      getCurrentWallpaper: () => Promise<{ currentUrl: string | null }>
      setEffect: (effect: {
        click?: string | null
        trail?: string | null
        special?: string | null
      }) => Promise<{ success: boolean }>
    }
  }
}
