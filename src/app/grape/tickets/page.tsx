'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import * as ty from '@/components/encore/typographyStyles'
import { StatusBar } from '@/components/encore/NavHeader'
import type { GrapeLive, TicketStatus } from '@/lib/grape/types'
import { useGrapeStore } from '@/lib/grape/useGrapeStore'
import QuickEventSheet from '@/components/grape/QuickEventSheet'
import EventPreviewScreen from '@/components/grape/EventPreviewScreen'
import { TICKET_STATUS_CONFIG } from '@/lib/grape/constants'
import PhoneFrame from '@/components/grape/PhoneFrame'
import AddActionSheet from '@/components/grape/AddActionSheet'
import URLImportSheet from '@/components/grape/URLImportSheet'
import PremiumUpgradeSheet from '@/components/grape/PremiumUpgradeSheet'
import { useIsPremium } from '@/lib/grape/premium'
import { URL_IMPORT_ENABLED } from '@/lib/grape/apiConfig'
import HorizontalTabs from '@/components/encore/HorizontalTabs'
import {
  CalendarBlank, Ticket, ChartBar, GearSix,
  MagnifyingGlass, Plus, Warning, CaretRight, Clock, CheckCircle, X, UserCircle,
} from '@phosphor-icons/react'

import { TODAY } from '@/lib/grape/constants'

// ─── Tab config ───────────────────────────────────────────────────────────────
type TabKey = 'all' | 'active' | 'urgent' | 'done'

const TAB_KEYS: TabKey[] = ['all', 'active', 'urgent', 'done']
const TAB_LABELS = ['すべて', '申込中', '要対応', '完了']

function filterByTab(lives: GrapeLive[], tab: TabKey): GrapeLive[] {
  const withTicket = lives.filter(l => l.ticketStatus !== undefined)
  switch (tab) {
    case 'all':    return withTicket
    case 'active': return withTicket.filter(l => l.ticketStatus === 'before-sale' || l.ticketStatus === 'waiting')
    case 'urgent': return withTicket.filter(l => l.ticketStatus === 'payment-due')
    case 'done':   return withTicket.filter(l => ['paid', 'issued', 'done', 'pay-at-door'].includes(l.ticketStatus!))
    default:       return withTicket
  }
}

// Sort: urgent first, then by date ascending. Done items go to bottom.
function sortLives(lives: GrapeLive[]): GrapeLive[] {
  return [...lives].sort((a, b) => {
    const isDoneA = ['paid', 'issued', 'done', 'pay-at-door'].includes(a.ticketStatus!)
    const isDoneB = ['paid', 'issued', 'done', 'pay-at-door'].includes(b.ticketStatus!)
    if (isDoneA !== isDoneB) return isDoneA ? 1 : -1

    const urgencyA = a.ticketStatus === 'payment-due' ? 0 : 1
    const urgencyB = b.ticketStatus === 'payment-due' ? 0 : 1
    if (urgencyA !== urgencyB) return urgencyA - urgencyB
    return a.date.localeCompare(b.date)
  })
}

// ─── nextDateInfo helper ──────────────────────────────────────────────────────
function getNextDateInfo(live: GrapeLive): { label: string; daysLeft: number } | null {
  const dateStr = live.ticketStatus === 'payment-due' ? live.ticketDeadline
                : live.ticketStatus === 'waiting' ? live.announcementDate
                : null
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - new Date(TODAY).getTime()) / 86400000)
  const prefix = live.ticketStatus === 'payment-due' ? '入金期限' : '当落発表'
  const d = new Date(dateStr)
  const dateFormatted = `${d.getMonth() + 1}/${d.getDate()}`
  return { label: `${prefix} ${dateFormatted}`, daysLeft: diff }
}

// ─── Day-of-week labels ───────────────────────────────────────────────────────
const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

