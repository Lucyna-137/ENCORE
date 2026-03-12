import React from 'react'

const colors = [
  { name: 'Background',   bg: 'var(--color-encore-bg)',           code: '#F2F0EB' },
  { name: 'Section BG',   bg: 'var(--color-encore-bg-section)',   code: '#E9E8E4' },
  { name: 'Green',        bg: 'var(--color-encore-green)',        code: '#1B3C2D' },
  { name: 'Green Muted',  bg: 'var(--color-encore-green-muted)',  code: '#8BA898' },
  { name: 'Amber',        bg: 'var(--color-encore-amber)',        code: '#C08A4A' },
  { name: 'Text Sub',     bg: 'var(--color-encore-text-sub)',     code: 'rgba(27,60,45,0.55)' },
  { name: 'Text Muted',   bg: 'var(--color-encore-text-muted)',   code: 'rgba(27,60,45,0.35)' },
  { name: 'Border',       bg: 'var(--color-encore-border)',       code: '#BAC2BB' },
  { name: 'Border Light', bg: 'var(--color-encore-border-light)', code: '#E4E2DD', outlined: true },
  { name: 'White',        bg: 'var(--color-encore-white)',        code: '#FFFFFF', outlined: true },
]

export default function ColorPalette() {
  return (
    <div className="flex flex-wrap" style={{ gap: 16 }}>
      {colors.map((c) => (
        <div key={c.code} className="flex flex-col items-center" style={{ gap: 7, width: 88 }}>
          <div
            style={{
              width: 88,
              height: 60,
              borderRadius: 12,
              background: c.bg,
              boxShadow: c.outlined
                ? 'inset 0 0 0 1px var(--color-encore-border)'
                : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            }}
          />
          <div
            style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--color-encore-text-sub)',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {c.name}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--color-encore-text-muted)' }}>
            {c.code}
          </div>
        </div>
      ))}
    </div>
  )
}
