'use client'

import React, { useMemo, useState, useRef } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, GrapeArtist } from '@/lib/grape/types'
import { TODAY, DOW_SUN_FIRST as DOW_LABELS } from '@/lib/grape/constants'
import AttendanceStatusMarker from './AttendanceStatusMarker'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'

interface CalendarMonthViewProps {
  year: number
  month: number
  lives: GrapeLive[]
  /** 期限マーカー計算用の全ライブ（月跨ぎの期限日に対応） */
  allLives?: GrapeLive[]
  artists?: GrapeArtist[]
  onDaySelect: (date: string) => void
  selectedDate: string | null
  onPrevMonth?: () => void
  onNextMonth?: () => void
  onEventDrop?: (liveId: string, newDate: string, newHour: number) => void
  /** チケット期限マーカーがタップされた時。関連イベントの詳細画面を開く想定 */
  onUrgencyTap?: (live: GrapeLive) => void
}

// ─── Birthday tooltip ────────────────────────────────────────────────────────
interface BirthdayTooltipData {
  dateStr: string
  artists: GrapeArtist[]
  top: number
  left: number
}

function BirthdayTooltipCard({ data, onClose }: { data: BirthdayTooltipData; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 65 }}
      />
      {/* Card */}
      <div
        style={{
          position: 'absolute',
          top: data.top,
          left: data.left,
          zIndex: 66,
          background: 'var(--color-encore-bg)',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.20)',
          border: '1px solid var(--color-encore-border-light)',
          overflow: 'hidden',
          minWidth: 172,
        }}
      >
        {data.artists.map((artist, i) => {
          const parts = (artist.birthday ?? '').split('-')
          const dateLabel = parts.length === 3
            ? `${parseInt(parts[1])}.${parts[2]}`
            : ''
          return (
            <div
              key={artist.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderTop: i > 0 ? '1px solid var(--color-encore-border-light)' : 'none',
              }}
            >
              {artist.image ? (
                <img
                  src={artist.image}
                  alt={artist.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--color-grape-tint-10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>🎂</div>
              )}
              <div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--color-encore-green)',
                  lineHeight: 1.3,
                }}>
                  {artist.name} 誕生日
                </div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12,
                  color: 'var(--color-encore-text-sub)',
                  marginTop: 2,
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

function toDateStr(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

function isPast(dateStr: string): boolean {
  return dateStr < TODAY
}

export default function CalendarMonthView({
  year,
  month,
  lives,
  allLives,
  artists,
  onDaySelect,
  selectedDate,
  onPrevMonth,
  onNextMonth,
  onEventDrop,
  onUrgencyTap,
}: CalendarMonthViewProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [dragOverDate, setDragOverDate] = React.useState<string | null>(null)
  const [activeBirthday, setActiveBirthday] = useState<BirthdayTooltipData | null>(null)
  const [activeUrgency, setActiveUrgency] = useState<{
    dateStr: string
    top: number
    left: number
    arrow: 'up' | 'down'
    arrowX: number
    labels: string[]
  } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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

  /** 期限マーカーのホバー時: ツールチップ位置を計算して activeUrgency にセット
   *  ポジション基準（座標空間）: containerRef
   *  可視範囲クランプ基準: 最寄りの `.grape-phone-frame`（デスクトッププレビュー時の
   *  見切れ対策）。見つからなければ containerRef 自体を使う。 */
  const showUrgencyTooltip = (
    target: HTMLElement,
    dateStr: string,
    labels: string[],
  ) => {
    const container = containerRef.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const frameEl =
      (container.closest('.grape-phone-frame') as HTMLElement | null) ?? container
    const fRect = frameEl.getBoundingClientRect()
    const tRect = target.getBoundingClientRect()
    const TOOLTIP_W = 220
    const TOOLTIP_H = 20 + labels.length * 18
    // container 座標でのターゲット中心
    const targetCenterX = tRect.left - cRect.left + tRect.width / 2
    // 可視範囲（PhoneFrame）を container 座標に変換
    const visibleLeft = fRect.left - cRect.left + 6
    const visibleRight = fRect.right - cRect.left - 6
    const visibleTop = fRect.top - cRect.top + 6
    const visibleBottom = fRect.bottom - cRect.top - 6
    // 左右クランプ
    let left = targetCenterX - TOOLTIP_W / 2
    if (left < visibleLeft) left = visibleLeft
    if (left + TOOLTIP_W > visibleRight) left = visibleRight - TOOLTIP_W
    // 矢印の X 位置（ツールチップ起点）
    const arrowX = Math.max(10, Math.min(TOOLTIP_W - 10, targetCenterX - left))
    // 上下クランプ
    let top = tRect.bottom - cRect.top + 8
    let arrow: 'up' | 'down' = 'up'
    if (top + TOOLTIP_H > visibleBottom) {
      top = tRect.top - cRect.top - TOOLTIP_H - 8
      arrow = 'down'
    }
    if (top < visibleTop) top = visibleTop
    setActiveUrgency({ dateStr, top, left, arrow, arrowX, labels })
  }

  const handleBirthdayTap = (e: React.MouseEvent, dateStr: string, bArtists: GrapeArtist[]) => {
    e.stopPropagation()
    if (activeBirthday?.dateStr === dateStr) { setActiveBirthday(null); return }
    const container = containerRef.current
    if (!container) return
    const cRect = container.getBoundingClientRect()
    const bRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const TOOLTIP_W = 180
    const TOOLTIP_H = bArtists.length * 58
    let left = bRect.left - cRect.left - 4
    if (left + TOOLTIP_W > cRect.width - 4) left = cRect.width - TOOLTIP_W - 4
    if (left < 4) left = 4
    let top = bRect.bottom - cRect.top + 6
    if (top + TOOLTIP_H > cRect.height - 4) top = bRect.top - cRect.top - TOOLTIP_H - 6
    setActiveBirthday({ dateStr, artists: bArtists, top, left })
  }

  // Build livesByDate map
  const livesByDate = useMemo(() => {
    const map = new Map<string, GrapeLive[]>()
    for (const live of lives) {
      const arr = map.get(live.date) ?? []
      arr.push(live)
      map.set(live.date, arr)
    }
    return map
  }, [lives])

  // ── チケット期限/抽選発表/発売開始 のマーカー用マップ ───────────────────
  // dateStr → [{tone, label, live}] （14日以内）
  type UrgencyMark = { tone: 'danger' | 'warn' | 'info'; label: string; live: GrapeLive }
  const urgencyByDate = useMemo(() => {
    const map = new Map<string, UrgencyMark[]>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const pushMark = (date: string, label: string, live: GrapeLive) => {
      const [y, m, d] = date.split('-').map(Number)
      const target = new Date(y, m - 1, d)
      target.setHours(0, 0, 0, 0)
      const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
      if (diff < 0 || diff > 14) return
      const tone: UrgencyMark['tone'] =
        diff <= 2 ? 'danger'
        : diff <= 5 ? 'warn'
        : 'info'
      const arr = map.get(date) ?? []
      arr.push({ tone, label, live })
      map.set(date, arr)
    }
    // allLives があれば期限は全ライブから検索（月跨ぎ対応）、なければ当月 lives から
    const source = allLives ?? lives
    for (const l of source) {
      if (l.ticketStatus === 'waiting'     && l.announcementDate) pushMark(l.announcementDate, `抽選発表: ${l.title}`, l)
      if (l.ticketStatus === 'before-sale' && l.saleStartDate)    pushMark(l.saleStartDate,    `発売開始: ${l.title}`, l)
      if (l.ticketStatus === 'payment-due' && l.ticketDeadline)   pushMark(l.ticketDeadline,   `入金期限: ${l.title}`, l)
    }
    return map
  }, [lives, allLives])

  // Calendar grid
  const { weeks } = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startDow = firstDay.getDay() // 0=Sun
    const daysInMonth = lastDay.getDate()

    const cells: Array<{ day: number | null; dateStr: string | null }> = []

    // Padding at start
    for (let i = 0; i < startDow; i++) {
      cells.push({ day: null, dateStr: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, dateStr: toDateStr(year, month, d) })
    }
    // Pad to complete weeks
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, dateStr: null })
    }

    const weeks: typeof cells[] = []
    for (let i = 0; i < cells.length; i += 7) {
      weeks.push(cells.slice(i, i + 7))
    }
    return { weeks }
  }, [year, month])

  const monthLabel = `${year}年${month}月`

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
      {/* Month header */}
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
          onClick={onPrevMonth}
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
        <span style={{ ...ty.heading }}>{monthLabel}</span>
        <button
          onClick={onNextMonth}
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

      {/* DOW header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          background: 'var(--color-encore-border-light)',
          gap: 1,
        }}
      >
        {DOW_LABELS.map((label, i) => (
          <div
            key={label}
            style={{
              background: 'var(--color-encore-bg)',
              textAlign: 'center',
              padding: '6px 0',
              ...ty.caption,
              fontWeight: 700,
              fontSize: 12,
              color:
                i === 0
                  ? 'var(--color-encore-error)'
                  : i === 6
                  ? 'var(--color-encore-green-muted)'
                  : 'rgba(26,58,45,0.70)',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          background: 'var(--color-encore-border-light)',
          gap: 1,
          flex: 1,
        }}
      >
        {weeks.flat().map((cell, idx) => {
          if (!cell.day || !cell.dateStr) {
            return (
              <div
                key={`empty-${idx}`}
                style={{
                  background: 'var(--color-encore-bg)',
                  minHeight: 56,
                  opacity: 0.3,
                }}
              />
            )
          }

          const dateStr = cell.dateStr
          const dayLives = livesByDate.get(dateStr) ?? []
          const isToday = dateStr === TODAY
          const isSelected = dateStr === selectedDate
          const past = isPast(dateStr)
          const dow = idx % 7

          const primaryLive = dayLives[0]
          const overflowCount = dayLives.length - 1

          // 誕生日アーティスト
          const [, cellMm, cellDd] = dateStr.split('-')
          const birthdayArtistsForCell = birthdayMap.get(`${cellMm}-${cellDd}`) ?? []

          // チケット期限マーカー（最も厳しいトーンを採用）
          const urgencyMarks = urgencyByDate.get(dateStr) ?? []
          const urgencyTone: 'danger' | 'warn' | 'info' | null =
            urgencyMarks.length === 0 ? null
            : urgencyMarks.some(m => m.tone === 'danger') ? 'danger'
            : urgencyMarks.some(m => m.tone === 'warn')   ? 'warn'
            : 'info'

          return (
            <div
              key={dateStr}
              onClick={() => { if (!draggingId) onDaySelect(dateStr) }}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }}
              onDragEnter={(e) => { e.preventDefault(); setDragOverDate(dateStr) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverDate(null) }}
              onDrop={(e) => {
                e.preventDefault()
                setDragOverDate(null)
                const liveId = e.dataTransfer.getData('liveId')
                if (!liveId) return
                const live = lives.find(l => l.id === liveId)
                if (!live) return
                const hour = parseInt(live.startTime.split(':')[0])
                onEventDrop?.(liveId, dateStr, hour)
                setDraggingId(null)
              }}
              style={{
                background: dragOverDate === dateStr
                  ? 'var(--color-grape-tint-12)'
                  : isSelected
                  ? 'var(--color-grape-tint-08)'
                  : 'var(--color-encore-bg)',
                minHeight: 56,
                position: 'relative',
                cursor: 'pointer',
                opacity: past ? 0.5 : 1,
                WebkitTapHighlightColor: 'transparent',
                padding: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                transition: 'background 0.15s',
              }}
            >
              {/* Birthday marker */}
              {birthdayArtistsForCell.length > 0 && (
                <button
                  onClick={(e) => handleBirthdayTap(e, dateStr, birthdayArtistsForCell)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: 13,
                    lineHeight: 1,
                    WebkitTapHighlightColor: 'transparent',
                    zIndex: 1,
                  }}
                >
                  🎂
                </button>
              )}

              {/* 期限マーカーは Date number ブロック内で描画（案 B 採用） */}

              {/* Date number（期限マーカーを日付に塗り込む = 案 B 採用） */}
              {(() => {
                const isUrgent = !!urgencyTone
                // トーン別パレット
                //   info  : 罫線なし・薄い赤系 tint を塗る
                //   warn  : 薄い tint + 細い罫線
                //   danger: 濃い赤 + 白文字 + 明滅
                const urgencyPalette = (() => {
                  if (!urgencyTone) return null
                  if (urgencyTone === 'info') return {
                    bg: 'rgba(219,96,80,0.10)',
                    outline: 'none',
                    textColor: null, // null = 通常色を維持
                  }
                  if (urgencyTone === 'warn') return {
                    bg: 'rgba(219,96,80,0.14)',
                    outline: '1.5px solid rgba(219,96,80,0.42)',
                    textColor: 'var(--color-encore-error)',
                  }
                  // danger
                  return {
                    bg: 'var(--color-encore-error)',
                    outline: 'none',
                    textColor: 'var(--color-encore-white)',
                  }
                })()

                const bgColor = urgencyPalette
                  ? urgencyPalette.bg
                  : (isToday ? 'var(--color-encore-green)' : 'transparent')
                const outline = urgencyPalette
                  ? urgencyPalette.outline
                  : (isSelected && !isToday ? '2px solid var(--color-encore-green)' : 'none')
                const textColor =
                  urgencyPalette?.textColor ?? (
                    isToday ? 'var(--color-encore-white)'
                    : dow === 0 ? 'var(--color-encore-error)'
                    : dow === 6 ? 'var(--color-encore-green-muted)'
                    : 'var(--color-encore-green)'
                  )
                const animation = urgencyTone === 'danger'
                  ? 'urgencyDateFlash 1.4s ease-in-out infinite'
                  : 'none'
                const handleUrgencyTap = isUrgent
                  ? (e: React.MouseEvent) => { e.stopPropagation(); onUrgencyTap?.(urgencyMarks[0].live) }
                  : undefined
                const urgencyLabels = isUrgent ? urgencyMarks.map(m => m.label) : []

                return (
                  <div
                    onClick={handleUrgencyTap}
                    onMouseEnter={isUrgent ? (e) => showUrgencyTooltip(e.currentTarget, dateStr, urgencyLabels) : undefined}
                    onMouseLeave={isUrgent ? () => setActiveUrgency(null) : undefined}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 7,
                      background: bgColor,
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      outline,
                      cursor: isUrgent ? 'pointer' : undefined,
                      animation,
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span
                      style={{
                        ...ty.body,
                        fontWeight: 700,
                        fontSize: 15,
                        color: textColor,
                        lineHeight: 1,
                      }}
                    >
                      {cell.day}
                    </span>
                  </div>
                )
              })()}

              {/* Cover image thumbnail + overflow */}
              {primaryLive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    left: 5,
                  }}
                >
                  <div
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation()
                      setDraggingId(primaryLive.id)
                      e.dataTransfer.setData('liveId', primaryLive.id)
                      e.dataTransfer.effectAllowed = 'move'
                    }}
                    onDragEnd={() => { setDraggingId(null); setDragOverDate(null) }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 5,
                      overflow: 'hidden',
                      background: (() => {
                        if (primaryLive.color) {
                          const m = primaryLive.color.replace('#', '').match(/.{2}/g)
                          if (m && m.length >= 3) {
                            const [r, g, b] = m.map(x => parseInt(x, 16))
                            return `rgba(${r},${g},${b},0.2)`
                          }
                        }
                        return 'var(--color-encore-bg-section)'
                      })(),
                      flexShrink: 0,
                      position: 'relative',
                      opacity: draggingId === primaryLive.id ? 0.4 : 1,
                      cursor: 'grab',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {(primaryLive.coverImage || primaryLive.artistImage) && (
                      <img
                        src={primaryLive.coverImage ?? primaryLive.artistImage}
                        alt={primaryLive.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                  {dayLives.length > 1 && (
                    <div
                      onClick={(e) => { e.stopPropagation(); onDaySelect(dateStr) }}
                      style={{
                        position: 'absolute',
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        background: 'var(--color-encore-amber)',
                        color: 'var(--color-encore-white)',
                        borderRadius: '50%',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'var(--font-google-sans), sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        boxShadow: '0 0 0 1.5px var(--color-encore-bg)',
                        lineHeight: 1,
                      }}
                    >
                      {dayLives.length}
                    </div>
                  )}
                </div>
              )}

              {/* Attendance status marker */}
              {primaryLive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 5,
                    right: 5,
                  }}
                >
                  <AttendanceStatusMarker status={primaryLive.attendanceStatus} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Birthday tooltip */}
      {activeBirthday && (
        <BirthdayTooltipCard
          data={activeBirthday}
          onClose={() => setActiveBirthday(null)}
        />
      )}

      {/* 期限マーカーのツールチップ（ホバー時・エッジセーフ） */}
      {activeUrgency && (
        <div
          style={{
            position: 'absolute',
            top: activeUrgency.top,
            left: activeUrgency.left,
            width: 220,
            background: 'var(--color-encore-bg)',
            borderRadius: 10,
            boxShadow: '0 6px 22px rgba(0,0,0,0.18)',
            border: '1px solid var(--color-encore-border-light)',
            padding: '10px 12px',
            zIndex: 70,
            pointerEvents: 'none',
            animation: 'stackTooltipIn 0.16s ease-out both',
          }}
        >
          {/* 矢印 */}
          <div
            style={{
              position: 'absolute',
              left: activeUrgency.arrowX - 6,
              [activeUrgency.arrow === 'up' ? 'top' : 'bottom']: -6,
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              ...(activeUrgency.arrow === 'up'
                ? { borderBottom: '6px solid var(--color-encore-bg)' }
                : { borderTop: '6px solid var(--color-encore-bg)' }),
              filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.06))',
            }}
          />
          {activeUrgency.labels.map((label, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 12, fontWeight: 700,
                color: 'var(--color-encore-green)',
                lineHeight: 1.35,
                marginTop: i > 0 ? 4 : 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
