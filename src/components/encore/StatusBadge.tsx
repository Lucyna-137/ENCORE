import React from 'react'

type LiveStatus    = '予定' | '抽選中' | '当選' | '落選' | '終了'
type LiveType      = 'ワンマン' | '対バン' | 'フェス' | '配信' | '舞台・公演' | 'メディア出演' | 'リリースイベント'

// Badge.tsx のカラーシステムに統一
// light-green: rgba(27,60,45,0.08) + green
// amber-light: rgba(192,138,74,0.15) + amber
// muted:       bg-section + text-sub
// green:       solid green + white
// amber:       solid amber + white

const LIVE_STATUS: Record<LiveStatus, { label: string; bg: string; text: string; border?: string }> = {
  '予定':   { label: '予定',           bg: 'rgba(27,60,45,0.08)',    text: 'var(--color-encore-green)' },
  '抽選中': { label: 'チケット抽選中', bg: 'var(--color-encore-green)', text: 'var(--color-encore-white)' },
  '当選':   { label: 'チケット当選',   bg: 'var(--color-encore-amber)', text: 'var(--color-encore-white)' },
  '落選':   { label: 'チケット落選',   bg: 'var(--color-encore-bg-section)', text: 'var(--color-encore-text-sub)' },
  '終了':   { label: '終了',           bg: 'transparent', text: 'var(--color-encore-text-sub)', border: '1.5px solid var(--color-encore-border-light)' },
}

const LIVE_TYPE: Record<LiveType, { bg: string; text: string }> = {
  'ワンマン': { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
  '対バン':   { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
  'フェス':   { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
  '配信':         { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
  '舞台・公演':   { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
  'メディア出演':   { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
  'リリースイベント': { bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)' },
}


const base: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  fontFamily: 'var(--font-google-sans), sans-serif',
  fontWeight: 700,
  whiteSpace: 'nowrap',
}

export function LiveStatusBadge({ status }: { status: LiveStatus }) {
  const s = LIVE_STATUS[status]
  return (
    <span style={{ ...base, fontSize: 10, padding: '2px 9px', borderRadius: 999, background: s.bg, color: s.text, border: s.border }}>
      {s.label}
    </span>
  )
}

export function LiveTypeBadge({ type }: { type: LiveType }) {
  const s = LIVE_TYPE[type]
  return (
    <span style={{ ...base, fontSize: 10, letterSpacing: '0.06em', padding: '2px 9px', borderRadius: 999, background: s.bg, color: s.text }}>
      {type}
    </span>
  )
}

