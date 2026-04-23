'use client'

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import { StatusBar } from '@/components/encore/NavHeader'
import type { GrapeLive, ViewMode } from '@/lib/grape/types'
import { useGrapeStore } from '@/lib/grape/useGrapeStore'
import { TODAY, CURRENT_YEAR, CURRENT_MONTH, BANNER_BG_COLOR, BANNER_BORDER_COLOR, resolveEventColor } from '@/lib/grape/constants'
import PhoneFrame from '@/components/grape/PhoneFrame'

function fmtTime(totalMin: number): string {
  const h = Math.min(Math.floor(totalMin / 60), 23)
  const m = totalMin % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
function parseMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
import CalendarMonthView from '@/components/grape/CalendarMonthView'
import CalendarWeekView from '@/components/grape/CalendarWeekView'
import CalendarDayView from '@/components/grape/CalendarDayView'
import CalendarListView, { type CalendarListViewHandle } from '@/components/grape/CalendarListView'
import DismissableBanner from '@/components/grape/DismissableBanner'
import QuickEventSheet from '@/components/grape/QuickEventSheet'
import MiniEventSheet from '@/components/grape/MiniEventSheet'
import EventPreviewScreen from '@/components/grape/EventPreviewScreen'
import AddActionSheet from '@/components/grape/AddActionSheet'
import URLImportSheet from '@/components/grape/URLImportSheet'
import PremiumUpgradeSheet from '@/components/grape/PremiumUpgradeSheet'
import { useIsPremium } from '@/lib/grape/premium'
import {
  CalendarBlank,
  Ticket,
  ChartBar,
  GearSix,
  Plus,
  BellRinging,
  Cake,
  X as XIcon,
} from '@phosphor-icons/react'

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: '月',    label: 'Month' },
  { value: '週',    label: 'Week'  },
  { value: '日',    label: 'Day'   },
  { value: 'リスト', label: 'List'  },
]

const TAB_ITEMS = [
  { key: 'calendar', label: 'CALENDAR', Icon: CalendarBlank, href: '/grape/calendar' },
  { key: 'tickets',  label: 'TICKETS',  Icon: Ticket,        href: '/grape/tickets'  },
  { key: 'report',   label: 'REPORT',   Icon: ChartBar,      href: '/grape/report'   },
  { key: 'settings', label: 'SETTINGS', Icon: GearSix,       href: '/grape/settings' },
]

