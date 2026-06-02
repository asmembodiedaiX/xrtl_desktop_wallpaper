interface HeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onImport: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

function Header({ searchTerm, onSearchChange, onImport, activeTab, onTabChange }: HeaderProps) {
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
        {/* 导入按钮：支持图片/视频/HTML */}
        <button
          onClick={onImport}
          title="导入壁纸（图片/视频/HTML）"
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            WebkitAppRegion: 'no-drag',
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#60A5FA' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 4v16m0 0l-6-6m6 6l6-6" strokeWidth="2" />
            <path d="M4 12h16" strokeWidth="0" />
          </svg>
        </button>

        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9CA3AF', WebkitAppRegion: 'no-drag' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#9CA3AF';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 12h12" />
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
