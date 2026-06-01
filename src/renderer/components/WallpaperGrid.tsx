import { memo, useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Wallpaper } from '../../shared/types'

interface WallpaperCardProps {
  wallpaper: Wallpaper
  isHovered: boolean
  onHover: (id: number | null) => void
  onSetWallpaper: (url: string) => void
  onToggleFavorite: (id: number, imageUrl: string, title: string) => void
  showDelete?: boolean
}

function WallpaperCard({ wallpaper, isHovered, onHover, onSetWallpaper, onToggleFavorite, showDelete = false }: WallpaperCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const prevIsHoveredRef = useRef(isHovered)

  useEffect(() => {
    prevIsHoveredRef.current = isHovered
  }, [isHovered])

  const imageSrc = useMemo(() => {
    return wallpaper.localPath
      ? `local-file:///${wallpaper.localPath.replace(/\\/g, '/')}`
      : wallpaper.url.startsWith('builtin_pictures/')
      ? `./builtin_pictures/${wallpaper.url.replace('builtin_pictures/', '')}`
      : wallpaper.url
  }, [wallpaper.localPath, wallpaper.url])

  const handleSetWallpaper = useCallback(() => {
    onSetWallpaper(wallpaper.localPath || wallpaper.url)
  }, [onSetWallpaper, wallpaper.localPath, wallpaper.url])

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(wallpaper.id, wallpaper.url, wallpaper.title)
  }, [onToggleFavorite, wallpaper.id, wallpaper.url, wallpaper.title])

  const handleMouseEnter = useCallback(() => onHover(wallpaper.id), [onHover, wallpaper.id])
  const handleMouseLeave = useCallback(() => onHover(null), [onHover])

  return (
    <div
      style={{
        backgroundColor: '#1f1f1f',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          position: 'relative',
          aspectRatio: '16/10',
          overflow: 'hidden',
          backgroundColor: '#2a2a2a',
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          key={wallpaper.id}
          src={imageSrc}
          alt={wallpaper.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: isLoaded ? 'transform 0.3s ease, opacity 0.3s ease' : 'none',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            opacity: isLoaded ? '1' : '0.5',
            willChange: isHovered || prevIsHoveredRef.current ? 'transform' : 'auto',
          }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />

        <button
          onClick={handleToggleFavorite}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(0,0,0,0.6)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={wallpaper.isFavorite ? '#ef4444' : 'none'}
            stroke={wallpaper.isFavorite ? '#ef4444' : '#fff'}
            strokeWidth="2"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>

        <div style={{ position: 'absolute', top: '8px', left: '8px', color: '#fff', fontSize: '12px', fontWeight: '500', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
          {wallpaper.title}
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            right: '0',
            padding: '12px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.5), transparent)',
            opacity: isHovered ? '1' : '0',
            transition: 'opacity 0.2s ease',
            display: 'flex',
            gap: showDelete ? '8px' : '0',
          }}
        >
          <button
            style={{
              flex: 1,
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#3B82F6',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
            onClick={handleSetWallpaper}
          >
            设为壁纸
          </button>
        </div>
      </div>
    </div>
  )
}

const WallpaperCardMemo = memo(WallpaperCard, (prevProps, nextProps) => {
  if (prevProps.wallpaper.id !== nextProps.wallpaper.id) return false
  if (prevProps.isHovered !== nextProps.isHovered) return false
  if (prevProps.wallpaper.isFavorite !== nextProps.wallpaper.isFavorite) return false
  if (prevProps.showDelete !== nextProps.showDelete) return false
  return true
})

interface WallpaperGridProps {
  wallpapers: Wallpaper[]
  onSetWallpaper: (url: string) => void
  onToggleFavorite: (id: number, imageUrl: string, title: string) => void
  showDelete?: boolean
}

function WallpaperGrid({ wallpapers, onSetWallpaper, onToggleFavorite, showDelete = false }: WallpaperGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  const handleHover = useCallback((id: number | null) => {
    setHoveredId(id)
  }, [])

  const handleSetWallpaper = useCallback((url: string) => {
    onSetWallpaper(url)
  }, [onSetWallpaper])

  const handleToggleFavorite = useCallback((id: number, imageUrl: string, title: string) => {
    onToggleFavorite(id, imageUrl, title)
  }, [onToggleFavorite])

  if (wallpapers.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px' }}>
        <svg style={{ width: '64px', height: '64px', color: '#4B5563', marginBottom: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p style={{ color: '#6B7280', fontSize: '18px', margin: '0' }}>暂无壁纸</p>
        <p style={{ color: '#4B5563', fontSize: '14px', marginTop: '4px' }}>点击右上角导入按钮添加壁纸</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '0 24px 24px', backgroundColor: '#1a1a1a', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {wallpapers.map(wallpaper => (
            <WallpaperCardMemo
              key={wallpaper.id}
              wallpaper={wallpaper}
              isHovered={hoveredId === wallpaper.id}
              onHover={handleHover}
              onSetWallpaper={handleSetWallpaper}
              onToggleFavorite={handleToggleFavorite}
              showDelete={showDelete}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default memo(WallpaperGrid)