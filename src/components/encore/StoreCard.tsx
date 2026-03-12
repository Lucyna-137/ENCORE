'use client'

import React from 'react'
import HorizontalTabs from './HorizontalTabs'

export default function StoreCard() {
  return (
    <div style={{ background: 'var(--color-encore-bg)', borderRadius: 16, overflow: 'hidden' }}>
      <HorizontalTabs
        tabs={['🎫 チケット', '📍 会場情報']}
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
            🎪
          </div>
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 100%)',
              padding: '8px 12px',
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: 'rgba(255,255,255,0.9)',
              textTransform: 'uppercase',
            }}
          >
            Zepp Haneda
          </div>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: 'var(--color-encore-green)' }}>
          Zepp Haneda
        </div>
        <div className="flex flex-wrap gap-3" style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', marginBottom: 6 }}>
          <span>🕐 OPEN 17:00 / START 18:00</span>
          <span>·</span>
          <span style={{ color: 'var(--color-encore-green)' }}>● チケット発売中</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-encore-text-sub)', marginBottom: 12 }}>
          収容人数: 2,500名
        </div>
        <div className="flex gap-2">
          {['詳細を見る', 'チケット購入', '抽選に申込む'].map((label) => (
            <button
              key={label}
              className="flex-1 transition-colors duration-150 hover:bg-encore-border cursor-pointer"
              style={{
                height: 36,
                borderRadius: 999,
                background: 'var(--color-encore-bg-section)',
                border: '1px solid var(--color-encore-border-light)',
                fontSize: 13,
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                color: 'var(--color-encore-green)',
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
