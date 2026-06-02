import { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  duration?: number
}

function Toast({ message, isVisible, onClose, duration = 2000 }: ToastProps) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShow(true)
      const timer = setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        left: '50%',
        transform: show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-20px)',
        opacity: show ? 1 : 0,
        transition: 'all 0.3s ease',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          padding: '12px 24px',
          borderRadius: '8px',
          backgroundColor: 'rgba(30, 30, 46, 0.95)',
          color: '#ffffff',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        {message}
      </div>
    </div>
  )
}

export default Toast
