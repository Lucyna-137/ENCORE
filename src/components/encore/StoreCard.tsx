'use client'

import React from 'react'
import HorizontalTabs from './HorizontalTabs'

export default function StoreCard() {
  return (
    <div style={{ background: '#F2F0EB', borderRadius: 16, overflow: 'hidden' }}>
      <HorizontalTabs
        tabs={['🏠 ピックアップ', '🛵 デリバリー']}
        defaultActive={0}
      />
      <div style={{ padding: '16px 20px' }}>
        <div
          className="relative overflow-hidden"
          style={{
            width: '100%',
            height: 130,
            background: 'linear-gradient(135deg, #BDB8AF, #A8A49D)',
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <div
            className="absolute"
            style={{ fontSize: 40, top: '50%', left: '50%', transform: 'translate(-50%,-60%)' }}
          >
            🏪
          </div>
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
              padding: '8px 12px',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.9)',
              textTransform: 'uppercase',
            }}
          >
            COREDO Muromachi Terrace
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: '#1B3C2D' }}>
          コレド室町テラス店
        </div>
        <div className="flex flex-wrap gap-3" style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 6 }}>
          <span>🕐 11:00–22:00</span>
          <span>·</span>
          <span style={{ color: '#1B3C2D' }}>● 営業中</span>
        </div>
        <div style={{ fontSize: 12, color: '#6B6B6B', marginBottom: 12 }}>
          いまなら5・15分で提供できます
        </div>
        <div className="flex gap-2">
          {['店舗で食べる', '持ち帰る', '予約する'].map((label) => (
            <button
              key={label}
              className="flex-1 transition-colors duration-150 hover:bg-[#D8D4CD] cursor-pointer"
              style={{
                height: 36,
                borderRadius: 999,
                background: '#E8E5DF',
                border: '1px solid #D8D4CD',
                fontSize: 13,
                fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
                color: '#1B3C2D',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
