'use client'

import React from 'react'
import * as ty from './typographyStyles'
import { ArtistAvatar } from './ArtistCard'

interface PieSlice {
  label: string
  value: number
  color: string
  image?: string
  avatarColor?: string
}

interface PieChartProps {
  data: PieSlice[]
  totalLabel?: string
  unit?: string
}

const SIZE = 260
const CENTER = SIZE / 2
const RADIUS = 78
const STROKE = 13
const CIRC = 2 * Math.PI * RADIUS
const GAP = 4
const AVATAR_ORBIT = RADIUS + STROKE / 2 + 26

export default function PieChart({ data, totalLabel = 'TOTAL LIVES', unit = '回' }: PieChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)

  let cumValue = 0
  const segments = data.map(d => {
    const segLen = Math.max((d.value / total) * CIRC - GAP, 0)
    const dashOffset = -((cumValue / total) * CIRC)
    const midAngle = ((cumValue + d.value / 2) / total) * 2 * Math.PI - Math.PI / 2
    const ax = CENTER + AVATAR_ORBIT * Math.cos(midAngle)
    const ay = CENTER + AVATAR_ORBIT * Math.sin(midAngle)
    cumValue += d.value
    return { ...d, segLen, dashOffset, ax, ay, ratio: d.value / total }
  })

  return (
    <div style={{ background: 'var(--color-encore-bg)', borderRadius: 8, overflow: 'hidden', padding: '28px 0' }}>

      {/* ドーナツチャート */}
      <div style={{ position: 'relative', width: SIZE, height: SIZE, margin: '0 auto' }}>
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ display: 'block' }}
        >
          {/* トラック（背景リング） */}
          <circle
            cx={CENTER} cy={CENTER} r={RADIUS}
            fill="none"
            stroke="var(--color-encore-bg-section)"
            strokeWidth={STROKE}
          />
          {/* セグメント */}
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx={CENTER} cy={CENTER} r={RADIUS}
                fill="none"
                stroke={seg.color}
                strokeWidth={STROKE}
                strokeDasharray={`${seg.segLen} ${CIRC}`}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }}
              />
            ))}
          </g>
        </svg>

        {/* 中央テキスト */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{
            ...ty.captionMuted,
            fontSize: 9,
            letterSpacing: '0.08em',
            marginBottom: 4,
          }}>
            {totalLabel}
          </div>
          <div style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 40,
            fontWeight: 700,
            color: 'var(--color-encore-green)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {total}
          </div>
          <div style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--color-encore-green)',
            marginTop: 4,
            letterSpacing: '0.06em',
          }}>
            {data.length} ARTISTS
          </div>
        </div>

        {/* アバター（リング外周） */}
        {segments.map((seg, i) => (
          <div
            key={i}
            className="encore-float"
            style={{
              position: 'absolute',
              left: seg.ax - 18,
              top: seg.ay - 18,
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
              animationDelay: `${i * 0.6}s`,
            }}
          >
            <ArtistAvatar name={seg.label} color={seg.avatarColor ?? seg.color} size="sm" image={seg.image} />
          </div>
        ))}
      </div>

    </div>
  )
}
