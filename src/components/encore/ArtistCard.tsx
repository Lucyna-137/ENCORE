'use client'

import React from 'react'
import { CaretRight } from '@phosphor-icons/react'

interface ArtistAvatarProps {
  name: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

const AVATAR_SIZE = { sm: 36, md: 48, lg: 64 }
const AVATAR_FONT = { sm: 14, md: 18, lg: 24 }
const AVATAR_RADIUS = { sm: 10, md: 14, lg: 18 }

export function ArtistAvatar({ name, color = 'var(--color-encore-green)', size = 'md' }: ArtistAvatarProps) {
  const s = AVATAR_SIZE[size]
  return (
    <div style={{
      width: s,
      height: s,
      borderRadius: AVATAR_RADIUS[size],
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
    }}>
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

interface ArtistCardProps {
  name: string
  color?: string
  liveCount?: number
  nextLiveDate?: string
}

export default function ArtistCard({ name, color, liveCount = 0, nextLiveDate }: ArtistCardProps) {
  return (
    <div style={{
      background: 'var(--color-encore-bg)',
      borderRadius: 16,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxShadow: 'var(--shadow-card)',
    }}>
      <ArtistAvatar name={name} color={color} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {name}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--color-encore-text-muted)', fontFamily: 'var(--font-google-sans), sans-serif' }}>
            <span style={{ color: 'var(--color-encore-text-sub)', fontWeight: 700 }}>{liveCount}</span> 件登録
          </span>
          {nextLiveDate && (
            <span style={{ fontSize: 12, color: 'var(--color-encore-text-muted)', fontFamily: 'var(--font-google-sans), sans-serif' }}>
              次回 <span style={{ color: 'var(--color-encore-text-sub)', fontWeight: 700 }}>{nextLiveDate}</span>
            </span>
          )}
        </div>
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--color-encore-bg-section)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <CaretRight size={14} weight="light" color="var(--color-encore-text-muted)" />
      </div>
    </div>
  )
}
