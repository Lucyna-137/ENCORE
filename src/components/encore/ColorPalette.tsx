import React from 'react'

const colors = [
  { name: 'Background', hex: '#F2F0EB' },
  { name: 'Section BG', hex: '#E8E5DF' },
  { name: 'Card BG', hex: '#EDEAE4' },
  { name: 'Green', hex: '#1B3C2D' },
  { name: 'Green Muted', hex: '#8BA898' },
  { name: 'Amber', hex: '#C08A4A' },
  { name: 'Text Sub', hex: '#6B6B6B' },
  { name: 'Text Muted', hex: '#AEAAA3' },
  { name: 'Border', hex: '#D8D4CD' },
  { name: 'White', hex: '#FFFFFF', outlined: true },
]

export default function ColorPalette() {
  return (
    <div className="flex flex-wrap" style={{ gap: 16 }}>
      {colors.map((c) => (
        <div key={c.hex} className="flex flex-col items-center" style={{ gap: 7, width: 88 }}>
          <div
            style={{
              width: 88,
              height: 60,
              borderRadius: 12,
              background: c.hex,
              boxShadow: c.outlined
                ? 'inset 0 0 0 1px #D8D4CD'
                : 'inset 0 0 0 1px rgba(0,0,0,0.08)',
            }}
          />
          <div
            style={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 10,
              fontWeight: 600,
              color: '#6B6B6B',
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {c.name}
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#AEAAA3' }}>
            {c.hex}
          </div>
        </div>
      ))}
    </div>
  )
}