// ─── 動的日付入りカレンダーアイコン（Google Calendar風） ─────────────────────
function TodayDateIcon({ dateStr, size = 28 }: { dateStr: string; size?: number }) {
  const day = parseInt(dateStr.split('-')[2], 10)
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="32" y="48" width="192" height="176" rx="12" stroke="currentColor" strokeWidth="16" fill="none" />
        <line x1="32" y1="104" x2="224" y2="104" stroke="currentColor" strokeWidth="16" />
        <line x1="88" y1="28" x2="88" y2="72" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
        <line x1="168" y1="28" x2="168" y2="72" stroke="currentColor" strokeWidth="16" strokeLinecap="round" />
      </svg>
      <span
        style={{
          position: 'absolute',
          bottom: size * 0.14,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: size * 0.36,
          fontWeight: 700,
          lineHeight: 1,
          color: 'currentColor',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {day}
      </span>
    </div>
  )
}

// ─── Sliding ViewToggle（ENCORE ViewToggle.tsx と同じパターン） ───────────────
function CalendarViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
}) {
  const activeIndex = VIEW_OPTIONS.findIndex(o => o.value === value)
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 3, width: 0 })

  useEffect(() => {
    const btn = btnRefs.current[activeIndex]
    if (btn) setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
  }, [activeIndex])

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--color-encore-bg-section)',
        borderRadius: 999,
        padding: 3,
      }}
    >
      {/* スライディングインジケーター */}
      <div
        style={{
          position: 'absolute',
          top: 3,
          bottom: 3,
          left: indicator.left,
          width: indicator.width,
          borderRadius: 999,
          background: 'var(--color-encore-green)',
          transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1)',
          pointerEvents: 'none',
        }}
      />
      {VIEW_OPTIONS.map((opt, i) => {
        const isActive = value === opt.value
        return (
          <button
            key={opt.value}
            ref={el => { btnRefs.current[i] = el }}
            onClick={() => onChange(opt.value)}
            style={{
              position: 'relative',
              height: 34,
              padding: '0 14px',
              borderRadius: 999,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: isActive ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
              transition: 'color 0.22s',
              whiteSpace: 'nowrap',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── 翌日通知バナー ────────────────────────────────────────────────────────────
function getTomorrow(today: string): string {
  const d = new Date(today + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

// ─── ビュー切り替え: 日付を引き継ぐためのヘルパー ───────────────────────────
/** dateStr（YYYY-MM-DD）を含む週の月曜日を返す */
function getMondayOf(dateStr: string): Date {
  const d = new Date(dateStr + 'T00:00:00')
  const dow = d.getDay() // 0=Sun
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('月')
  useEffect(() => {
    try {
      const v = localStorage.getItem('grape-calendar-view') as ViewMode | null
      if (v && ['月', '週', '日', 'リスト'].includes(v)) setViewMode(v)
      // 期限マーカー比較用の仮 state をクリーンアップ
      localStorage.removeItem('grape-urgency-style')
    } catch {}
  }, [])
  const [year, setYear] = useState(CURRENT_YEAR)
  const [month, setMonth] = useState(CURRENT_MONTH)
  type SheetState = 'none' | 'mini' | 'full'
  const [sheetState, setSheetState] = useState<SheetState>('none')
  const showQuickEvent = sheetState === 'full'
  const showMiniSheet = sheetState === 'mini'
  const [slotStartMin, setSlotStartMin] = useState<number | undefined>(undefined)
  const [slotEndMin, setSlotEndMin] = useState<number | undefined>(undefined)
  const [slotDate, setSlotDate] = useState<string>(TODAY)
  const [editingLive, setEditingLive] = useState<GrapeLive | null>(null)
  const [editOpenSection, setEditOpenSection] = useState<'ticket' | undefined>(undefined)
  const [previewLive, setPreviewLive] = useState<GrapeLive | null>(null)
  const [dayDate, setDayDate] = useState(TODAY)
  // Add flow (Premium: ActionSheet / URLImport / Prefill for QuickEventSheet)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [showUrlImport, setShowUrlImport] = useState(false)
  const [showPremiumSheet, setShowPremiumSheet] = useState(false)
  const [prefillLive, setPrefillLive] = useState<Partial<GrapeLive> | null>(null)
  const isPremium = useIsPremium()
  // 週ビュー: 月曜始まりの週開始日
  const [weekStart, setWeekStart] = useState(() => getMondayOf(TODAY))

  // ─── ストア（localStorage 永続化） ───────────────────────────────────────
  const { lives, artists, addLive, updateLive, deleteLive, updateLives, addArtist } = useGrapeStore()
  const setLives = updateLives
  const listViewRef = useRef<CalendarListViewHandle>(null)
  const [notifDismissed, setNotifDismissed] = useState(false)
  const [birthdayBannerDismissed, setBirthdayBannerDismissed] = useState(false)
  // リストビューへ切り替えた時点の注目日（リストから他ビューへ戻る際に使用）
  const [listEntryDate, setListEntryDate] = useState(TODAY)

  // アーティストカラーを解決したライブ一覧（ビュー表示用）
  const resolvedLives = useMemo(
    () => lives.map(l => ({ ...l, color: resolveEventColor(l, artists) })),
    [lives, artists],
  )

  // スマートデフォルト: 新規作成時の初期値として使える「直近のライブ」の種別
  const smartDefaults = useMemo(() => {
    if (lives.length === 0) return null
    const sorted = [...lives].sort((a, b) => {
      const k = b.date.localeCompare(a.date)
      if (k !== 0) return k
      return (b.startTime ?? '').localeCompare(a.startTime ?? '')
    })
    return {
      liveType: sorted[0].liveType || undefined,
    }
  }, [lives])

  // 会場サジェスト: 直近の順に重複排除した会場名を最大5件
  const recentVenues = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    const sorted = [...lives].sort((a, b) => {
      const k = b.date.localeCompare(a.date)
      if (k !== 0) return k
      return (b.startTime ?? '').localeCompare(a.startTime ?? '')
    })
    for (const l of sorted) {
      const v = l.venue?.trim()
      if (!v || seen.has(v)) continue
      seen.add(v)
      out.push(v)
      if (out.length >= 5) break
    }
    return out
  }, [lives])

  // 翌日の「行く」ライブ
  const TOMORROW = getTomorrow(TODAY)
  const tomorrowLives = useMemo(
    () => lives.filter(l => l.date === TOMORROW && l.attendanceStatus === 'planned'),
    [lives, TOMORROW],
  )

  // 今日の誕生日アーティスト
  const todayBirthdays = useMemo(() => {
    const [, mm, dd] = TODAY.split('-')
    const key = `${mm}-${dd}`
    return artists.filter(a => {
      if (!a.birthday) return false
      const [, bMm, bDd] = a.birthday.split('-')
      return `${bMm}-${bDd}` === key
    })
  }, [artists])

  // ─── トースト ──────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ message: string; prevLives: GrapeLive[] } | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [toastVisible, setToastVisible] = useState(false)

  const showToast = useCallback((message: string, prevLives: GrapeLive[]) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, prevLives })
    requestAnimationFrame(() => setToastVisible(true))
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 320)
    }, 4000)
  }, [])

  const dismissToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToastVisible(false)
    setTimeout(() => setToast(null), 320)
  }, [])

  // ─── ビュー切り替え（日付を引き継ぐ） ─────────────────────────────────────
  const switchView = useCallback((newMode: ViewMode) => {
    if (newMode === viewMode) return

    // 現在のビューから「注目日」を取得
    let focused: string
    if (viewMode === '日') {
      focused = dayDate
    } else if (viewMode === '週') {
      // 週の水曜日を使うと月をまたいだ時も自然な月に落ちやすい
      const wed = new Date(weekStart)
      wed.setDate(weekStart.getDate() + 2)
      focused = wed.toISOString().slice(0, 10)
    } else if (viewMode === '月') {
      // 表示中の月の1日（今日がその月にあれば今日）
      const prefix = `${year}-${String(month).padStart(2, '0')}`
      focused = TODAY.startsWith(prefix) ? TODAY : `${prefix}-01`
    } else {
      // リストビューから切り替える場合は、リスト遷移前に保存した日付を使う
      focused = listEntryDate
    }

    // リストへ切り替える際は現在の注目日を保存しておく
    if (newMode === 'リスト') {
      setListEntryDate(focused)
    }

    // 新しいビューに注目日を適用
    if (newMode === '週') {
      setWeekStart(getMondayOf(focused))
    } else if (newMode === '日') {
      setDayDate(focused)
    } else if (newMode === '月') {
      const parts = focused.split('-').map(Number)
      setYear(parts[0])
      setMonth(parts[1])
    }

    setViewMode(newMode)
    try { localStorage.setItem('grape-calendar-view', newMode) } catch {}
  }, [viewMode, dayDate, weekStart, year, month, listEntryDate])

  // ─── スライドアニメーション ───────────────────────────────────────────────
  const [animKey, setAnimKey] = useState(0)
  const [animDir, setAnimDir] = useState<'left' | 'right' | null>(null)

  // ナビゲーション + アニメーションをセット（left=次へ, right=前へ）
  const withAnim = useCallback((dir: 'left' | 'right', action: () => void) => {
    setAnimDir(dir)
    setAnimKey(k => k + 1)
    action()
  }, [])

  // ─── スワイプ検出（ナビハンドラーより後で定義するため ref 経由） ──────────
  const touchStartX = useRef<number | null>(null)
  const viewModeRef = useRef(viewMode)
  viewModeRef.current = viewMode

  const monthLives = useMemo(() => {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return resolvedLives.filter(l => l.date.startsWith(prefix))
  }, [year, month, resolvedLives])

  const weekLives = useMemo(() => {
    const end = new Date(weekStart)
    end.setDate(weekStart.getDate() + 6)
    const s = weekStart.toISOString().slice(0, 10)
    const e = end.toISOString().slice(0, 10)
    return resolvedLives.filter(l => l.date >= s && l.date <= e)
  }, [resolvedLives, weekStart])

  const dayLives = useMemo(
    () => resolvedLives.filter(l => l.date === dayDate),
    [resolvedLives, dayDate],
  )

  // ドロップ時に日時更新
  const handleEventDrop = (liveId: string, newDate: string, newStartMin: number) => {
    const prevLives = lives
    setLives(prev => prev.map(l => {
      if (l.id !== liveId) return l
      const startMin = parseMin(l.startTime)
      const endMin = l.endTime ? parseMin(l.endTime) : startMin + 60
      const duration = endMin - startMin
      const newEnd = newStartMin + duration
      return { ...l, date: newDate, startTime: fmtTime(newStartMin), endTime: fmtTime(Math.min(newEnd, 23 * 60 + 59)) }
    }))
    const [, m, d] = newDate.split('-').map(Number)
    const dow = ['日', '月', '火', '水', '木', '金', '土'][new Date(Number(newDate.split('-')[0]), m - 1, d).getDay()]
    showToast(`${m}月${d}日（${dow}） ${fmtTime(newStartMin)} に移動しました`, prevLives)
  }

  const handleStatusChange = (liveId: string, status: import('@/lib/grape/types').AttendanceStatus) => {
    setLives(prev => prev.map(l => l.id === liveId ? { ...l, attendanceStatus: status } : l))
    setPreviewLive(prev => prev?.id === liveId ? { ...prev, attendanceStatus: status } : prev)
  }

  const handleDeleteLive = (id: string) => {
    deleteLive(id)
    setPreviewLive(null)
  }

  const handleDuplicateLive = (live: GrapeLive) => {
    setPreviewLive(null)
    setEditingLive({ ...live, id: Date.now().toString() })
    setSlotStartMin(undefined)
    setSheetState('full')
  }

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }
  const handleGoToToday = () => {
    setYear(CURRENT_YEAR)
    setMonth(CURRENT_MONTH)
    setDayDate(TODAY)
    setWeekStart(getMondayOf(TODAY))
    if (viewMode === 'リスト') {
      listViewRef.current?.scrollToToday()
    }
  }
  const handlePrevWeek = () => {
    setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })
  }
  const handleNextWeek = () => {
    setWeekStart(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })
  }
  const handlePrevDay = () => {
    const d = new Date(dayDate); d.setDate(d.getDate() - 1)
    setDayDate(d.toISOString().slice(0, 10))
  }
  const handleNextDay = () => {
    const d = new Date(dayDate); d.setDate(d.getDate() + 1)
    setDayDate(d.toISOString().slice(0, 10))
  }

  // スワイプ開始・終了（全ハンドラー定義後に配置）
  const onSwipeStart = (x: number) => { touchStartX.current = x }
  const onSwipeEnd = (x: number) => {
    if (touchStartX.current === null || viewModeRef.current === 'リスト') return
    const dx = x - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return
    const vm = viewModeRef.current
    if (dx < 0) {
      if (vm === '月') withAnim('left', handleNextMonth)
      else if (vm === '週') withAnim('left', handleNextWeek)
      else if (vm === '日') withAnim('left', handleNextDay)
    } else {
      if (vm === '月') withAnim('right', handlePrevMonth)
      else if (vm === '週') withAnim('right', handlePrevWeek)
      else if (vm === '日') withAnim('right', handlePrevDay)
    }
  }

  return (
    <PhoneFrame>
        <StatusBar />

        {/* ── Large title header ── */}
        <div
          style={{
            padding: '8px 20px 12px',
            background: 'var(--color-encore-bg)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="grape-page-title" style={{ ...ty.display, lineHeight: 1 }}>Calendar</div>
          </div>
          <button
            onClick={handleGoToToday}
            title="今日に戻る"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 4px 0 2px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-encore-green)',
              WebkitTapHighlightColor: 'transparent',
              marginBottom: 2,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--color-encore-green)',
                letterSpacing: '0.02em',
              }}
            >
              今日
            </span>
            <TodayDateIcon dateStr={TODAY} size={28} />
          </button>
        </div>

        {/* ── ViewToggle strip ── */}
        <div
          style={{
            padding: '8px 20px',
            background: 'var(--color-encore-bg)',
            borderBottom: '1px solid var(--color-encore-border-light)',
            flexShrink: 0,
          }}
        >
          <CalendarViewToggle value={viewMode} onChange={switchView} />
        </div>

        {/* ── 誕生日バナー（List以外の時のみ固定表示） ── */}
        {viewMode !== 'リスト' && todayBirthdays.length > 0 && !birthdayBannerDismissed && (
          <DismissableBanner onDismiss={() => setBirthdayBannerDismissed(true)}>
            {(dismiss) => (
              <div style={{ background: BANNER_BG_COLOR, borderBottom: `1px solid ${BANNER_BORDER_COLOR}`, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <Cake size={15} weight="fill" color="var(--color-encore-amber)" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {todayBirthdays.map((a, i) => a.image ? (
                      <img key={a.id} src={a.image} alt={a.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginLeft: i > 0 ? -6 : 0, boxShadow: i > 0 ? '0 0 0 1.5px var(--color-encore-bg)' : 'none' }} />
                    ) : null)}
                  </div>
                  <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 700, color: 'var(--color-encore-amber)', marginRight: 5 }}>今日</span>
                    {todayBirthdays.map(a => a.name).join('、')} の誕生日
                  </span>
                </div>
                <button onClick={dismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0, color: 'var(--color-encore-text-muted)' }}>
                  <XIcon size={14} weight="bold" />
                </button>
              </div>
            )}
          </DismissableBanner>
        )}

        {/* ── 翌日ライブ通知バナー（List以外の時のみ固定表示） ── */}
        {viewMode !== 'リスト' && tomorrowLives.length > 0 && !notifDismissed && (
          <DismissableBanner onDismiss={() => setNotifDismissed(true)}>
            {(dismiss) => (
              <div style={{ position: 'relative', background: BANNER_BG_COLOR, borderBottom: `1px solid ${BANNER_BORDER_COLOR}`, padding: '9px 16px 9px 19px', display: 'flex', alignItems: 'center', gap: 9 }}>
                <span className="encore-border-pulse" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--color-encore-amber)' }} />
                <span className="encore-bell-ring" style={{ flexShrink: 0 }}>
                  <BellRinging size={15} weight="fill" color="var(--color-encore-amber)" />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--color-encore-amber)', marginRight: 6 }}>明日</span>
                  <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {tomorrowLives[0].title}
                    {tomorrowLives[0].startTime && ` ${tomorrowLives[0].startTime}〜`}
                    {tomorrowLives.length > 1 && <span style={{ color: 'var(--color-encore-text-muted)', marginLeft: 4 }}>他{tomorrowLives.length - 1}件</span>}
                  </span>
                </div>
                <button onClick={dismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0, color: 'var(--color-encore-text-muted)' }}>
                  <XIcon size={14} weight="bold" />
                </button>
              </div>
            )}
          </DismissableBanner>
        )}

        {/* ── Main content ── */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
          onTouchStart={(e) => onSwipeStart(e.touches[0].clientX)}
          onTouchEnd={(e) => onSwipeEnd(e.changedTouches[0].clientX)}
        >
          {/* スライドアニメーションラッパー（key変化でre-mountして毎回アニメ再生） */}
          <div
            key={animKey}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: animDir
                ? `${animDir === 'left' ? 'cal-slide-in-right' : 'cal-slide-in-left'} 0.28s cubic-bezier(0.4,0,0.2,1) both`
                : 'none',
            }}
          >
          {viewMode === '月' && (
            <CalendarMonthView
              year={year}
              month={month}
              lives={monthLives}
              allLives={resolvedLives}
              artists={artists}
              onDaySelect={(date) => {
                setDayDate(date)
                withAnim('left', () => setViewMode('日'))
              }}
              selectedDate={null}
              onPrevMonth={() => withAnim('right', handlePrevMonth)}
              onNextMonth={() => withAnim('left', handleNextMonth)}
              onEventDrop={handleEventDrop}
              onUrgencyTap={(live) => setPreviewLive(live)}
            />
          )}
          {viewMode === '週' && (
            <CalendarWeekView
              weekStart={weekStart}
              lives={weekLives}
              allLives={resolvedLives}
              artists={artists}
              onSlotTap={(date, startMin, endMin) => {
                setSlotDate(date)
                setSlotStartMin(startMin)
                setSlotEndMin(endMin)
                setEditingLive(null)
                setSheetState('mini')
              }}
              onEventTap={(live) => {
                setPreviewLive(live)
              }}
              onEventDrop={handleEventDrop}
              onPrevWeek={() => withAnim('right', handlePrevWeek)}
              onNextWeek={() => withAnim('left', handleNextWeek)}
              onUrgencyTap={(live) => setPreviewLive(live)}
              highlightSlot={sheetState !== 'none' && slotDate ? { date: slotDate, startMin: slotStartMin ?? 0, endMin: slotEndMin } : null}
            />
          )}
          {viewMode === '日' && (
            <CalendarDayView
              date={dayDate}
              lives={dayLives}
              artists={artists}
              onPrevDay={() => withAnim('right', handlePrevDay)}
              onNextDay={() => withAnim('left', handleNextDay)}
              onSlotTap={(date, startMin, endMin) => {
                setSlotDate(date)
                setSlotStartMin(startMin)
                setSlotEndMin(endMin)
                setEditingLive(null)
                setSheetState('mini')
              }}
              onEventTap={(live) => {
                setPreviewLive(live)
              }}
              onEventDrop={handleEventDrop}
              onUrgencyTap={(live) => setPreviewLive(live)}
              allLives={resolvedLives}
              highlightStartMin={sheetState !== 'none' && dayDate === slotDate ? slotStartMin ?? null : null}
              highlightEndMin={sheetState !== 'none' && dayDate === slotDate ? slotEndMin ?? null : null}
            />
          )}
          {viewMode === 'リスト' && (
            <CalendarListView
              ref={listViewRef}
              lives={resolvedLives}
              artists={artists}
              today={TODAY}
              onEventTap={(live) => {
                setPreviewLive(live)
              }}
              onAddTap={() => {
                setEditingLive(null)
                setSlotStartMin(undefined)
                setSheetState('full')
              }}
              todayBirthdays={todayBirthdays}
              tomorrowLives={tomorrowLives}
              birthdayBannerDismissed={birthdayBannerDismissed}
              onDismissBirthday={() => setBirthdayBannerDismissed(true)}
              notifDismissed={notifDismissed}
              onDismissNotif={() => setNotifDismissed(true)}
            />
          )}
          </div>

          {/* MiniEventSheet — 空きスロットタップ時のミニシート */}
          {showMiniSheet && (
            <MiniEventSheet
              date={slotDate}
              startMin={slotStartMin ?? 18 * 60}
              endMin={slotEndMin}
              sameDayLives={resolvedLives.filter(l => l.date === slotDate)}
              onCancel={() => { setSheetState('none'); setSlotStartMin(undefined); setSlotEndMin(undefined) }}
              onExpand={() => { setEditingLive(null); setSheetState('full') }}
            />
          )}


          {/* FAB */}
          {sheetState === 'none' && !previewLive && (
            <button
              onClick={() => {
                setEditingLive(null); setSlotStartMin(undefined); setPrefillLive(null)
                if (isPremium) {
                  setShowAddSheet(true)
                } else {
                  setSheetState('full')
                }
              }}
              style={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'var(--color-encore-green)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 100,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Plus size={22} weight="regular" color="var(--color-encore-white)" />
            </button>
          )}
        </div>

        {/* ── QuickEventSheet — フォンフレーム直下に配置してCalendarタイトルを覆う ── */}
        {showQuickEvent && (
          <QuickEventSheet
            date={editingLive?.date ?? prefillLive?.date ?? slotDate ?? TODAY}
            startMin={slotStartMin}
            endMin={slotEndMin}
            allLives={resolvedLives}
            smartDefaults={smartDefaults}
            recentVenues={recentVenues}
            live={editingLive ?? (prefillLive as GrapeLive | undefined)}
            artists={artists}
            onAddArtist={addArtist}
            openSection={editOpenSection}
            onShowPremium={() => setShowPremiumSheet(true)}
            onClose={() => { setSheetState('none'); setEditingLive(null); setSlotStartMin(undefined); setSlotEndMin(undefined); setEditOpenSection(undefined); setPrefillLive(null) }}
            onSave={(payload) => {
              let savedLive: GrapeLive
              if (editingLive) {
                savedLive = { ...editingLive, ...payload } as GrapeLive
                updateLive(savedLive)
              } else {
                savedLive = { id: `live-${Date.now()}`, ...payload } as GrapeLive
                addLive(savedLive)
              }
              setSheetState('none'); setEditingLive(null); setSlotStartMin(undefined); setSlotEndMin(undefined); setPrefillLive(null)
              setPreviewLive(savedLive)
            }}
          />
        )}

        {/* ── AddActionSheet (Premium only) ── */}
        {showAddSheet && (
          <AddActionSheet
            onClose={() => setShowAddSheet(false)}
            onNewEvent={() => {
              setShowAddSheet(false)
              setSheetState('full')
            }}
            onImportFromUrl={() => {
              setShowAddSheet(false)
              setShowUrlImport(true)
            }}
          />
        )}

        {/* ── URLImportSheet (Premium only) ── */}
        {showUrlImport && (
          <URLImportSheet
            artists={artists}
            onAddArtist={addArtist}
            onClose={() => setShowUrlImport(false)}
            onImport={(prefill) => {
              setShowUrlImport(false)
              setPrefillLive(prefill)
              setSheetState('full')
            }}
          />
        )}

        {/* ── PremiumUpgradeSheet ── */}
        {showPremiumSheet && (
          <PremiumUpgradeSheet onClose={() => setShowPremiumSheet(false)} />
        )}

        {/* ── EventPreviewScreen — フォンフレーム直下に配置してViewToggleを覆う ── */}
        <EventPreviewScreen
          live={previewLive}
          allLives={resolvedLives}
          onNavigate={(live) => setPreviewLive(live)}
          onClose={() => setPreviewLive(null)}
          onEdit={(live, section) => {
            setPreviewLive(null)
            setEditingLive(live)
            setEditOpenSection(section)
            setSlotStartMin(undefined)
            setSheetState('full')
          }}
          onDelete={handleDeleteLive}
          onDuplicate={handleDuplicateLive}
          onStatusChange={handleStatusChange}
        />

        {/* ── Toast ── */}
        {toast && (
          <div
            style={{
              position: 'absolute',
              left: 12,
              right: 12,
              bottom: 80,
              zIndex: 500,
              transform: toastVisible ? 'translateY(0)' : 'translateY(120%)',
              transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
              pointerEvents: toastVisible ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                background: 'var(--color-encore-green)',
                borderRadius: 14,
                padding: '13px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13,
                  fontWeight: 400,
                  color: 'var(--color-encore-white)',
                  flex: 1,
                }}
              >
                {toast.message}
              </span>
              <button
                onClick={() => { setLives(() => toast.prevLives); dismissToast() }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: 'var(--color-encore-amber)',
                  padding: '0 2px',
                  flexShrink: 0,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                元に戻す
              </button>
            </div>
          </div>
        )}

        {/* ── Tab Bar（TabBar.tsx準拠：regular・amber active・uppercase 9px 700） ── */}
        <div
          style={{
            height: 68,
            background: 'var(--color-encore-bg)',
            borderTop: '1px solid var(--color-encore-border-light)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-around',
            padding: '8px 4px 0',
            flexShrink: 0,
          }}
        >
          {TAB_ITEMS.map(({ key, label, Icon, href }) => {
            const isActive = key === 'calendar'
            const color = isActive ? 'var(--color-encore-amber)' : 'var(--color-encore-green)'
            return (
              <a
                key={key}
                href={href}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  textDecoration: 'none',
                  flex: 1,
                  paddingTop: 4,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon size={24} weight="regular" color={color} />
                <span
                  style={{
                    fontFamily: 'var(--font-google-sans), sans-serif',
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase' as const,
                    color,
                  }}
                >
                  {label}
                </span>
              </a>
            )
          })}
        </div>
    </PhoneFrame>
  )
}
