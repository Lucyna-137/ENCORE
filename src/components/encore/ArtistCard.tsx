'use client'

import React from 'react'
import { CaretRight } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

interface ArtistAvatarProps {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  image?: string
}

const AVATAR_SIZE = { sm: 36, md: 48, lg: 64 }
const AVATAR_FONT = { sm: 14, md: 18, lg: 24 }
const AVATAR_RADIUS = { sm: 10, md: 14, lg: 18 }

export function ArtistAvatar({ name, color = 'var(--color-encore-green)', size = 'md', image }: ArtistAvatarProps) {
  const s = AVATAR_SIZE[size]
  return (
    <div style={{
      width: s,
      height: s,
      clipPath: `path("${squirclePath(s)}")`,
      background: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'var(--font-google-sans), sans-serif',
      fontSize: AVATAR_FONT[size],
      fontWeight: 700,
      color: 'var(--color-encore-white)',
      letterSpacing: '-0.02em',
      overflow: 'hidden',
    }}>
      {image
        ? <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        : name.charAt(0).toUpperCase()
      }
    </div>
  )
}

interface ArtistCardProps {
  name: string
  color?: string
  image?: string
  liveCount?: number
  nextLiveDate?: string
}

export default function ArtistCard({ name, color, image, liveCount = 0, nextLiveDate }: ArtistCardProps) {
  return (
    <div style={{
      background: 'var(--color-encore-bg)',
      borderRadius: 8,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
    }}>
      <ArtistAvatar name={name} color={color} size="md" image={image} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...ty.sectionSM, marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={ty.sub}>
            <span style={{ color: 'var(--color-encore-green)', fontWeight: 700 }}>{liveCount}</span> 件登録
          </span>
          {nextLiveDate && (
            <span style={ty.sub}>
              次回 <span style={{ color: 'var(--color-encore-green)', fontWeight: 700 }}>{nextLiveDate}</span>
            </span>
          )}
        </div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--color-encore-bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CaretRight size={14} weight="light" color="var(--color-encore-green)" />
      </div>
    </div>
  )
}
