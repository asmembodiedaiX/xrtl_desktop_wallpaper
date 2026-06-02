export interface Wallpaper {
  id: number
  url: string
  title: string
  category: string
  isFavorite: boolean
  localPath?: string
  type: 'static' | 'dynamic' | 'video'
  createdAt: string
}
