'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { CaretLeft, CaretRight, Cake } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, GrapeArtist } from '@/lib/grape/types'
import { TODAY, HOUR_HEIGHT_DAY as HOUR_HEIGHT, TIME_COL_WIDTH_DAY as TIME_COL_WIDTH, DOW_SUN_FIRST as DOW_JA } from '@/lib/grape/constants'
import CyclingArtistImage from './CyclingArtistImage'

interface CalendarDayViewProps {
  date: string
  lives: GrapeLive[]
  artists?: GrapeArtist[]
  onPrevDay: () => void
  onNextDay: () => void
  onSlotTap: (date: string, hour: number) => void
  onEventTap: (live: GrapeLive) => void
  onEventDrop?: (liveId: string, newDate: string, newStartMin: number) => void
  highlightHour?: number | null
}

function parseDateStr(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatDateLabel(dateStr: string): string {
  const d = parseDateStr(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const dow = DOW_JA[d.getDay()]
  return `${month}月${day}日（${dow}）`
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return null
  return [parseInt(m[0], 16), parseInt(m[1], 16), parseInt(m[2], 16)]
}

function getEventStyle(live: GrapeLive): React.CSSProperties {
  if (live.color) {
    const rgb = hexToRgb(live.color)
    if (rgb) {
      const [r, g, b] = rgb
      const isSkipped = live.attendanceStatus === 'skipped'
      return {
        background: `rgba(${r},${g},${b},0.15)`,
        borderLeft: `3px solid rgba(${r},${g},${b},0.85)`,
        color: `rgba(${r},${g},${b},0.9)`,
        ...(isSkipped ? { opacity: 0.5 } : {}),
      }
    }
  }
  switch (live.attendanceStatus) {
    case 'planned':
      return {
        background: 'var(--color-grape-tint-12)',
        borderLeft: '3px solid var(--color-encore-green)',
      }
    case 'candidate':
      return {
        background: 'var(--color-grape-tint-06)',
        borderLeft: '3px solid var(--color-encore-border)',
      }
    case 'attended':
      return {
        background: 'var(--color-encore-bg-section)',
        borderLeft: '3px solid var(--color-encore-green-muted)',
      }
    case 'skipped':
      return {
        background: 'var(--color-encore-bg-section)',
        borderLeft: '3px solid var(--color-encore-border)',
        opacity: 0.5,
      }
    default:
      return {
        background: 'var(--color-grape-tint-06)',
        borderLeft: '3px solid var(--color-encore-border)',
      }
  }
}

export default function CalendarDayView({
  date,
  lives,
  artists,
  onPrevDay,
  onNextDay,
  onSlotTap,
  onEventTap,
  onEventDrop,
  highlightHour,
}: CalendarDayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isToday = date === TODAY
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // 当日の誕生日アーティスト
  const birthdayArtistsToday = useMemo(() => {
    if (!artists?.length) return []
    const [, mm, dd] = date.split('-')
    const key = `${mm}-${dd}`
    return artists.filter(a => {
      if (!a.birthday) return false
      const [, bMm, bDd] = a.birthday.split('-')
      return `${bMm}-${bDd}` === key
    })
  }, [artists, date])

  // Scroll to hour 10 on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 10 * HOUR_HEIGHT - 40
    }
  }, [])

  // Current time line — only if today (use 10:30 as demo time)
  // Current time line (動的・1分ごとに更新)
  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date(); return n.getHours() * 60 + n.getMinutes()
  })
  useEffect(() => {
    const tick = () => { const n = new Date(); setNowMinutes(n.getHours() * 60 + n.getMinutes()) }
    const id = setInterval(tick, 60000)
    return () => clearInterval(id)
  }, [])
  const timeLineTop = (nowMinutes / 60) * HOUR_HEIGHT

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Date navigation bar */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          background: 'var(--color-encore-bg)',
          borderBottom: '1px solid var(--color-encore-border-light)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={onPrevDay}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-encore-green)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <CaretLeft size={18} weight="light" />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ ...ty.heading }}>{formatDateLabel(date)}</span>
          {isToday && (
            <span
              style={{
                ...ty.caption,
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'var(--color-encore-green)',
                color: 'var(--color-encore-white)',
              }}
            >
              今日
            </span>
          )}
        </div>

        <button
          onClick={onNextDay}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-encore-green)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <CaretRight size={18} weight="light" />
        </button>
      </div>

      {/* 誕生日 all-day バナー */}
      {birthdayArtistsToday.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            background: 'rgba(192,138,74,0.08)',
            borderBottom: '1px solid rgba(192,138,74,0.18)',
            flexShrink: 0,
          }}
        >
          <Cake size={15} weight="fill" color="var(--color-encore-amber)" style={{ flexShrink: 0 }} />
          {/* アーティストアバター（複数対応） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: -4 }}>
            {birthdayArtistsToday.map((a, i) =>
              a.image ? (
                <img
                  key={a.id}
                  src={a.image}
                  alt={a.name}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', objectFit: 'cover',
                    flexShrink: 0,
                    marginLeft: i > 0 ? -6 : 0,
                    boxShadow: i > 0 ? '0 0 0 1.5px var(--color-encore-bg)' : 'none',
                  }}
                />
              ) : null
            )}
          </div>
          <span style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 12,
            fontWeight: 400,
            color: 'var(--color-encore-green)',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {birthdayArtistsToday.map(a => a.name).join('、')} の誕生日
          </span>
        </div>
      )}

      {/* Scrollable time grid */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}
      >
        <div
          style={{
            position: 'relative',
            height: 24 * HOUR_HEIGHT,
            display: 'flex',
          }}
        >
          {/* Hour labels column */}
          <div
            style={{
              width: TIME_COL_WIDTH,
              flexShrink: 0,
              position: 'relative',
              background: 'var(--color-encore-bg)',
            }}
          >
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  top: h * HOUR_HEIGHT,
                  left: 0,
                  right: 0,
                  textAlign: 'right',
                  paddingRight: 6,
                  transform: 'translateY(-50%)',
                  lineHeight: 1,
                }}
              >
                {h > 0 && (
                  <span style={{ ...ty.captionMuted, fontSize: 11 }}>
                    {h}:00
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Event area */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              background: isDragOver ? 'var(--color-grape-tint-04)' : 'transparent',
              transition: 'background 0.15s',
            }}
            onClick={(e) => {
              if (draggingId) return
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const y = e.clientY - rect.top
              const hour = Math.floor(y / HOUR_HEIGHT)
              onSlotTap(date, hour)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDragEnter={(e) => {
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragOver(false)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragOver(false)
              const liveId = e.dataTransfer.getData('liveId')
              const offsetMin = parseInt(e.dataTransfer.getData('offsetMin') || '0')
              if (!liveId) return
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const y = e.clientY - rect.top
              const rawMin = Math.round((y / HOUR_HEIGHT) * 60) - offsetMin
              const snappedMin = Math.round(rawMin / 15) * 15
              const newStartMin = Math.max(0, Math.min(23 * 60, snappedMin))
              onEventDrop?.(liveId, date, newStartMin)
              setDraggingId(null)
            }}
          >
            {/* Horizontal hour lines */}
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  top: h * HOUR_HEIGHT,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'var(--color-encore-border-light)',
                  pointerEvents: 'none',
                }}
              />
            ))}

            {/* Current time line (today only) */}
            {isToday && (
              <div
                style={{
                  position: 'absolute',
                  top: timeLineTop,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: 'var(--color-encore-amber)',
                  zIndex: 10,
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--color-encore-amber)',
                    marginTop: -3.5,
                    marginLeft: -4,
                  }}
                />
              </div>
            )}

            {/* Slot highlight */}
            {highlightHour != null && (
              <div
                style={{
                  position: 'absolute',
                  top: highlightHour * HOUR_HEIGHT + 1,
                  left: 3,
                  right: 3,
                  height: HOUR_HEIGHT - 2,
                  background: 'var(--color-grape-tint-12)',
                  borderRadius: 6,
                  border: '1.5px solid var(--color-encore-green)',
                  pointerEvents: 'none',
                  zIndex: 3,
                  animation: 'slot-appear 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
                }}
              />
            )}

            {/* Event blocks */}
            {lives.map((live) => {
              const blockStartMin = parseMinutes(live.openingTime ?? live.startTime)
              const startMin = parseMinutes(live.startTime)
              const endMin = live.endTime ? parseMinutes(live.endTime) : startMin + 60
              const top = (blockStartMin / 60) * HOUR_HEIGHT
              const height = Math.max(((endMin - blockStartMin) / 60) * HOUR_HEIGHT, 40)
              const eventStyle = getEventStyle(live)
              const isDragging = draggingId === live.id

              return (
                <div
                  key={live.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggingId(live.id)
                    e.dataTransfer.setData('liveId', live.id)
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const offsetY = e.clientY - rect.top
                    const durationMin = endMin - startMin
                    const offsetMin = Math.round((offsetY / Math.max(height - 2, 1)) * durationMin)
                    e.dataTransfer.setData('offsetMin', String(offsetMin))
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setIsDragOver(false)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEventTap(live)
                  }}
                  style={{
                    position: 'absolute',
                    top: top + 1,
                    left: 4,
                    right: 4,
                    height: height - 2,
                    borderRadius: 8,
                    padding: '4px 6px',
                    overflow: 'hidden',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    zIndex: isDragging ? 20 : 5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    opacity: isDragging ? 0.4 : 1,
                    transition: 'opacity 0.15s',
                    userSelect: 'none',
                    ...eventStyle,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
                    {live.coverImage ? (
                      <img
                        src={live.coverImage}
                        alt={live.title}
                        style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (live.artistImages && live.artistImages.length > 1)
                      ? <div style={{ flexShrink: 0 }}><CyclingArtistImage images={live.artistImages} alt={live.artist} size={20} intervalMs={2400} /></div>
                      : live.artistImage && (
                        <img
                          src={live.artistImage}
                          alt={live.artist}
                          style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      )
                    }
                    <span
                      style={{
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-encore-green)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: 1.3,
                      }}
                    >
                      {live.title}
                    </span>
                  </div>
                  <span
                    style={{
                      ...ty.captionMuted,
                      fontSize: 10,
                      fontWeight: 400,
                      pointerEvents: 'none',
                    }}
                  >
                    {live.openingTime
                      ? `開場 ${live.openingTime}／開演 ${live.startTime}〜`
                      : live.endTime
                      ? `開演 ${live.startTime}〜${live.endTime}`
                      : `開演 ${live.startTime}〜`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
