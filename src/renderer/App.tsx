import { useState, useEffect } from 'react'
import Header from './components/Header'
import WallpaperGrid from './components/WallpaperGrid'
import Dialog from './components/Dialog'
import { Wallpaper } from '../shared/types'

function App() {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [favoriteWallpapers, setFavoriteWallpapers] = useState<Wallpaper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [activeTab, setActiveTab] = useState<string>('静态壁纸')
  const [dialog, setDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'info' | 'confirm'
    onConfirm?: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  })

  useEffect(() => {
    loadWallpapers()
    loadFavoriteWallpapers()
  }, [])

  useEffect(() => {
    if (activeTab === '我的') {
      loadFavoriteWallpapers()
    }
  }, [activeTab])

  const loadWallpapers = async () => {
    const data = await window.electronAPI.getWallpapers()
    setWallpapers(data)
  }

  const loadFavoriteWallpapers = async () => {
    const data = await window.electronAPI.getFavoriteWallpapers()
    setFavoriteWallpapers(data)
  }

  const handleSetWallpaper = async (url: string) => {
    const wallpaper = wallpapers.find(w => w.url === url) || favoriteWallpapers.find(w => w.url === url)
    
    let result
    if (wallpaper?.type === 'dynamic' || wallpaper?.type === 'video') {
      // 设置动态壁纸 / 视频壁纸
      result = await window.electronAPI.setDynamicWallpaper(wallpaper.url)
    } else {
      // 设置静态壁纸
      result = await window.electronAPI.setWallpaper(url)
    }
    
    if (result.success) {
      setDialog({
        isOpen: true,
        title: '设置成功',
        message: wallpaper?.type === 'dynamic' ? '动态壁纸已成功设置' : '壁纸已成功设置为桌面背景',
        type: 'info'
      })
    } else {
      setDialog({
        isOpen: true,
        title: '设置失败',
        message: `无法设置壁纸: ${result.error}`,
        type: 'info'
      })
    }
  }

  const handleToggleFavorite = async (id: number, imageUrl: string, title: string) => {
    const wallpaper = wallpapers.find(w => w.id === id)
    const result = await window.electronAPI.toggleFavorite(id, imageUrl, title)
    
    if (result.success) {
      const isFavorite = result.isFavorite
      setWallpapers(prev => prev.map(w =>
        w.id === id ? { ...w, isFavorite } : w
      ))
      setFavoriteWallpapers(prev => {
        if (isFavorite) {
          const updatedWallpaper = { ...wallpaper!, isFavorite, localPath: result.localPath }
          return [...prev, updatedWallpaper]
        } else {
          return prev.filter(w => w.id !== id)
        }
      })
      setDialog({
        isOpen: true,
        title: isFavorite ? '收藏成功' : '取消收藏',
        message: isFavorite ? '图片已保存到收藏夹' : '已从收藏夹移除',
        type: 'info'
      })
    } else {
      setDialog({
        isOpen: true,
        title: '操作失败',
        message: result.error || '无法完成收藏操作',
        type: 'info'
      })
    }
  }

  const handleImport = async () => {
    const result = await window.electronAPI.showOpenDialog()
    if (!result.canceled && result.filePaths.length > 0) {
      await window.electronAPI.importWallpaper(result.filePaths[0])
      loadWallpapers()
    }
  }



  const categories = ['全部', ...new Set(wallpapers.map(w => w.category))]

  const filteredStaticWallpapers = wallpapers.filter(w => {
    const matchSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       w.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === '全部' || w.category === selectedCategory
    return matchSearch && matchCategory && w.type === 'static'
  })

  const filteredDynamicWallpapers = wallpapers.filter(w => {
    const matchSearch = w.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       w.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCategory = selectedCategory === '全部' || w.category === selectedCategory
    return matchSearch && matchCategory && (w.type === 'dynamic' || w.type === 'video')
  })

  const renderContent = () => {
    switch (activeTab) {
      case '静态壁纸':
        return (
          <>
            <div style={{ padding: '20px 32px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '20px',
                      border: 'none',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      backgroundColor: selectedCategory === category ? '#3B82F6' : 'rgba(255,255,255,0.1)',
                      color: selectedCategory === category ? '#fff' : '#9CA3AF',
                      WebkitAppRegion: 'no-drag',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCategory !== category) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCategory !== category) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                      }
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <WallpaperGrid
              wallpapers={filteredStaticWallpapers}
              onSetWallpaper={handleSetWallpaper}
              onToggleFavorite={handleToggleFavorite}
              showDelete={false}
            />
          </>
        )
      case '动态壁纸':
        return (
          <>
            <div style={{ padding: '20px 32px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: '0 0 24px 0' }}>
                动态壁纸
              </h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0 0 24px 0' }}>
                点击设置按钮即可将动态壁纸应用到桌面
              </p>
            </div>

            <WallpaperGrid
              wallpapers={filteredDynamicWallpapers}
              onSetWallpaper={handleSetWallpaper}
              onToggleFavorite={handleToggleFavorite}
              showDelete={false}
            />
          </>
        )
      case '电脑主题':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280', fontSize: '18px' }}>
            电脑主题功能开发中...
          </div>
        )
      case '系统美化':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280', fontSize: '18px' }}>
            系统美化功能开发中...
          </div>
        )
      case '组件':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280', fontSize: '18px' }}>
            组件功能开发中...
          </div>
        )
      case '虚拟助手':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6B7280', fontSize: '18px' }}>
            虚拟助手功能开发中...
          </div>
        )
      case '我的':
        return (
          <div>
            <div style={{ padding: '20px 32px' }}>
              <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '600', margin: '0 0 20px 0' }}>我的收藏</h2>
              <p style={{ color: '#9CA3AF', fontSize: '14px', margin: '0 0 24px 0' }}>共 {favoriteWallpapers.length} 张收藏图片</p>
            </div>
            <WallpaperGrid
              wallpapers={favoriteWallpapers}
              onSetWallpaper={handleSetWallpaper}
              onToggleFavorite={handleToggleFavorite}
              showDelete={false}
            />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1a1a1a]">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onImport={handleImport}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1">
        {renderContent()}
      </div>

      <Dialog
        isOpen={dialog.isOpen}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        onConfirm={dialog.onConfirm}
        onClose={() => setDialog({ ...dialog, isOpen: false })}
      />
    </div>
  )
}

export default App
