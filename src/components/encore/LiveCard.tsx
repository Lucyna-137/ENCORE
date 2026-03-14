'use client'

import React from 'react'
import { MapPin, Clock } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

// カラーピッカーと同じスクワークル形状
const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

type LiveType   = 'ワンマン' | '対バン' | 'フェス' | '配信' | '舞台・公演' | 'メディア出演' | 'リリースイベント'
type LiveStatus = '予定' | '抽選中' | '当選' | '落選' | '終了'

interface LiveCardProps {
  date: string        // 'YYYY-MM-DD'
  liveType: LiveType
  liveStatus: LiveStatus
  name: string
  artist: string
  venue?: string
  time?: string
  flyerImage?: string           // フライヤー画像URL
  flyerImagePosition?: string  // object-position (default: 'center')
  artistImage?: string          // アーティスト画像URL（単体）
  artistImagePosition?: string  // object-position (default: 'center')
  artistImages?: string[]       // アーティスト画像URL（複数・重ねて表示）
}

const TYPE_STYLE: Record<LiveType, { label: string; bg: string; text: string; gradient: string }> = {
  'ワンマン': { label: 'ワンマン', bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(27,60,45,0.18), rgba(27,60,45,0.05))' },
  '対バン':   { label: '対バン',   bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(139,168,152,0.20), rgba(139,168,152,0.06))' },
  'フェス':   { label: 'フェス',   bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(192,138,74,0.22), rgba(192,138,74,0.05))' },
  '配信':       { label: '配信',       bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(139,168,152,0.20), rgba(139,168,152,0.06))' },
  '舞台・公演': { label: '舞台・公演', bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(27,60,45,0.18), rgba(27,60,45,0.05))' },
  'メディア出演':   { label: 'メディア出演',   bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(139,168,152,0.20), rgba(139,168,152,0.06))' },
  'リリースイベント': { label: 'リリースイベント', bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(192,138,74,0.22), rgba(192,138,74,0.05))' },
}

const STATUS_STYLE: Record<LiveStatus, { label: string; bg: string; text: string; border?: string }> = {
  '予定':   { label: '予定',   bg: 'rgba(27,60,45,0.08)',    text: 'var(--color-encore-green)' },
  '抽選中': { label: 'チケット抽選中', bg: 'var(--color-encore-green)', text: 'var(--color-encore-white)' },
  '当選':   { label: 'チケット当選', bg: 'var(--color-encore-amber)', text: 'var(--color-encore-white)' },
  '落選':   { label: 'チケット落選', bg: 'var(--color-encore-bg-section)', text: 'var(--color-encore-text-sub)' },
  '終了':   { label: '終了',   bg: 'transparent', text: 'var(--color-encore-text-sub)', border: '1.5px solid var(--color-encore-border-light)' },
}

const DOW_COLOR: Record<string, string> = {
  '土': '#0284C7',
  '日': 'var(--color-encore-error)',
}

export default function LiveCard({ date, liveType, liveStatus, name, artist, venue, time, flyerImage, flyerImagePosition = 'center', artistImage, artistImagePosition = 'center', artistImages }: LiveCardProps) {
  const d = new Date(date)
  const month = d.getMonth() + 1
  const day   = d.getDate()
  const dow   = ['日', '月', '火', '水', '木', '金', '土'][d.getDay()]

  const typeStyle   = TYPE_STYLE[liveType]
  const statusStyle = STATUS_STYLE[liveStatus]

  return (
    <div style={{
      background: 'var(--color-encore-bg)',
      borderRadius: 8,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* フライヤー画像エリア */}
      <div style={{
        width: '100%',
        height: 160,
        flexShrink: 0,
        background: typeStyle.gradient,
        overflow: 'hidden',
      }}>
        {flyerImage && (
          <img
            src={flyerImage}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: flyerImagePosition, display: 'block' }}
          />
        )}
      </div>

      {/* 日付 + コンテンツ */}
      <div style={{ display: 'flex' }}>
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
      }}>
        <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700, color: 'var(--color-encore-text-muted)', lineHeight: 1 }}>
          {month}月
        </span>
        <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 30, fontWeight: 700, color: 'var(--color-encore-green)', lineHeight: 1, marginTop: 2 }}>
          {day}
        </span>
        <span style={{ fontSize: 12, fontWeight: 700, color: DOW_COLOR[dow] ?? 'var(--color-encore-text-muted)', marginTop: 2, fontFamily: 'var(--font-google-sans), sans-serif' }}>
          ({dow})
        </span>
      </div>

      {/* コンテンツ */}
      <div style={{ flex: 1, minWidth: 0, padding: '14px 12px 14px 16px', display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* ライブ名 */}
          <div style={{ ...ty.sectionSM, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
            {name}
          </div>
          {/* アーティスト */}
          <div style={{ ...ty.sub, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {artist}
          </div>
          {/* メタ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
            {venue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} weight="light" color="var(--color-encore-green)" />
                <span style={{ ...ty.caption, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{venue}</span>
              </div>
            )}
            {time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} weight="light" color="var(--color-encore-green)" />
                <span style={ty.caption}>{time}</span>
              </div>
            )}
          </div>
          {/* バッジ（最下部） */}
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {liveStatus !== '終了' && (
              <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-google-sans), sans-serif', padding: '2px 8px', borderRadius: 999, background: statusStyle.bg, color: statusStyle.text, border: statusStyle.border }}>
                {statusStyle.label}
              </span>
            )}
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-google-sans), sans-serif', padding: '2px 8px', borderRadius: 999, background: typeStyle.bg, color: typeStyle.text }}>
              {typeStyle.label}
            </span>
          </div>
        </div>
        {/* カバーエリア */}
        {artistImages && artistImages.length > 1 ? (
          <div style={{ display: 'flex', alignSelf: 'flex-start', flexShrink: 0 }}>
            {artistImages.map((img, i) => (
              <div key={i} style={{ width: 28, height: 28, flexShrink: 0, clipPath: `path("${squirclePath(28)}")`, background: typeStyle.gradient, overflow: 'hidden', marginLeft: i === 0 ? 0 : -8 }}>
                <img src={img} alt={artist} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ width: 36, height: 36, flexShrink: 0, clipPath: `path("${squirclePath(36)}")`, background: typeStyle.gradient, alignSelf: 'flex-start', overflow: 'hidden' }}>
            {artistImage && <img src={artistImage} alt={artist} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: artistImagePosition, display: 'block' }} />}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