// ─── UrgencyBanner ────────────────────────────────────────────────────────────
function UrgencyBanner({
  count,
  onTap,
}: {
  count: number
  onTap: () => void
}) {
  return (
    <button
      onClick={onTap}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: '100%',
        padding: '10px 20px',
        background: 'rgba(255,149,0,0.10)',
        borderLeft: '3px solid var(--color-encore-amber)',
        border: 'none',
        borderLeftWidth: 3,
        borderLeftStyle: 'solid',
        borderLeftColor: 'var(--color-encore-amber)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
      }}
    >
      <Warning size={14} color="var(--color-encore-amber)" weight="regular" />
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--color-encore-amber)',
        }}
      >
        入金期限が近いイベントが{count}件あります
      </span>
      <CaretRight size={13} color="var(--color-encore-amber)" weight="regular" />
    </button>
  )
}

// ─── TicketCard ───────────────────────────────────────────────────────────────
function TicketCard({
  live,
  onTap,
}: {
  live: GrapeLive
  onTap: (live: GrapeLive) => void
}) {
  const dateObj = new Date(live.date)
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const dow = DOW_LABELS[dateObj.getDay()]
  const dowColor = 'var(--color-encore-text-sub)'

  const statusConfig = live.ticketStatus ? TICKET_STATUS_CONFIG[live.ticketStatus] : null
  const nextDate = getNextDateInfo(live)
  const isUrgentDate = nextDate !== null && nextDate.daysLeft <= 3
  const isDone = ['paid', 'issued', 'done', 'pay-at-door'].includes(live.ticketStatus ?? '')

  const coverSrc = live.coverImage ?? live.artistImage ?? live.artistImages?.[0]

  return (
    <button
      onClick={() => onTap(live)}
      style={{
        width: '100%',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: 'var(--color-encore-bg)',
        border: 'none',
        borderBottom: '1px solid var(--color-encore-border-light)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
        opacity: isDone ? 0.45 : 1,
      }}
    >
      {/* Left: cover thumbnail — squircle (k=0.72, s=62) */}
      <div style={{
        width: 62, height: 62, flexShrink: 0,
        clipPath: 'path("M 62 31 C 62 53.32 53.32 62 31 62 C 8.68 62 0 53.32 0 31 C 0 8.68 8.68 0 31 0 C 53.32 0 62 8.68 62 31 Z")',
        background: 'var(--color-encore-bg-section)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {coverSrc
          ? <img src={coverSrc} alt={live.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : <UserCircle size={28} color="var(--color-encore-text-muted)" weight="light" />
        }
      </div>

      {/* Right: info */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Row 1: title + status badge */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <span style={{
            flex: 1, minWidth: 0,
            fontSize: 16, fontWeight: 700,
            color: 'var(--color-encore-green)',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.3,
          }}>
            {live.title}
          </span>
          {statusConfig && (
            <span style={{
              flexShrink: 0,
              background: statusConfig.bg, color: statusConfig.color,
              fontSize: 10, fontWeight: 700,
              padding: '3px 8px', borderRadius: 999,
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              whiteSpace: 'nowrap', marginTop: 1,
            }}>
              {statusConfig.label}
            </span>
          )}
        </div>

        {/* Row 2: artist · venue */}
        <span style={{
          fontSize: 12, fontWeight: 400,
          color: 'var(--color-encore-text-sub)',
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {live.artist}{live.venue ? ` · ${live.venue}` : ''}
        </span>

        {/* Row 3: date + price */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: dowColor,
            fontFamily: 'var(--font-google-sans), sans-serif',
          }}>
            {month}/{day}（{dow}）
          </span>
          {live.price != null && live.price > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: 'var(--color-encore-text-muted)',
              fontFamily: 'var(--font-google-sans), sans-serif',
              marginLeft: 'auto',
            }}>
              ¥{live.price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Row 4: deadline or salePhase */}
        {(nextDate || live.salePhase) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {nextDate && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: 3,
                fontSize: 12,
                color: isUrgentDate ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              }}>
                <Clock size={11} color={isUrgentDate ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)'} weight="regular" />
                {nextDate.label}
              </span>
            )}
            {live.salePhase && !nextDate && (
              <span style={{
                background: 'var(--color-encore-bg-section)',
                color: 'var(--color-encore-text-sub)',
                fontSize: 10, fontWeight: 700,
                padding: '2px 7px', borderRadius: 999,
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              }}>
                {live.salePhase}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  )
}

// ─── Tab bar items ────────────────────────────────────────────────────────────
const TAB_ITEMS = [
  { key: 'calendar', label: 'CALENDAR', Icon: CalendarBlank, href: '/grape/calendar/' },
  { key: 'tickets',  label: 'TICKETS',  Icon: Ticket,        href: '/grape/tickets/'  },
  { key: 'report',   label: 'REPORT',   Icon: ChartBar,      href: '/grape/report/'   },
  { key: 'settings', label: 'SETTINGS', Icon: GearSix,       href: '/grape/settings/' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function TicketsPage() {
  const { lives, artists, addLive, addArtist, updateLive } = useGrapeStore()
  const [activeTab, setActiveTab] = useState<TabKey>('all')
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [previewLive, setPreviewLive] = useState<GrapeLive | null>(null)
  const [editLive, setEditLive] = useState<GrapeLive | null>(null)
  const [editOpenSection, setEditOpenSection] = useState<'ticket' | undefined>(undefined)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  // Premium: +ボタンのActionSheet / URL取り込み / Premium訴求
  const [showActionSheet, setShowActionSheet] = useState(false)
  const [showUrlImport,   setShowUrlImport]   = useState(false)
  const [showPremiumSheet, setShowPremiumSheet] = useState(false)
  const [prefillLive,     setPrefillLive]     = useState<Partial<GrapeLive> | null>(null)
  const isPremium = useIsPremium()
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  // ── タブ横スワイプ: 現タブを退場 → 新タブを反対側にスナップ → 中央へスライドイン
  // （EventPreviewScreen 同様パターン。方向性のある遷移で「隣のタブから現れた」感を出す）
  type SwipePhase = 'exit-left' | 'exit-right' | 'enter-from-right' | 'enter-from-left' | null
  const [dragX, setDragX] = useState(0)
  const [swipePhase, setSwipePhase] = useState<SwipePhase>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const swipeWrapRef = useRef<HTMLDivElement>(null)
  const SWIPE_THRESHOLD = 50
  const GESTURE_DECIDE_PX = 10

  const activeTabIdxRef = useRef(0)
  useEffect(() => {
    activeTabIdxRef.current = TAB_KEYS.indexOf(activeTab)
  }, [activeTab])

  const animateToTab = (dir: 'next' | 'prev') => {
    const cur = activeTabIdxRef.current
    const newIdx = dir === 'next' ? cur + 1 : cur - 1
    if (newIdx < 0 || newIdx >= TAB_KEYS.length) { setDragX(0); return }
    const newTab = TAB_KEYS[newIdx]
    setSwipePhase(dir === 'next' ? 'exit-left' : 'exit-right')
    setTimeout(() => {
      setSwipePhase(dir === 'next' ? 'enter-from-right' : 'enter-from-left')
      setDragX(0)
      setActiveTab(newTab)
      if (scrollRef.current) scrollRef.current.scrollTop = 0
      requestAnimationFrame(() => requestAnimationFrame(() => setSwipePhase(null)))
    }, 180)
  }

  // native touch events（iOS Safari で passive:false の touchmove が必要）
  useEffect(() => {
    const el = swipeWrapRef.current
    if (!el) return
    let startX = 0, startY = 0
    let mode: 'h' | 'v' | null = null
    let curDx = 0

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      mode = null
      curDx = 0
    }
    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (mode === null) {
        if (Math.abs(dx) > GESTURE_DECIDE_PX && Math.abs(dx) > Math.abs(dy)) mode = 'h'
        else if (Math.abs(dy) > GESTURE_DECIDE_PX) mode = 'v'
      }
      if (mode === 'h') {
        e.preventDefault()
        const cur = activeTabIdxRef.current
        const atStart = cur === 0
        const atEnd = cur === TAB_KEYS.length - 1
        const drag = ((dx > 0 && atStart) || (dx < 0 && atEnd)) ? dx * 0.35 : dx
        curDx = drag
        setDragX(drag)
      }
    }
    const onEnd = () => {
      if (mode === 'h') {
        const cur = activeTabIdxRef.current
        if (Math.abs(curDx) > SWIPE_THRESHOLD) {
          if (curDx < 0 && cur < TAB_KEYS.length - 1) animateToTab('next')
          else if (curDx > 0 && cur > 0) animateToTab('prev')
          else setDragX(0)
        } else {
          setDragX(0)
        }
      }
      mode = null
      curDx = 0
    }

    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    el.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
      el.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  const urgentLives = useMemo(
    () => lives.filter(l => l.ticketStatus === 'payment-due'),
    [lives]
  )

  // チケット登録済みのイベント（タブフィルタ前）
  const allTickets = useMemo(
    () => lives.filter(l => l.ticketStatus !== undefined),
    [lives]
  )

  const filteredLives = useMemo(() => {
    let result = filterByTab(lives, activeTab)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.artist?.toLowerCase().includes(q) ?? false) ||
        (l.venue?.toLowerCase().includes(q) ?? false) ||
        (l.salePhase?.toLowerCase().includes(q) ?? false)
      )
    }
    return sortLives(result)
  }, [lives, activeTab, searchQuery])

  function openSearch() {
    setSearchOpen(true)
    setTimeout(() => searchInputRef.current?.focus(), 50)
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery('')
  }

  const showUrgencyBanner = activeTab !== 'urgent' && urgentLives.length > 0

  return (
    <PhoneFrame>
        <StatusBar />

        {/* ── Header ── */}
        <div
          style={{
            background: 'var(--color-encore-bg)',
            borderBottom: '1px solid var(--color-encore-border-light)',
            flexShrink: 0,
          }}
        >
          {/* Title row */}
          <div style={{
            padding: '8px 20px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="grape-page-title" style={{ ...ty.display, lineHeight: 1 }}>Tickets</div>
              {/* 要対応件数はタブの数字バッジ + アラートバナーで明示するため、
                 ここのタイトル横バッジは廃止（情報の三重化を避ける）。*/}
            </div>
            <button
              onClick={openSearch}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 7, marginBottom: 2,
                color: searchOpen ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
                display: 'flex', alignItems: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <MagnifyingGlass size={22} weight="regular" />
            </button>
          </div>

          {/* Search bar */}
          {searchOpen && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '0 16px 12px',
            }}>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--color-encore-bg-section)',
                borderRadius: 10, padding: '8px 12px',
              }}>
                <MagnifyingGlass size={15} weight="regular" color="var(--color-encore-text-muted)" />
                <input
                  ref={searchInputRef}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="タイトル・アーティスト・会場で検索"
                  style={{
                    flex: 1, border: 'none', background: 'transparent', outline: 'none',
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 14, color: 'var(--color-encore-green)',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <X size={15} weight="regular" color="var(--color-encore-text-muted)" />
                  </button>
                )}
              </div>
              <button
                onClick={closeSearch}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 14, color: 'var(--color-encore-green)',
                  WebkitTapHighlightColor: 'transparent', padding: '4px 0',
                }}
              >
                キャンセル
              </button>
            </div>
          )}
        </div>

        {/* ── Status tabs ── */}
        <div style={{ flexShrink: 0 }}>
          <HorizontalTabs
            tabs={TAB_LABELS.map((label, i) => {
              if (TAB_KEYS[i] === 'urgent' && urgentLives.length > 0) {
                // iOS 通知バッジ風: 数字入り小円バッジで件数を明示（旧: 赤ポチのみ）
                return (
                  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                    {label}
                    <span style={{
                      minWidth: 16, height: 16, padding: '0 5px',
                      borderRadius: 999,
                      background: 'var(--color-encore-amber)',
                      color: 'var(--color-encore-white)',
                      fontFamily: 'var(--font-google-sans), sans-serif',
                      fontSize: 10, fontWeight: 700,
                      lineHeight: '16px',
                      display: 'inline-flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {urgentLives.length}
                    </span>
                  </span>
                )
              }
              return label
            })}
            active={TAB_KEYS.indexOf(activeTab)}
            onChange={(i) => setActiveTab(TAB_KEYS[i])}
          />
        </div>

        {/* ── Main scrollable content ── */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            background: 'var(--color-encore-bg)',
            position: 'relative',
          }}
        >
          {/* 横スワイプでタブ遷移するラッパ（translateX で現カード→退場→新カード→中央）*/}
          <div
            ref={swipeWrapRef}
            style={{
              touchAction: 'pan-y',
              transform: (() => {
                if (swipePhase === 'exit-left')        return 'translateX(-100%)'
                if (swipePhase === 'exit-right')       return 'translateX(100%)'
                if (swipePhase === 'enter-from-right') return 'translateX(100%)'
                if (swipePhase === 'enter-from-left')  return 'translateX(-100%)'
                if (dragX !== 0) return `translateX(${dragX}px)`
                return 'translate(0,0)'
              })(),
              transition: (() => {
                if (swipePhase === 'enter-from-right' || swipePhase === 'enter-from-left') return 'none'
                if (dragX !== 0 && swipePhase === null) return 'none'
                return 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'
              })(),
            }}
          >
          {/* Urgency Banner */}
          {showUrgencyBanner && (
            <UrgencyBanner
              count={urgentLives.length}
              onTap={() => setActiveTab('urgent')}
            />
          )}

          {/* Empty state */}
          {filteredLives.length === 0 ? (
            (() => {
              // ① 登録ゼロ → オンボーディング
              if (allTickets.length === 0) {
                return (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '52px 32px 40px', gap: 0,
                    textAlign: 'center',
                  }}>
                    {/* アイコン背景 */}
                    <div style={{
                      width: 96, height: 96, borderRadius: '50%',
                      background: 'var(--color-encore-bg-section)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 20,
                    }}>
                      <Ticket size={44} weight="light" color="var(--color-encore-green)" />
                    </div>
                    {/* タイトル */}
                    <div style={{
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 16, fontWeight: 700,
                      color: 'var(--color-encore-green)',
                      marginBottom: 10,
                    }}>
                      まだチケットがありません
                    </div>
                    {/* 説明 */}
                    <div style={{
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 12, fontWeight: 400, lineHeight: 1.7,
                      color: 'var(--color-encore-text-sub)',
                      marginBottom: 28,
                    }}>
                      チケット情報を追加すると、<br />
                      申込状況や入金期限をまとめて<br />
                      管理できます。
                    </div>
                    {/* 追加ボタン */}
                    <button
                      onClick={() => setShowAddSheet(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 7,
                        padding: '11px 24px', borderRadius: 999,
                        background: 'var(--color-encore-green)',
                        border: 'none', cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <Plus size={15} weight="regular" color="#fff" />
                      <span style={{
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        fontSize: 14, fontWeight: 700, color: '#fff',
                      }}>
                        チケットを追加
                      </span>
                    </button>
                  </div>
                )
              }
              // ② 検索結果ゼロ
              if (searchQuery.trim()) {
                return (
                  <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    padding: '60px 32px', gap: 10, textAlign: 'center',
                  }}>
                    <MagnifyingGlass size={40} weight="light" color="var(--color-encore-border)" />
                    <span style={{
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 14, fontWeight: 400,
                      color: 'var(--color-encore-text-muted)',
                      lineHeight: 1.6,
                    }}>
                      「{searchQuery}」に一致する<br />チケットはありません
                    </span>
                  </div>
                )
              }
              // ③ タブフィルタゼロ
              const tabEmptyMsg: Record<TabKey, string> = {
                all:    'チケットはありません',
                active: '申込中のチケットはありません',
                urgent: '要対応のチケットはありません',
                done:   '完了したチケットはありません',
              }
              return (
                <div style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '60px 0', gap: 8,
                }}>
                  <Ticket size={40} weight="light" color="var(--color-encore-border)" />
                  <span style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 14, fontWeight: 400,
                    color: 'var(--color-encore-text-muted)',
                  }}>
                    {tabEmptyMsg[activeTab]}
                  </span>
                </div>
              )
            })()
          ) : (
            filteredLives.map(live => (
              <TicketCard
                key={live.id}
                live={live}
                onTap={(l) => setPreviewLive(l)}
              />
            ))
          )}

          {/* Bottom padding for FAB */}
          <div style={{ height: 80 }} />
          </div>
        </div>

        {/* ── Tab Bar ── */}
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
            const isActive = key === 'tickets'
            const color = isActive ? 'var(--color-encore-amber)' : 'var(--color-encore-green)'
            return (
              <Link
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
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color,
                  }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* ── FAB ── */}
        {!showAddSheet && !previewLive && !editLive && !showActionSheet && !showUrlImport && !showPremiumSheet && (
          <button
            onClick={() => {
              setPrefillLive(null)
              if (isPremium && URL_IMPORT_ENABLED) {
                setShowActionSheet(true)
              } else {
                setShowAddSheet(true)
              }
            }}
            style={{
              position: 'absolute',
              // TabBar(68px) + safe-area(home indicator ~34px on iPhone) + 16px gap
              bottom: 'calc(16px + 68px + env(safe-area-inset-bottom))',
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

        {/* ── Add Event Sheet ── */}
        {showAddSheet && (
          <QuickEventSheet
            artists={artists}
            live={prefillLive as GrapeLive | undefined}
            onAddArtist={addArtist}
            onShowPremium={() => setShowPremiumSheet(true)}
            onClose={() => { setShowAddSheet(false); setPrefillLive(null) }}
            onSave={(payload) => {
              addLive(payload as GrapeLive)
              setShowAddSheet(false)
              setPrefillLive(null)
            }}
          />
        )}

        {/* ── AddActionSheet (Premium only) ── */}
        {showActionSheet && (
          <AddActionSheet
            onClose={() => setShowActionSheet(false)}
            onNewEvent={() => {
              setShowActionSheet(false)
              setShowAddSheet(true)
            }}
            onImportFromUrl={() => {
              setShowActionSheet(false)
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
              setShowAddSheet(true)
            }}
          />
        )}

        {/* ── PremiumUpgradeSheet ── */}
        {showPremiumSheet && (
          <PremiumUpgradeSheet onClose={() => setShowPremiumSheet(false)} />
        )}

        {/* ── Edit Event Sheet ── */}
        {editLive && (
          <QuickEventSheet
            live={editLive}
            artists={artists}
            onAddArtist={addArtist}
            openSection={editOpenSection}
            onClose={() => { setEditLive(null); setEditOpenSection(undefined) }}
            onSave={(payload) => {
              updateLive({ ...editLive, ...payload } as GrapeLive)
              setEditLive(null)
              setEditOpenSection(undefined)
            }}
          />
        )}

        {/* ── Event Preview ── */}
        {previewLive && (
          <EventPreviewScreen
            live={previewLive}
            onClose={() => setPreviewLive(null)}
            onEdit={(l, section) => {
              setPreviewLive(null)
              setEditLive(l)
              setEditOpenSection(section)
            }}
            onUpgradePremium={() => setShowPremiumSheet(true)}
          />
        )}
    </PhoneFrame>
  )
}
