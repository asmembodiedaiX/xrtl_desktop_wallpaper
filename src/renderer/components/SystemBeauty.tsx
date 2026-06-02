import { useState } from 'react'
import Toast from './Toast'

interface Effect {
  id: string
  name: string
  icon: string
  color: string
}

const clickEffects: Effect[] = [
  { id: 'none', name: '无效果', icon: '🚫', color: '#6B7280' },
  { id: 'ripple', name: '涟漪扩散', icon: '🌊', color: '#60A5FA' },
  { id: 'stars', name: '星光闪耀', icon: '✨', color: '#FFD700' },
  { id: 'hearts', name: '爱心飘散', icon: '💕', color: '#FF69B4' },
  { id: 'confetti', name: '五彩纸屑', icon: '🎉', color: '#FF6347' },
  { id: 'sakura', name: '樱花飘落', icon: '🌸', color: '#FFB7C5' },
  { id: 'snowflake', name: '雪花纷飞', icon: '❄️', color: '#E0FFFF' },
  { id: 'firework', name: '烟花绽放', icon: '🎆', color: '#FF4500' },
]

const trailEffects: Effect[] = [
  { id: 'none', name: '无效果', icon: '🚫', color: '#6B7280' },
  { id: 'particles', name: '粒子轨迹', icon: '⚛️', color: '#9370DB' },
  { id: 'rainbow', name: '彩虹拖尾', icon: '🌈', color: '#FF6B6B' },
  { id: 'glow', name: '荧光闪烁', icon: '💡', color: '#00FFFF' },
  { id: 'ink', name: '墨迹飘散', icon: '🖋️', color: '#2F4F4F' },
  { id: 'neon', name: '霓虹光轨', icon: '💫', color: '#FF00FF' },
  { id: 'petal', name: '花瓣跟随', icon: '🌺', color: '#FF69B4' },
]

const specialEffects: Effect[] = [
  { id: 'none', name: '无效果', icon: '🚫', color: '#6B7280' },
  { id: 'snow', name: '桌面下雪', icon: '❄️', color: '#E0FFFF' },
  { id: 'rain', name: '屏幕雨滴', icon: '🌧️', color: '#87CEEB' },
  { id: 'bubbles', name: '跟随气泡', icon: '🫧', color: '#ADD8E6' },
  { id: 'fire', name: '火焰粒子', icon: '🔥', color: '#FF4500' },
  { id: 'halo', name: '鼠标光环', icon: '💫', color: '#FFD700' },
  { id: 'visualizer', name: '音频律动', icon: '🎵', color: '#6366F1' },
]

function SystemBeauty() {
  const [activeTab, setActiveTab] = useState('点击特效')
  const [clickEffect, setClickEffect] = useState('ripple')
  const [trailEffect, setTrailEffect] = useState('particles')
  const [specialEffect, setSpecialEffect] = useState('none')
  const [toast, setToast] = useState({ show: false, message: '' })

  const tabs = ['点击特效', '拖尾特效', '场景特效']

  const s = (msg: string) => {
    setToast({ show: true, message: msg })
    setTimeout(() => setToast({ show: false, message: '' }), 2000)
  }

  const applyClick = async (id: string) => {
    const e = clickEffects.find(c => c.id === id)
    const r = await window.electronAPI.setEffect({ click: id === 'none' ? null : id })
    if (!r.success) { s(r.error || '设置失败'); return }
    setClickEffect(id)
    s(e ? `点击特效: ${e.name}` : '已关闭点击特效')
  }

  const applyTrail = async (id: string) => {
    const e = trailEffects.find(t => t.id === id)
    const r = await window.electronAPI.setEffect({ trail: id === 'none' ? null : id })
    if (!r.success) { s(r.error || '设置失败'); return }
    setTrailEffect(id)
    s(e ? `拖尾特效: ${e.name}` : '已关闭拖尾特效')
  }

  const applySpecial = async (id: string) => {
    const e = specialEffects.find(s => s.id === id)
    const r = await window.electronAPI.setEffect({ special: id === 'none' ? null : id })
    if (!r.success) { s(r.error || '设置失败'); return }
    setSpecialEffect(id)
    s(e ? `场景特效: ${e.name}` : '已关闭场景特效')
  }

  const clearAll = async () => {
    setClickEffect('none')
    setTrailEffect('none')
    setSpecialEffect('none')
    await window.electronAPI.setEffect({ click: null, trail: null, special: null })
    s('已清除全部美化效果')
  }

  const applied = [clickEffect !== 'none' ? 1 : 0, trailEffect !== 'none' ? 1 : 0, specialEffect !== 'none' ? 1 : 0].reduce((a, b) => a + b, 0)

  const currentList = activeTab === '点击特效' ? clickEffects : activeTab === '拖尾特效' ? trailEffects : specialEffects
  const currentSelected = activeTab === '点击特效' ? clickEffect : activeTab === '拖尾特效' ? trailEffect : specialEffect
  const currentApply = activeTab === '点击特效' ? applyClick : activeTab === '拖尾特效' ? applyTrail : applySpecial

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 10, padding: '14px 24px', background: 'rgba(0,0,0,0.15)' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              borderRadius: 20, border: 'none', transition: 'all 0.2s',
              background: activeTab === tab ? 'rgba(99,102,241,0.9)' : 'rgba(255,255,255,0.06)',
              color: activeTab === tab ? '#fff' : '#a1a1aa',
              boxShadow: activeTab === tab ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Effect cards */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexWrap: 'wrap', gap: 18, alignContent: 'flex-start' }}>
        {currentList.map(e => {
          const isActive = currentSelected === e.id
          return (
            <div
              key={e.id}
              onClick={() => currentApply(e.id)}
              style={{
                width: 130, height: 140, borderRadius: 16,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, cursor: 'pointer', transition: 'all 0.25s ease',
                background: isActive ? `${e.color}22` : 'rgba(30,30,46,0.7)',
                border: isActive ? `2px solid ${e.color}` : '2px solid rgba(255,255,255,0.06)',
                boxShadow: isActive ? `0 0 24px ${e.color}44` : '0 4px 16px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: 38, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{e.icon}</span>
              <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{e.name}</span>
              {isActive && (
                <span style={{
                  fontSize: 10, color: e.color, fontWeight: 700,
                  padding: '2px 10px', borderRadius: 10, background: `${e.color}22`,
                }}>生效中</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>已启用</span>
          <span style={{
            padding: '3px 12px', borderRadius: 20,
            background: applied > 0 ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#374151',
            color: '#fff', fontSize: 12, fontWeight: 700,
          }}>{applied} 项</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={clearAll}
            style={{
              padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              border: 'none', background: 'rgba(75,85,99,0.5)', color: '#d1d5db',
            }}
          >清除全部</button>
        </div>
      </div>

      <Toast message={toast.message} isVisible={toast.show} onClose={() => setToast({ show: false, message: '' })} />
    </div>
  )
}

export default SystemBeauty
