import { useEffect } from 'react'

interface DialogProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'info' | 'confirm'
  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
}

function Dialog({ isOpen, title, message, type = 'info', onConfirm, onCancel, onClose }: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div 
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '9999',
        WebkitAppRegion: 'no-drag',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#1f1f1f',
          borderRadius: '12px',
          padding: '24px',
          minWidth: '320px',
          maxWidth: '480px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          border: '1px solid #374151',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ 
          color: '#fff', 
          fontSize: '18px', 
          fontWeight: '600', 
          margin: '0 0 12px 0' 
        }}>
          {title}
        </h3>
        <p style={{ 
          color: '#9CA3AF', 
          fontSize: '14px', 
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          {type === 'confirm' && onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '10px 24px',
                borderRadius: '6px',
                border: '1px solid #4B5563',
                backgroundColor: 'transparent',
                color: '#9CA3AF',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                WebkitAppRegion: 'no-drag',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#374151';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#9CA3AF';
              }}
            >
              取消
            </button>
          )}
          <button
            onClick={type === 'confirm' ? onConfirm : onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#3B82F6',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              WebkitAppRegion: 'no-drag',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6';
            }}
          >
            {type === 'confirm' ? '确定' : '知道了'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dialog