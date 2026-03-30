'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, Clock } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

// カラーピッカーと同じスクワークル形状
const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

type LiveType   = 'ワンマン' | '対バン' | 'フェス' | '配信' | '舞台・公演' | 'メディア出演' | 'リリースイベント' | 'その他'
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
  'その他':         { label: 'その他',         bg: 'rgba(27,60,45,0.08)', text: 'var(--color-encore-green)', gradient: 'linear-gradient(135deg, rgba(139,168,152,0.16), rgba(139,168,152,0.04))' },
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

// ─── フェード切り替えアーティスト画像 ──────────────────────────────────────────
function CyclingArtistImage({ images, alt, gradient, size }: { images: string[]; alt: string; gradient: string; size: number }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setActiveIndex(i => (i + 1) % images.length), 2400)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <div style={{ position: 'relative', width: size, height: size, clipPath: `path("${squirclePath(size)}")`, background: gradient, flexShrink: 0 }}>
      {images.map((img, i) => (
        <img
          key={img}
          src={img}
          alt={alt}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            display: 'block',
            opacity: i === activeIndex ? 1 : 0,
            transition: 'opacity 0.9s ease',
          }}
        />
      ))}
    </div>
  )
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
      position: 'relative',
    }}>
      {/* フライヤー画像エリア */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: '100%',
          height: 160,
          background: typeStyle.gradient,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {flyerImage ? (
            <img src={flyerImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: flyerImagePosition, display: 'block', position: 'absolute', inset: 0 }} />
          ) : artistImages && artistImages.length > 1 ? (
            <CyclingArtistImage images={artistImages} alt={artist} gradient={typeStyle.gradient} size={112} />
          ) : artistImage ? (
            <div style={{ width: 112, height: 112, clipPath: `path("${squirclePath(112)}")`, overflow: 'hidden', background: typeStyle.gradient, flexShrink: 0 }}>
              <img src={artistImage} alt={artist} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: artistImagePosition, display: 'block' }} />
            </div>
          ) : null}
        </div>
        {/* バッジ（画像エリア左下オーバーレイ） */}
        {(() => {
          // 実際に表示される背景を判定（flyerImageが最優先表示）:
          //   flyerImage あり → 写真背景 → 白バッジ
          //   flyerImage なし（アーティスト画像のみ） → 明色グラデーション → 暗バッジ
          const darkBg = !!flyerImage
          const chipStyle: React.CSSProperties = darkBg ? {
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 10, fontWeight: 700,
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(255,255,255,0.20)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.32)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          } : {
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 10, fontWeight: 700,
            padding: '3px 9px', borderRadius: 999,
            background: 'rgba(27,60,45,0.12)',
            color: 'var(--color-encore-green)',
            border: '1px solid rgba(27,60,45,0.22)',
          }
          return (
            <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              {liveStatus !== '終了' && (
                <span style={chipStyle}>{statusStyle.label}</span>
              )}
              <span style={chipStyle}>{typeStyle.label}</span>
            </div>
          )
        })()}
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
        background: 'var(--color-encore-bg)',
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
      <div style={{ flex: 1, minWidth: 0, padding: '14px 12px 14px 16px' }}>
        {/* ライブ名 */}
        <div style={{ ...ty.sectionSM, fontSize: 16, lineHeight: 1.4, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
          {name}
        </div>
        {/* アーティスト */}
        <div style={{ ...ty.sub, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {artist}
        </div>
        {/* メタ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
      </div>
      </div>
    </div>
  )
}
