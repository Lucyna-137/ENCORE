import React from 'react'

export default function Typography() {
  return (
    <div
      style={{
        background: '#F2F0EB',
        borderRadius: 16,
        padding: 28,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      }}
    >
      <div className="flex flex-col" style={{ gap: 20 }}>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Display<br/>32px 900 EN
          </div>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 32, fontWeight: 900, color: '#1B3C2D', letterSpacing: '-0.01em' }}>
            HELLO!
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Title<br/>24px 800 EN
          </div>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 24, fontWeight: 800, color: '#1B3C2D', letterSpacing: '0.08em' }}>
            REWARDS
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Heading<br/>18px 700 JA
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1B3C2D' }}>
            こんにちは、ユーザーさん！
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Section<br/>13px 700 EN caps
          </div>
          <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#1B3C2D' }}>
            HISTORY
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Body<br/>15px Regular
          </div>
          <div style={{ fontSize: 15, color: '#1B3C2D', lineHeight: 1.6 }}>
            クラシック・チキンシーザーサラダ
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Sub<br/>13px Regular
          </div>
          <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.55 }}>
            ロメインレタス、パルメザンチーズ、グリルドチキン
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Price<br/>15px 700
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1B3C2D' }}>
            ¥1,295
          </div>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Link<br/>14px Amber
          </div>
          <button style={{ color: '#C08A4A', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif' }}>
            これスキ！
          </button>
        </div>
        <div className="flex items-baseline" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3', flexShrink: 0, lineHeight: 1.5 }}>
            Caption<br/>11px Muted
          </div>
          <div style={{ fontSize: 11, color: '#AEAAA3' }}>
            powered by ENCORE PLATFORM
          </div>
        </div>
      </div>
    </div>
  )
}
