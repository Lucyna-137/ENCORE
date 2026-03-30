'use client'

import React, { useEffect, useRef, useMemo, useState } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, GrapeArtist } from '@/lib/grape/types'
import { TODAY, HOUR_HEIGHT_WEEK as HOUR_HEIGHT, TIME_COL_WIDTH_WEEK as TIME_COL_WIDTH, DOW_MON_FIRST as DOW } from '@/lib/grape/constants'
import CyclingArtistImage from './CyclingArtistImage'

interface CalendarWeekViewProps {
  weekStart: Date
  lives: GrapeLive[]
  artists?: GrapeArtist[]
  onSlotTap: (date: string, hour: number) => void
  onEventTap: (live: GrapeLive) => void
  onEventDrop?: (liveId: string, newDate: string, newStartMin: number) => void
  onPrevWeek?: () => void
  onNextWeek?: () => void
  highlightSlot?: { date: string; hour: number } | null
}

// ─── Birthday tooltip（Week view 用） ────────────────────────────────────────
interface WeekBirthdayTooltipData {
  artists: GrapeArtist[]
  top: number
  left: number
}

function WeekBirthdayTooltip({ data, onClose }: { data: WeekBirthdayTooltipData; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 55 }} />
      <div style={{
        position: 'absolute',
        top: data.top,
        left: data.left,
        zIndex: 56,
        background: 'var(--color-encore-bg)',
        borderRadius: 12,
        boxShadow: '0 4px 20px rgba(0,0,0,0.20)',
        border: '1px solid var(--color-encore-border-light)',
        overflow: 'hidden',
        minWidth: 172,
      }}>
        {data.artists.map((artist, i) => {
          const parts = (artist.birthday ?? '').split('-')
          const dateLabel = parts.length === 3 ? `${parseInt(parts[1])}.${parts[2]}` : ''
          return (
            <div key={artist.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              borderTop: i > 0 ? '1px solid var(--color-encore-border-light)' : 'none',
            }}>
              {artist.image ? (
                <img src={artist.image} alt={artist.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--color-grape-tint-10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
                }}>🎂</div>
              )}
              <div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 700, color: 'var(--color-encore-green)', lineHeight: 1.3,
                }}>
                  {artist.name} 誕生日
                </div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12, color: 'var(--color-encore-text-sub)', marginTop: 2,
                }}>
                  {dateLabel}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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
      return {
        background: `rgba(${r},${g},${b},0.15)`,
        color: `rgba(${r},${g},${b},0.9)`,
      }
    }
  }
  switch (live.attendanceStatus) {
    case 'attended':
      return {
        background: 'var(--color-encore-bg-section)',
        color: 'var(--color-encore-text-muted)',
      }
    case 'candidate':
    case 'planned':
    default:
      return {
        background: 'var(--color-grape-tint-10)',
        color: 'var(--color-encore-green)',
      }
  }
}

