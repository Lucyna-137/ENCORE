import React from 'react'

interface BarData {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarData[]
  orientation?: 'horizontal' | 'vertical'
  unit?: string
  maxValue?: number
  barColor?: string
}

export default function BarChart({ data, orientation = 'horizontal', unit = '', maxValue, barColor = 'var(--color-encore-green)' }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1)

  if (orientation === 'horizontal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((d) => (
          <div key={d.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 13, color: 'var(--color-encore-text-sub)', fontWeight: 400 }}>{d.label}</span>
              <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--color-encore-green)' }}>
                {d.value}{unit}
              </span>
            </div>
            <div style={{ height: 8, background: 'var(--color-encore-bg-section)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(d.value / max) * 100}%`,
                background: d.color ?? barColor,
                borderRadius: 999,
                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: d.value > 0 ? 4 : 0,
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // vertical
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 100 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
            {d.value > 0 && (
              <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700, color: 'var(--color-encore-green)' }}>
                {d.value}
              </span>
            )}
            <div style={{
              width: '100%',
              height: d.value > 0 ? `${Math.max((d.value / max) * 72, 4)}px` : 3,
              background: d.value > 0 ? (d.color ?? barColor) : 'var(--color-encore-bg-section)',
              borderRadius: '4px 4px 2px 2px',
              transition: 'height 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {data.map((d) => (
          <div key={d.label} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 10, color: 'var(--color-encore-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
