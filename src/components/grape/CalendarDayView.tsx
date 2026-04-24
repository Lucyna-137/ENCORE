'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { CaretLeft, CaretRight, Cake, Warning } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, GrapeArtist } from '@/lib/grape/types'
import { TODAY, HOUR_HEIGHT_DAY as HOUR_HEIGHT, TIME_COL_WIDTH_DAY as TIME_COL_WIDTH, DOW_SUN_FIRST as DOW_JA } from '@/lib/grape/constants'
import { getHolidayName } from '@/lib/grape/holidays'
import { useShowHolidays } from '@/lib/grape/useShowHolidays'
import CyclingArtistImage from './CyclingArtistImage'

interface CalendarDayViewProps {
  date: string
  lives: GrapeLive[]
  artists?: GrapeArtist[]
  onPrevDay: () => void
  onNextDay: () => void
  /** タップ or ドラッグで空きスロットから新規作成。`endMin` 指定時は範囲確保モード（15分精度） */
  onSlotTap: (date: string, startMin: number, endMin?: number) => void
  onEventTap: (live: GrapeLive) => void
  onEventDrop?: (liveId: string, newDate: string, newStartMin: number) => void
  /** ハイライト開始（分） */
  highlightStartMin?: number | null
  /** ハイライト終了（分）。指定あれば範囲ハイライト */
  highlightEndMin?: number | null
  /** チケット期限マーカーがタップされた時。関連イベントの詳細画面を開く想定 */
  onUrgencyTap?: (live: GrapeLive) => void
  /**
   * 全ライブ（当日のみならず、期限が当日に設定されているライブも含めて検索する用）。
   * lives は props として渡されているが date filter 後の場合があるため、
   * allLives で全体を渡せる場合はそちらを参照する。
   */
  allLives?: GrapeLive[]
}

