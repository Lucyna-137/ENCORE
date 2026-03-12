import React from 'react'

const EN = 'var(--font-google-sans), sans-serif'
const JA = 'var(--font-google-sans), var(--font-noto-jp), sans-serif'

export default function Typography() {
  return (
    <div
      style={{
        background: 'var(--color-encore-bg)',
        borderRadius: 16,
        padding: 28,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex flex-col" style={{ gap: 20 }}>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Display<br/>32px 900 EN
          </div>
          <div style={{ fontFamily: EN, fontSize: 32, fontWeight: 700, color: 'var(--color-encore-green)', letterSpacing: '-0.01em' }}>
            HELLO!
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Title<br/>24px 800 EN
          </div>
          <div style={{ fontFamily: EN, fontSize: 24, fontWeight: 700, color: 'var(--color-encore-green)', letterSpacing: '0.08em' }}>
            REWARDS
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Heading<br/>18px 700 JA
          </div>
          <div style={{ fontFamily: JA, fontSize: 18, fontWeight: 700, color: 'var(--color-encore-green)' }}>
            こんにちは、ユーザーさん！
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Section<br/>13px 700 EN caps
          </div>
          <div style={{ fontFamily: EN, fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: 'var(--color-encore-green)' }}>
            HISTORY
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Body<br/>15px Regular
          </div>
          <div style={{ fontFamily: JA, fontSize: 15, color: 'var(--color-encore-green)', lineHeight: 1.6 }}>
            Vaundy LIVE TOUR 2026
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Sub<br/>13px Regular
          </div>
          <div style={{ fontFamily: JA, fontSize: 13, color: 'rgba(27,60,45,0.55)', lineHeight: 1.55 }}>
            Zepp Haneda・2026年4月12日(土)
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Price<br/>15px 700
          </div>
          <div style={{ fontFamily: EN, fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>
            ¥1,295
          </div>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Link<br/>14px Amber
          </div>
          <button style={{ color: 'var(--color-encore-amber)', fontSize: 14, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2, background: 'none', border: 'none', fontFamily: JA }}>
            これスキ！
          </button>
        </div>
        <div className="flex items-start" style={{ gap: 20 }}>
          <div style={{ width: 130, fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)', flexShrink: 0, lineHeight: 1.5 }}>
            Caption<br/>11px Muted
          </div>
          <div style={{ fontFamily: EN, fontSize: 11, color: 'rgba(27,60,45,0.35)' }}>
            powered by ENCORE PLATFORM
          </div>
        </div>
      </div>
    </div>
  )
}
