import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { Wallpaper } from '../shared/types'

interface WallpaperConfig {
  wallpapers: Wallpaper[]
}

let configPath: string = ''
let config: WallpaperConfig = { wallpapers: [] }

function getDefaultWallpapers(): Wallpaper[] {
  return [
    { id: 1, url: 'builtin_pictures/FragPunk游戏海报3840_2160.jpg', title: '游戏海报', category: '游戏', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 2, url: 'builtin_pictures/拾光_中转站_685a0dd18fb6a08a.jpg', title: '中转站', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 3, url: 'builtin_pictures/拾光_中转站_b05b9d5ad24f4333.jpg', title: '中转站', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 4, url: 'builtin_pictures/拾光_中转站_cd0db773eb2dc1b0.jpg', title: '中转站', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 5, url: 'builtin_pictures/拾光_中转站_e05ebd93369ce542.jpg', title: '中转站', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 6, url: 'builtin_pictures/拾光_周度精选_0f31d889bd773c2e.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 7, url: 'builtin_pictures/拾光_周度精选_165c1f99d53d37d5.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 8, url: 'builtin_pictures/拾光_周度精选_1c65880ded50f92e.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 9, url: 'builtin_pictures/拾光_周度精选_2190e97d1adc625e.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 10, url: 'builtin_pictures/拾光_周度精选_32be392dd7964f94.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 11, url: 'builtin_pictures/拾光_周度精选_371351206c419e50.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 12, url: 'builtin_pictures/拾光_周度精选_4768f506b8331305.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 13, url: 'builtin_pictures/拾光_周度精选_59a4c624eee8318a.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 14, url: 'builtin_pictures/拾光_周度精选_62b1522c475ac8fc.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 15, url: 'builtin_pictures/拾光_周度精选_84d955e3913f1a3e.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 16, url: 'builtin_pictures/拾光_周度精选_ab50601615cbad2b.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 17, url: 'builtin_pictures/拾光_周度精选_d45dd55bed75f892.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 18, url: 'builtin_pictures/拾光_周度精选_e2189124fdd8f467.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 19, url: 'builtin_pictures/拾光_周度精选_e5b75945c042bfb1.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 20, url: 'builtin_pictures/拾光_周度精选_f6c40597f933a2d6.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 21, url: 'builtin_pictures/拾光_周度精选_fe85a21ba86081db.jpg', title: '周度精选', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 22, url: 'builtin_pictures/拾光_壁纸汇_e16f6202eb5bd42f.jpg', title: '壁纸汇', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 23, url: 'builtin_pictures/拾光_彼岸图网_6b17e2152a7fe9f2.jpg', title: '彼岸图网', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 24, url: 'builtin_pictures/拾光_轻壁纸_b506c02718d4b29b.jpg', title: '轻壁纸', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 25, url: 'builtin_pictures/拾光_轻壁纸_f87de1fd3d3c7a01.jpg', title: '轻壁纸', category: '精选', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 26, url: 'builtin_pictures/由内而外2字符海报超宽m.jpg', title: '字符海报', category: '艺术', isFavorite: false, localPath: undefined, type: 'static', createdAt: new Date().toISOString() },
    { id: 27, url: 'dynamic_pages/particle_rain.html', title: '粒子雨', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 28, url: 'dynamic_pages/waves.html', title: '波浪', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 29, url: 'dynamic_pages/galaxy.html', title: '星系', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 30, url: 'dynamic_pages/fireworks.html', title: '烟花', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 31, url: 'dynamic_pages/nebula.html', title: '星云', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 32, url: 'dynamic_pages/aurora.html', title: '极光', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 33, url: 'dynamic_pages/grid.html', title: '网格', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 34, url: 'dynamic_pages/spiral.html', title: '螺旋', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 35, url: 'dynamic_pages/snow.html', title: '雪花', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 36, url: 'dynamic_pages/bubbles.html', title: '气泡', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 37, url: 'dynamic_pages/fire.html', title: '火焰', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 38, url: 'dynamic_pages/matrix.html', title: '矩阵', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 39, url: 'dynamic_pages/rainbow.html', title: '彩虹', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 40, url: 'dynamic_pages/pulse.html', title: '脉冲', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 41, url: 'dynamic_pages/rotating_galaxy.html', title: '旋转星系', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 42, url: 'dynamic_pages/vortex.html', title: '漩涡', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 43, url: 'dynamic_pages/lightning.html', title: '闪电', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 44, url: 'dynamic_pages/aurora_wave.html', title: '极光波动', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 45, url: 'dynamic_pages/sound_wave.html', title: '声波', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 46, url: 'dynamic_pages/raindrops.html', title: '雨滴', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 47, url: 'dynamic_pages/sunrise.html', title: '日出', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 48, url: 'dynamic_pages/star_trails.html', title: '星轨', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
    { id: 49, url: 'dynamic_pages/geometry.html', title: '几何', category: '动态', isFavorite: false, localPath: undefined, type: 'dynamic', createdAt: new Date().toISOString() },
  ]
}

function saveConfig(): void {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8')
  } catch (e) {
    console.error('Failed to save config:', e)
  }
}

function getNextId(): number {
  if (config.wallpapers.length === 0) return 1
  return Math.max(...config.wallpapers.map(w => w.id)) + 1
}

export async function setupConfiguration(): Promise<void> {
  configPath = path.join(app.getPath('userData'), 'wallpapers.json')

  const defaultWallpapers = getDefaultWallpapers()

  if (fs.existsSync(configPath)) {
    try {
      const data = fs.readFileSync(configPath, 'utf-8')
      config = JSON.parse(data)

      const existingDynamicCount = config.wallpapers.filter(w => w.type === 'dynamic').length
      const defaultDynamicCount = defaultWallpapers.filter(w => w.type === 'dynamic').length

      if (existingDynamicCount !== defaultDynamicCount) {
        console.log('Dynamic wallpapers count mismatch, updating config')
        const staticWallpapers = config.wallpapers.filter(w => w.type !== 'dynamic')
        const newDynamicWallpapers = defaultWallpapers.filter(w => w.type === 'dynamic')
        config = { wallpapers: [...staticWallpapers, ...newDynamicWallpapers] }
        saveConfig()
      }

      console.log('Config loaded successfully')
    } catch (e) {
      console.log('Failed to load config, using defaults:', e)
      config = { wallpapers: defaultWallpapers }
      saveConfig()
    }
  } else {
    config = { wallpapers: defaultWallpapers }
    saveConfig()
    console.log('New config file created')
  }
}

export function getWallpapers(): Wallpaper[] {
  return [...config.wallpapers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getFavoriteWallpapers(): Wallpaper[] {
  return config.wallpapers
    .filter(w => w.isFavorite)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function addWallpaper(wallpaper: Omit<Wallpaper, 'id'>): number {
  const newWallpaper: Wallpaper = {
    ...wallpaper,
    id: getNextId(),
    createdAt: new Date().toISOString()
  }
  config.wallpapers.push(newWallpaper)
  saveConfig()
  return newWallpaper.id
}

export function deleteWallpaper(id: number): void {
  config.wallpapers = config.wallpapers.filter(w => w.id !== id)
  saveConfig()
}

export function toggleFavorite(id: number, localPath?: string): void {
  const wallpaper = config.wallpapers.find(w => w.id === id)
  if (wallpaper) {
    if (localPath) {
      wallpaper.isFavorite = true
      wallpaper.localPath = localPath
    } else {
      wallpaper.isFavorite = !wallpaper.isFavorite
    }
    saveConfig()
  }
}

export function setFavoriteWithLocalPath(id: number, localPath: string): void {
  const wallpaper = config.wallpapers.find(w => w.id === id)
  if (wallpaper) {
    wallpaper.isFavorite = true
    wallpaper.localPath = localPath
    saveConfig()
  }
}