export default function CalendarWeekView({
  weekStart,
  lives,
  artists,
  onSlotTap,
  onEventTap,
  onEventDrop,
  onPrevWeek,
  onNextWeek,
  highlightSlot,
}: CalendarWeekViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const weekHeaderRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)
  const [activeBirthday, setActiveBirthday] = useState<WeekBirthdayTooltipData | null>(null)

  // 誕生日マップ: 'MM-DD' -> GrapeArtist[]
  const birthdayMap = useMemo(() => {
    const map = new Map<string, GrapeArtist[]>()
    if (!artists?.length) return map
    for (const a of artists) {
      if (!a.birthday) continue
      const [, mm, dd] = a.birthday.split('-')
      const key = `${mm}-${dd}`
      const arr = map.get(key) ?? []
      arr.push(a)
      map.set(key, arr)
    }
    return map
  }, [artists])

  const handleBirthdayTap = (e: React.MouseEvent, bArtists: GrapeArtist[]) => {
    e.stopPropagation()
    if (activeBirthday) { setActiveBirthday(null); return }
    const header = weekHeaderRef.current
    if (!header) return
    const hRect = header.getBoundingClientRect()
    const bRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const TOOLTIP_W = 180
    let left = bRect.left - hRect.left - 4
    if (left + TOOLTIP_W > hRect.width - 4) left = hRect.width - TOOLTIP_W - 4
    if (left < 4) left = 4
    setActiveBirthday({ artists: bArtists, top: bRect.bottom - hRect.top + 4, left })
  }

  // Build days array (Mon–Sun)
  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(weekStart.getDate() + i)
      return { date: d, dateStr: toDateStr(d) }
    })
  }, [weekStart])

  // Map lives to columns
  const livesByDay = useMemo(() => {
    const map = new Map<string, GrapeLive[]>()
    for (const live of lives) {
      const arr = map.get(live.date) ?? []
      arr.push(live)
      map.set(live.date, arr)
    }
    return map
  }, [lives])

  // Scroll to current time on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 12 * HOUR_HEIGHT - 40
    }
  }, [])

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

  // Week range label e.g. "3月16日 – 3月22日"
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  const fmtMD = (d: Date) => `${d.getMonth() + 1}月${d.getDate()}日`
  const weekLabel =
    weekStart.getMonth() === weekEnd.getMonth()
      ? `${weekStart.getMonth() + 1}月${weekStart.getDate()}日 – ${weekEnd.getDate()}日`
      : `${fmtMD(weekStart)} – ${fmtMD(weekEnd)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Week nav bar */}
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
          onClick={onPrevWeek}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: 'var(--color-encore-green)',
            display: 'flex',
            alignItems: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <CaretLeft size={18} weight="light" />
        </button>
        <span style={{ ...ty.heading }}>{weekLabel}</span>
        <button
          onClick={onNextWeek}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8,
            color: 'var(--color-encore-green)',
            display: 'flex',
            alignItems: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <CaretRight size={18} weight="light" />
        </button>
      </div>

      {/* Week header（曜日・日付行） */}
      <div
        ref={weekHeaderRef}
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-encore-border-light)',
          background: 'var(--color-encore-bg)',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {/* Time column spacer */}
        <div style={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />
        {days.map(({ date, dateStr }, i) => {
          const isToday = dateStr === TODAY
          const [, dMm, dDd] = dateStr.split('-')
          const birthdayArtistsForDay = birthdayMap.get(`${dMm}-${dDd}`) ?? []
          return (
            <div
              key={dateStr}
              style={{
                flex: 1,
                textAlign: 'center',
                padding: '6px 2px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <span
                style={{
                  ...ty.caption,
                  fontWeight: 700,
                  fontSize: 12,
                  color: i === 6 ? 'var(--color-encore-error)' : 'var(--color-encore-text-sub)',
                }}
              >
                {DOW[i]}
              </span>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: isToday ? 'var(--color-encore-green)' : 'transparent',
                  border: isToday ? 'none' : '2px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.18s',
                }}
              >
                <span
                  style={{
                    ...ty.body,
                    fontWeight: 700,
                    fontSize: 15,
                    color: isToday ? 'var(--color-encore-white)' : 'var(--color-encore-green)',
                  }}
                >
                  {date.getDate()}
                </span>
              </div>
              {/* Birthday 🎂 */}
              {birthdayArtistsForDay.length > 0 && (
                <button
                  onClick={(e) => handleBirthdayTap(e, birthdayArtistsForDay)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    cursor: 'pointer', fontSize: 12, lineHeight: 1,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  🎂
                </button>
              )}
            </div>
          )
        })}
        {/* Birthday tooltip */}
        {activeBirthday && (
          <WeekBirthdayTooltip
            data={activeBirthday}
            onClose={() => setActiveBirthday(null)}
          />
        )}
      </div>

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
          {/* Time column */}
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

          {/* Day columns */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              position: 'relative',
            }}
          >
            {/* Horizontal hour lines */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
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
                    height: 1,
                    background: 'var(--color-encore-border-light)',
                  }}
                />
              ))}
            </div>

            {/* Current time line */}
            {days.some(d => d.dateStr === TODAY) && (
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

            {/* Day columns with events */}
            {days.map(({ dateStr }, colIdx) => {
              const dayLives = livesByDay.get(dateStr) ?? []
              const isDragOver = dragOverDate === dateStr

              return (
                <div
                  key={dateStr}
                  style={{
                    flex: 1,
                    position: 'relative',
                    borderRight: colIdx < 6 ? '1px solid var(--color-encore-border-light)' : 'none',
                    background: isDragOver ? 'var(--color-grape-tint-04)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onClick={(e) => {
                    if (draggingId) return
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const hour = Math.floor(y / HOUR_HEIGHT)
                    onSlotTap(dateStr, hour)
                  }}
                  onDragOver={(e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                  }}
                  onDragEnter={(e) => {
                    e.preventDefault()
                    setDragOverDate(dateStr)
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverDate(null)
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverDate(null)
                    const liveId = e.dataTransfer.getData('liveId')
                    const offsetMin = parseInt(e.dataTransfer.getData('offsetMin') || '0')
                    if (!liveId) return
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
                    const y = e.clientY - rect.top
                    const rawMin = Math.round((y / HOUR_HEIGHT) * 60) - offsetMin
                    const snappedMin = Math.round(rawMin / 15) * 15
                    const newStartMin = Math.max(0, Math.min(23 * 60, snappedMin))
                    onEventDrop?.(liveId, dateStr, newStartMin)
                    setDraggingId(null)
                  }}
                >
                  {/* Slot highlight */}
                  {highlightSlot?.date === dateStr && (
                    <div
                      style={{
                        position: 'absolute',
                        top: highlightSlot.hour * HOUR_HEIGHT + 1,
                        left: 1,
                        right: 1,
                        height: HOUR_HEIGHT - 2,
                        background: 'var(--color-grape-tint-10)',
                        borderRadius: 4,
                        border: '1.5px solid var(--color-encore-green)',
                        pointerEvents: 'none',
                        zIndex: 3,
                        animation: 'slot-appear 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
                      }}
                    />
                  )}
                  {dayLives.map((live, liveIdx) => {
                    const blockStartMin = parseMinutes(live.openingTime ?? live.startTime)
                    const startMin = parseMinutes(live.startTime)
                    const endMin = live.endTime ? parseMinutes(live.endTime) : startMin + 60
                    const top = (blockStartMin / 60) * HOUR_HEIGHT
                    const height = Math.max(((endMin - blockStartMin) / 60) * HOUR_HEIGHT, 20)

                    // Detect overlaps
                    const isOverlapping = dayLives.some((other, otherIdx) => {
                      if (otherIdx >= liveIdx) return false
                      const otherStart = parseMinutes(other.openingTime ?? other.startTime)
                      const otherEnd = other.endTime ? parseMinutes(other.endTime) : parseMinutes(other.startTime) + 60
                      return blockStartMin < otherEnd && endMin > otherStart
                    })

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
                          setDragOverDate(null)
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventTap(live)
                        }}
                        style={{
                          position: 'absolute',
                          top: top + 1,
                          left: isOverlapping ? '50%' : 2,
                          right: 2,
                          height: height - 2,
                          borderRadius: 4,
                          padding: '2px 4px',
                          overflow: 'hidden',
                          cursor: isDragging ? 'grabbing' : 'grab',
                          zIndex: isDragging ? 20 : 5,
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 3,
                          opacity: isDragging ? 0.4 : 1,
                          transition: 'opacity 0.15s',
                          userSelect: 'none',
                          ...eventStyle,
                        }}
                      >
                        {live.coverImage ? (
                          <img
                            src={live.coverImage}
                            alt={live.title}
                            style={{ width: 16, height: 16, borderRadius: 3, objectFit: 'cover', flexShrink: 0, marginTop: 1, pointerEvents: 'none' }}
                          />
                        ) : (live.artistImages && live.artistImages.length > 1)
                          ? <div style={{ flexShrink: 0, marginTop: 1, pointerEvents: 'none' }}><CyclingArtistImage images={live.artistImages} alt={live.artist} size={16} intervalMs={2400} /></div>
                          : live.artistImage && (
                            <img
                              src={live.artistImage}
                              alt={live.artist}
                              style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 1, pointerEvents: 'none' }}
                            />
                          )
                        }
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, pointerEvents: 'none' }}>
                          <span
                            style={{
                              ...ty.caption,
                              fontSize: 9,
                              fontWeight: 700,
                              color: 'inherit',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.4,
                            }}
                          >
                            {live.title}
                          </span>
                          <span
                            style={{
                              fontSize: 8,
                              color: 'inherit',
                              opacity: 0.75,
                              lineHeight: 1.3,
                              fontFamily: 'var(--font-google-sans), sans-serif',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {live.openingTime ?? live.startTime}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