/** 15分スナップでピクセル→分に変換 */
function yToMinSnap(y: number, hourHeight: number): number {
  const min = Math.round((y / hourHeight) * 60 / 15) * 15
  return Math.max(0, Math.min(24 * 60, min))
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
  highlightStartMin,
  highlightEndMin,
  onUrgencyTap,
  allLives,
}: CalendarDayViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isToday = date === TODAY
  const showHolidays = useShowHolidays()
  const holidayName = showHolidays ? getHolidayName(date) : null
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  // 空きスロットからの drag-to-create
  const [createDrag, setCreateDrag] = useState<{ startY: number; currentY: number } | null>(null)
  const DRAG_TAP_THRESHOLD = 6 // px 未満ならタップ扱い
  // iOS Safari 対策: touch は native addEventListener + 非パッシブ touchmove で処理。
  // React の onTouchMove は passive なため preventDefault が効かず、スクロール奪取できない。
  const eventAreaRef = useRef<HTMLDivElement>(null)
  // 空きコマへのゴースト枠確保の長押し閾値。短すぎると誤タップで作成誘発、
  // 長すぎると「応答遅い」印象。500ms がネイティブ長押しの感覚目安。
  const LONG_PRESS_MS = 500

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

  // ─── Native touch 長押し drag-to-create（iOS Safari 対応）──────────────
  // React の onTouchMove は passive のため preventDefault が効かない。
  // native addEventListener で { passive: false } を指定することで、
  // iOS Safari でも mid-gesture でスクロールをキャンセル → drag モードへ移行できる。
  useEffect(() => {
    const el = eventAreaRef.current
    if (!el) return

    let longPressTimer: ReturnType<typeof setTimeout> | null = null
    let dragMode = false
    let startY = 0
    let currentY = 0

    const cleanup = () => {
      if (longPressTimer != null) {
        clearTimeout(longPressTimer)
        longPressTimer = null
      }
      dragMode = false
    }

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      if (draggingId) return
      const target = e.target as HTMLElement
      if (target.closest('[data-event-block="true"]')) return

      const rect = el.getBoundingClientRect()
      startY = e.touches[0].clientY - rect.top
      currentY = startY
      dragMode = false

      longPressTimer = setTimeout(() => {
        // 長押し発火: drag モード ON
        dragMode = true
        setCreateDrag({ startY, currentY })
        try { navigator.vibrate?.(10) } catch {}
        longPressTimer = null
      }, LONG_PRESS_MS)
    }

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      const rect = el.getBoundingClientRect()
      const y = e.touches[0].clientY - rect.top
      currentY = y

      if (longPressTimer != null) {
        // 長押し待機中: ユーザーが動かした → スクロール意図とみなしてタイマーキャンセル
        if (Math.abs(y - startY) > DRAG_TAP_THRESHOLD) {
          clearTimeout(longPressTimer)
          longPressTimer = null
        }
        return // native scroll に任せる
      }

      if (dragMode) {
        // drag モード中: native scroll を停止し、ghost 帯を更新
        e.preventDefault()
        const clamped = Math.max(0, Math.min(24 * HOUR_HEIGHT, y))
        setCreateDrag(prev => prev ? { ...prev, currentY: clamped } : prev)
      }
    }

    const onTouchEnd = () => {
      if (longPressTimer != null) {
        // 長押し未発火で離した → タップとして処理
        clearTimeout(longPressTimer)
        longPressTimer = null
        const startMin = yToMinSnap(startY, HOUR_HEIGHT)
        const tapStartMin = Math.floor(startMin / 60) * 60
        onSlotTap(date, tapStartMin)
        return
      }

      if (dragMode) {
        dragMode = false
        const dy = Math.abs(currentY - startY)
        const minY = Math.min(startY, currentY)
        const maxY = Math.max(startY, currentY)
        const startMin = yToMinSnap(minY, HOUR_HEIGHT)
        setCreateDrag(null)
        if (dy < DRAG_TAP_THRESHOLD) {
          const tapStartMin = Math.floor(startMin / 60) * 60
          onSlotTap(date, tapStartMin)
        } else {
          const endMin = yToMinSnap(maxY, HOUR_HEIGHT)
          const safeEndMin = Math.min(24 * 60 - 1, Math.max(endMin, startMin + 30))
          onSlotTap(date, startMin, safeEndMin)
        }
      }
    }

    const onTouchCancel = () => {
      cleanup()
      setCreateDrag(null)
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
    el.addEventListener('touchcancel', onTouchCancel, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
      el.removeEventListener('touchcancel', onTouchCancel)
      cleanup()
    }
  }, [date, draggingId, onSlotTap])

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
          <span style={{
            ...ty.heading,
            // 祝日なら日曜と同じ赤系で日付を強調
            color: holidayName ? 'var(--color-encore-error)' : undefined,
          }}>{formatDateLabel(date)}</span>
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
          {/* 祝日名（小さく控えめに・操作の邪魔にならないよう右側に配置）*/}
          {holidayName && (
            <span
              style={{
                ...ty.caption,
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 999,
                background: 'rgba(219,96,80,0.14)',
                color: 'var(--color-encore-error)',
              }}
            >
              {holidayName}
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

      {/* 期限バナー（当日が期限日なら表示。タップで関連イベント詳細へ） */}
      {(() => {
        const source = allLives ?? lives
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        type DayUrgency = { tone: 'danger' | 'warn' | 'info'; label: string; live: GrapeLive }
        const marks: DayUrgency[] = []
        const pushMark = (triggerDate: string, label: string, live: GrapeLive) => {
          if (triggerDate !== date) return
          const [y, m, d] = triggerDate.split('-').map(Number)
          const target = new Date(y, m - 1, d)
          target.setHours(0, 0, 0, 0)
          const diff = Math.round((target.getTime() - today.getTime()) / 86400000)
          if (diff < 0 || diff > 14) return
          const tone: DayUrgency['tone'] =
            diff <= 2 ? 'danger' : diff <= 5 ? 'warn' : 'info'
          marks.push({ tone, label, live })
        }
        for (const l of source) {
          if (l.ticketStatus === 'waiting'     && l.announcementDate) pushMark(l.announcementDate, `抽選発表: ${l.title}`, l)
          if (l.ticketStatus === 'before-sale' && l.saleStartDate)    pushMark(l.saleStartDate,    `発売開始: ${l.title}`, l)
          if (l.ticketStatus === 'payment-due' && l.ticketDeadline)   pushMark(l.ticketDeadline,   `入金期限: ${l.title}`, l)
        }
        if (marks.length === 0) return null
        const topTone: DayUrgency['tone'] =
          marks.some(m => m.tone === 'danger') ? 'danger'
          : marks.some(m => m.tone === 'warn') ? 'warn'
          : 'info'
        const palette = {
          danger: { bg: 'rgba(219,96,80,0.10)', border: 'rgba(219,96,80,0.30)', fg: 'var(--color-encore-error)' },
          warn:   { bg: 'rgba(219,96,80,0.08)', border: 'rgba(219,96,80,0.22)', fg: 'var(--color-encore-error)' },
          info:   { bg: 'var(--color-encore-bg-section)', border: 'var(--color-encore-border-light)', fg: 'var(--color-encore-green)' },
        }[topTone]
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '8px 14px',
              background: palette.bg,
              borderBottom: `1px solid ${palette.border}`,
              flexShrink: 0,
            }}
          >
            {marks.map((m, i) => (
              <button
                key={i}
                onClick={() => onUrgencyTap?.(m.live)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 8px',
                  borderRadius: 8,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Warning size={14} weight="fill" color={palette.fg} style={{ flexShrink: 0 }} />
                <span style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: palette.fg,
                  flex: 1, minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {m.label}
                </span>
                <span style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: palette.fg,
                  opacity: 0.7,
                  flexShrink: 0,
                }}>
                  詳細 ›
                </span>
              </button>
            ))}
          </div>
        )
      })()}

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
                  <span style={{ ...ty.captionMuted, fontSize: 12 }}>
                    {h}:00
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Event area */}
          <div
            ref={eventAreaRef}
            style={{
              flex: 1,
              position: 'relative',
              background: isDragOver ? 'var(--color-grape-tint-04)' : 'transparent',
              transition: 'background 0.15s',
              // touch-action: pan-y で native scroll を許可。長押しで drag モードに
              // 入った瞬間、非パッシブ touchmove で preventDefault → スクロール停止 →
              // drag ghost が描画される（native touch listener で実装・iOS Safari 対応）。
              touchAction: 'pan-y',
              // ネイティブ選択ハイライト残留を防止
              WebkitUserSelect: 'none',
              userSelect: 'none',
              WebkitTouchCallout: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
            // マウス（デスクトップ）専用: 即座にドラッグモード
            // touch は上の useEffect の native listener で処理
            onPointerDown={(e) => {
              if (e.pointerType !== 'mouse') return
              if (draggingId) return
              if (e.button !== 0) return
              const target = e.target as HTMLElement
              if (target.closest('[data-event-block="true"]')) return
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const y = e.clientY - rect.top
              setCreateDrag({ startY: y, currentY: y })
              try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch {}
            }}
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse') return
              if (!createDrag) return
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
              const y = Math.max(0, Math.min(24 * HOUR_HEIGHT, e.clientY - rect.top))
              setCreateDrag(prev => prev ? { ...prev, currentY: y } : prev)
            }}
            onPointerUp={(e) => {
              if (e.pointerType !== 'mouse') return
              if (!createDrag) return
              try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch {}
              const { startY, currentY } = createDrag
              setCreateDrag(null)
              const dy = Math.abs(currentY - startY)
              const minY = Math.min(startY, currentY)
              const maxY = Math.max(startY, currentY)
              const startMin = yToMinSnap(minY, HOUR_HEIGHT)
              if (dy < DRAG_TAP_THRESHOLD) {
                const tapStartMin = Math.floor(startMin / 60) * 60
                onSlotTap(date, tapStartMin)
              } else {
                const endMin = yToMinSnap(maxY, HOUR_HEIGHT)
                const safeEndMin = Math.min(24 * 60 - 1, Math.max(endMin, startMin + 30))
                onSlotTap(date, startMin, safeEndMin)
              }
            }}
            onPointerCancel={(e) => {
              if (e.pointerType !== 'mouse') return
              setCreateDrag(null)
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

            {/* Slot highlight（endMin指定時は範囲ハイライト・15分精度） */}
            {highlightStartMin != null && (() => {
              const isRange = highlightEndMin != null && highlightEndMin > highlightStartMin
              const effectiveEnd = isRange ? highlightEndMin! : highlightStartMin + 60
              const top = (highlightStartMin / 60) * HOUR_HEIGHT
              const height = ((effectiveEnd - highlightStartMin) / 60) * HOUR_HEIGHT
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: top + 1,
                    left: 3,
                    right: 3,
                    height: Math.max(height - 2, 18),
                    background: 'var(--color-grape-tint-12)',
                    borderRadius: 6,
                    border: '1.5px solid var(--color-encore-green)',
                    pointerEvents: 'none',
                    zIndex: 3,
                    // 範囲（drag-created）はゴースト位置と完全一致するので非アニメ。タップのみ従来のバウンド。
                    animation: isRange ? 'none' : 'slot-appear 0.18s cubic-bezier(0.34,1.56,0.64,1) both',
                  }}
                />
              )
            })()}

            {/* Drag-to-create ゴーストブロック */}
            {createDrag && Math.abs(createDrag.currentY - createDrag.startY) >= DRAG_TAP_THRESHOLD && (() => {
              const minY = Math.min(createDrag.startY, createDrag.currentY)
              const maxY = Math.max(createDrag.startY, createDrag.currentY)
              const startMinSnap = yToMinSnap(minY, HOUR_HEIGHT)
              const endMinSnap   = Math.max(yToMinSnap(maxY, HOUR_HEIGHT), startMinSnap + 30)
              const top = (startMinSnap / 60) * HOUR_HEIGHT
              const height = ((endMinSnap - startMinSnap) / 60) * HOUR_HEIGHT
              const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
              return (
                <div
                  style={{
                    position: 'absolute',
                    top: top + 1,
                    left: 3,
                    right: 3,
                    height: Math.max(height - 2, 18),
                    background: 'rgba(26,58,45,0.14)',
                    borderRadius: 8,
                    border: '1.5px solid var(--color-encore-green)',
                    pointerEvents: 'none',
                    zIndex: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-google-sans), sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--color-encore-green)',
                    background: 'rgba(255,255,255,0.9)',
                    padding: '2px 8px',
                    borderRadius: 999,
                  }}>
                    {fmt(startMinSnap)} – {fmt(Math.min(endMinSnap, 24 * 60 - 1))}
                  </span>
                </div>
              )
            })()}

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
                  data-event-block="true"
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
                    {/* アーティスト画像を優先（推し活ユーザーは小さいサイズでもアー写で即認識）
                        カバーアートは大画面（EventPreviewScreen 等）専用。
                        優先順位: 複数アーティストのサイクリング > 単独アー写 > カバー fallback */}
                    {(live.artistImages && live.artistImages.length > 1) ? (
                      <div style={{ flexShrink: 0 }}><CyclingArtistImage images={live.artistImages} alt={live.artist} size={20} intervalMs={2400} /></div>
                    ) : live.artistImage ? (
                      <img
                        src={live.artistImage}
                        alt={live.artist}
                        style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : live.coverImage && (
                      <img
                        src={live.coverImage}
                        alt={live.title}
                        style={{ width: 20, height: 20, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <span
                      style={{
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        fontSize: 14,
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
