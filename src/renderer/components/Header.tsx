interface HeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onImport: () => void
  onResetDatabase: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

function Header({ searchTerm, onSearchChange, onImport, onResetDatabase, activeTab, onTabChange }: HeaderProps) {
  const navItems = [
    { name: '动态壁纸' },
    { name: '静态壁纸' },
    { name: '电脑主题' },
    { name: '系统美化' },
    { name: '组件' },
    { name: '虚拟助手' },
    { name: '我的' },
  ]

  const handleClose = async () => {
    await window.electronAPI.closeWindow()
  }

  return (
    <header style={{
      width: '100%',
      minHeight: '50px',
      backgroundColor: '#374151',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      boxSizing: 'border-box',
      borderBottom: '1px solid #4B5563',
      WebkitAppRegion: 'drag',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', WebkitAppRegion: 'drag' }}>
        <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>祥龙桌面</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1', justifyContent: 'center', WebkitAppRegion: 'drag' }}>
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={() => onTabChange(item.name)}
            style={{
              padding: '6px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: activeTab === item.name ? '#FACC15' : 'transparent',
              color: activeTab === item.name ? '#000' : '#9CA3AF',
              transition: 'all 0.2s',
              WebkitAppRegion: 'no-drag',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== item.name) {
                e.currentTarget.style.backgroundColor = '#4B5563';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== item.name) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.name}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', WebkitAppRegion: 'drag' }}>
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        </button>
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>
        <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </button>
        <button
          onClick={onResetDatabase}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}
          title="重置数据库"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={handleClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div style={{ width: '1px', height: '24px', backgroundColor: '#4B5563' }} />

        <div style={{ position: 'relative', WebkitAppRegion: 'drag' }}>
          <input
            type="text"
            placeholder="请输入关键字"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '192px',
              padding: '6px 8px 6px 12px',
              borderRadius: '20px',
              border: '1px solid #4B5563',
              backgroundColor: '#1F2937',
              color: '#fff',
              fontSize: '14px',
              outline: 'none',
              WebkitAppRegion: 'no-drag',
            }}
          />
          <button style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
