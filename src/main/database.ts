import initSqlJs, { Database } from 'sql.js'
import * as path from 'path'
import * as fs from 'fs'
import { app } from 'electron'
import { Wallpaper } from '../shared/types'

let db: Database | null = null
let dbPath: string = ''

export async function setupDatabase() {
  const SQL = await initSqlJs()
  dbPath = path.join(app.getPath('userData'), 'wallpapers.db')

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath)
    db = new SQL.Database(buffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS wallpapers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      isFavorite INTEGER DEFAULT 0,
      localPath TEXT,
      createdAt TEXT NOT NULL
    )
  `)

  initializeDefaultWallpapers()
  saveDatabase()
}

function initializeDefaultWallpapers() {
  if (!db) return

  const result = db.exec('SELECT COUNT(*) as count FROM wallpapers')
  const count = result.length > 0 ? result[0].values[0][0] : 0

  if (Number(count) > 0) return

  const defaultWallpapers = [
    { url: 'builtin_pictures/FragPunk游戏海报3840_2160.jpg', title: '游戏海报', category: '游戏' },
    { url: 'builtin_pictures/拾光_中转站_685a0dd18fb6a08a.jpg', title: '中转站', category: '精选' },
    { url: 'builtin_pictures/拾光_中转站_b05b9d5ad24f4333.jpg', title: '中转站', category: '精选' },
    { url: 'builtin_pictures/拾光_中转站_cd0db773eb2dc1b0.jpg', title: '中转站', category: '精选' },
    { url: 'builtin_pictures/拾光_中转站_e05ebd93369ce542.jpg', title: '中转站', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_0f31d889bd773c2e.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_165c1f99d53d37d5.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_1c65880ded50f92e.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_2190e97d1adc6259.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_32be392dd7964f94.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_371351206c419e50.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_4768f506b8331305.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_59a4c624eee8318a.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_62b1522c475ac8fc.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_84d955e3913f1a3e.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_ab50601615cbad2b.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_d45dd55bed75f892.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_e2189124fdd8f467.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_e5b75945c042bfb1.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_f6c40597f933a2d6.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_周度精选_fe85a21ba86081db.jpg', title: '周度精选', category: '精选' },
    { url: 'builtin_pictures/拾光_壁纸汇_e16f6202eb5bd42f.jpg', title: '壁纸汇', category: '精选' },
    { url: 'builtin_pictures/拾光_彼岸图网_6b17e2152a7fe9f2.jpg', title: '彼岸图网', category: '精选' },
    { url: 'builtin_pictures/拾光_轻壁纸_b506c02718d4b29b.jpg', title: '轻壁纸', category: '精选' },
    { url: 'builtin_pictures/拾光_轻壁纸_f87de1fd3d3c7a01.jpg', title: '轻壁纸', category: '精选' },
    { url: 'builtin_pictures/由内而外2字符海报超宽m.jpg', title: '字符海报', category: '艺术' },
  ]

  defaultWallpapers.forEach(wallpaper => {
    db!.run(
      'INSERT INTO wallpapers (url, title, category, isFavorite, localPath, createdAt) VALUES (?, ?, ?, 0, NULL, ?)',
      [wallpaper.url, wallpaper.title, wallpaper.category, new Date().toISOString()]
    )
  })
}

function saveDatabase() {
  if (!db) return
  const data = db.export()
  const buffer = Buffer.from(data)
  fs.writeFileSync(dbPath, buffer)
}

export function getWallpapers(): Wallpaper[] {
  if (!db) return []
  const result = db.exec('SELECT * FROM wallpapers ORDER BY createdAt DESC')
  if (result.length === 0) return []

  return result[0].values.map((row: (string | number | Uint8Array | null)[]) => ({
    id: row[0] as number,
    url: row[1] as string,
    title: row[2] as string,
    category: row[3] as string,
    isFavorite: Boolean(row[4]),
    localPath: row[5] as string | undefined,
    createdAt: row[6] as string
  }))
}

export function getFavoriteWallpapers(): Wallpaper[] {
  if (!db) return []
  const result = db.exec('SELECT * FROM wallpapers WHERE isFavorite = 1 ORDER BY createdAt DESC')
  if (result.length === 0) return []

  return result[0].values.map((row: (string | number | Uint8Array | null)[]) => ({
    id: row[0] as number,
    url: row[1] as string,
    title: row[2] as string,
    category: row[3] as string,
    isFavorite: Boolean(row[4]),
    localPath: row[5] as string | undefined,
    createdAt: row[6] as string
  }))
}

export function addWallpaper(wallpaper: Omit<Wallpaper, 'id'>): number {
  if (!db) return -1
  db.run(
    'INSERT INTO wallpapers (url, title, category, isFavorite, localPath, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [wallpaper.url, wallpaper.title, wallpaper.category, wallpaper.isFavorite ? 1 : 0, wallpaper.localPath || null, wallpaper.createdAt]
  )
  saveDatabase()

  const result = db.exec('SELECT last_insert_rowid()')
  return result[0].values[0][0] as number
}

export function deleteWallpaper(id: number): void {
  if (!db) return
  db.run('DELETE FROM wallpapers WHERE id = ?', [id])
  saveDatabase()
}

export function toggleFavorite(id: number, localPath?: string): void {
  if (!db) return
  if (localPath) {
    db.run('UPDATE wallpapers SET isFavorite = 1, localPath = ? WHERE id = ?', [localPath, id])
  } else {
    db.run('UPDATE wallpapers SET isFavorite = 1 - isFavorite WHERE id = ?', [id])
  }
  saveDatabase()
}

export function setFavoriteWithLocalPath(id: number, localPath: string): void {
  if (!db) return
  db.run('UPDATE wallpapers SET isFavorite = 1, localPath = ? WHERE id = ?', [localPath, id])
  saveDatabase()
}

export function resetDatabase(): void {
  if (!db) return
  db.run('DELETE FROM wallpapers')
  initializeDefaultWallpapers()
  saveDatabase()
}
