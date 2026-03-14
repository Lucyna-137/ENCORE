import React from 'react'
import * as ty from './typographyStyles'
import { ArtistAvatar } from './ArtistCard'

interface BarData {
  label: string
  value: number
  color?: string
  image?: string
  avatarColor?: string
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
  const total = data.reduce((s, d) => s + d.value, 0)

  if (orientation === 'horizontal') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ArtistAvatar name={d.label} color={d.avatarColor ?? d.color ?? 'var(--color-encore-green)'} size="sm" image={d.image} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={ty.body}>{d.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ ...ty.caption, fontWeight: 700 }}>
                    {d.value}{unit}
                  </span>
                  <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 11, fontWeight: 700, color: d.color ?? barColor }}>
                    {Math.round((d.value / total) * 100)}%
                  </span>
                </div>
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
              <span style={ty.caption}>
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
          <div key={d.label} style={{ ...ty.caption, flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
