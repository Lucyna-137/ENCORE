import React from 'react'

type LiveStatus    = '予定' | '抽選中' | '当選' | '落選' | '終了'
type LiveType      = 'ワンマン' | '対バン' | 'フェス' | '配信'
type LotteryStatus = 'エントリー前' | '受付中' | '申込済み' | '締切' | '結果待ち'

const LIVE_STATUS: Record<LiveStatus, { bg: string; text: string }> = {
  '予定':   { bg: 'rgba(27,60,45,0.08)',   text: 'var(--color-encore-green)' },
  '抽選中': { bg: 'rgba(192,138,74,0.15)', text: 'var(--color-encore-amber)' },
  '当選':   { bg: 'rgba(27,60,45,0.14)',   text: 'var(--color-encore-green)' },
  '落選':   { bg: 'rgba(192,57,43,0.10)',  text: 'var(--color-encore-error)' },
  '終了':   { bg: 'rgba(174,170,163,0.22)', text: 'var(--color-encore-text-muted)' },
}

const LIVE_TYPE: Record<LiveType, { bg: string; text: string }> = {
  'ワンマン': { bg: 'rgba(27,60,45,0.10)',   text: 'var(--color-encore-green)' },
  '対バン':   { bg: 'rgba(14,165,233,0.12)', text: '#0284C7' },
  'フェス':   { bg: 'rgba(192,138,74,0.15)', text: 'var(--color-encore-amber)' },
  '配信':     { bg: 'rgba(139,168,152,0.20)', text: 'var(--color-encore-green-muted)' },
}

const LOTTERY_STATUS: Record<LotteryStatus, { bg: string; text: string }> = {
  'エントリー前': { bg: 'rgba(174,170,163,0.20)', text: 'var(--color-encore-text-muted)' },
  '受付中':      { bg: 'rgba(14,165,233,0.12)',   text: '#0284C7' },
  '申込済み':    { bg: 'rgba(27,60,45,0.10)',      text: 'var(--color-encore-green)' },
  '締切':        { bg: 'rgba(192,57,43,0.10)',     text: 'var(--color-encore-error)' },
  '結果待ち':    { bg: 'rgba(192,138,74,0.15)',    text: 'var(--color-encore-amber)' },
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
    <span style={{ ...base, fontSize: 10, padding: '2px 9px', borderRadius: 999, background: s.bg, color: s.text }}>
      {status}
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

export function LotteryStatusBadge({ status }: { status: LotteryStatus }) {
  const s = LOTTERY_STATUS[status]
  return (
    <span style={{ ...base, fontSize: 11, padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.text }}>
      {status}
    </span>
  )
}
