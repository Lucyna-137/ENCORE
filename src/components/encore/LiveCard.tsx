'use client'

import React from 'react'
import { MapPin, Clock } from '@phosphor-icons/react'

type LiveType   = 'ワンマン' | '対バン' | 'フェス' | '配信'
type LiveStatus = '予定' | '抽選中' | '当選' | '落選' | '終了'

interface LiveCardProps {
  date: string        // 'YYYY-MM-DD'
  liveType: LiveType
  liveStatus: LiveStatus
  name: string
  artist: string
  venue?: string
  time?: string
}

const TYPE_STYLE: Record<LiveType, { label: string; bg: string; text: string; gradient: string }> = {
  'ワンマン': { label: 'ワンマン', bg: 'rgba(27,60,45,0.10)',  text: 'var(--color-encore-green)',       gradient: 'linear-gradient(135deg, rgba(27,60,45,0.18), rgba(27,60,45,0.05))' },
  '対バン':   { label: '対バン',   bg: 'rgba(14,165,233,0.12)', text: '#0284C7',                         gradient: 'linear-gradient(135deg, rgba(14,165,233,0.20), rgba(14,165,233,0.05))' },
  'フェス':   { label: 'フェス',   bg: 'rgba(192,138,74,0.15)', text: 'var(--color-encore-amber)',       gradient: 'linear-gradient(135deg, rgba(192,138,74,0.22), rgba(192,138,74,0.05))' },
  '配信':     { label: '配信',     bg: 'rgba(139,168,152,0.20)', text: 'var(--color-encore-green-muted)', gradient: 'linear-gradient(135deg, rgba(139,168,152,0.28), rgba(139,168,152,0.06))' },
}

const STATUS_STYLE: Record<LiveStatus, { label: string; bg: string; text: string }> = {
  '予定':   { label: '予定',   bg: 'rgba(27,60,45,0.08)',  text: 'var(--color-encore-green)' },
  '抽選中': { label: '抽選中', bg: 'rgba(192,138,74,0.15)', text: 'var(--color-encore-amber)' },
  '当選':   { label: '当選',   bg: 'rgba(27,60,45,0.12)',  text: 'var(--color-encore-green)' },
  '落選':   { label: '落選',   bg: 'rgba(192,57,43,0.10)', text: 'var(--color-encore-error)' },
  '終了':   { label: '終了',   bg: 'rgba(174,170,163,0.20)', text: 'var(--color-encore-text-muted)' },
}

const DOW_COLOR: Record<string, string> = {
  '土': '#0284C7',
  '日': 'var(--color-encore-error)',
}

export default function LiveCard({ date, liveType, liveStatus, name, artist, venue, time }: LiveCardProps) {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day   = d.getDate()
  const dow   = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]

  const typeStyle   = TYPE_STYLE[liveType]
  const statusStyle = STATUS_STYLE[liveStatus]

  return (
    <div style={{
      background: 'var(--color-encore-bg)',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
    }}>
      {/* 日付カラム */}
      <div style={{
        width: 72,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: 16,
        paddingBottom: 14,
        background: 'var(--color-encore-bg-section)',
        borderRight: '1px solid var(--color-encore-border-light)',
      }}>
        <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700, color: 'var(--color-encore-text-muted)', lineHeight: 1 }}>
          {month}月
        </span>
        <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 30, fontWeight: 700, color: 'var(--color-encore-green)', lineHeight: 1, marginTop: 2 }}>
          {day}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: DOW_COLOR[dow] ?? 'var(--color-encore-text-muted)', marginTop: 2, fontFamily: 'var(--font-google-sans), sans-serif' }}>
          {dow}
        </span>
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, minWidth: 0, padding: '14px 12px 14px 16px', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* バッジ */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-google-sans), sans-serif', padding: '2px 8px', borderRadius: 4, background: typeStyle.bg, color: typeStyle.text }}>
              {typeStyle.label}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-google-sans), sans-serif', padding: '2px 8px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.text }}>
              {statusStyle.label}
            </span>
          </div>
          {/* ライブ名 */}
          <div style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--color-encore-green)', lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {name}
          </div>
          {/* アーティスト */}
          <div style={{ fontSize: 12, fontWeight: 400, color: 'var(--color-encore-text-sub)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif' }}>
            {artist}
          </div>
          {/* メタ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} weight="light" color="var(--color-encore-text-muted)" />
                <span style={{ fontSize: 11, color: 'var(--color-encore-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{venue}</span>
              </div>
            )}
            {time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} weight="light" color="var(--color-encore-text-muted)" />
                <span style={{ fontSize: 11, color: 'var(--color-encore-text-muted)' }}>{time}</span>
              </div>
            )}
          </div>
        </div>
        {/* カバーエリア */}
        <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 12, background: typeStyle.gradient, alignSelf: 'flex-start' }} />
      </div>
    </div>
  )
}
