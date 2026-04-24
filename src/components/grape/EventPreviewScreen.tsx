'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  X, PencilSimple, DotsThree,
  CalendarBlank, Clock, MapPin, Ticket, Note,
  Copy, Trash, CaretLeft, CaretRight, Images, CaretDown,
  CurrencyJpy, Armchair, Warning,
} from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, AttendanceStatus } from '@/lib/grape/types'
import { ATTENDANCE_LABEL, TICKET_STATUS_LABEL, DOW_SUN_FIRST as DOW_JA } from '@/lib/grape/constants'
import CyclingArtistImage from './CyclingArtistImage'
import SetlistSection from './SetlistSection'
import SetlistEditorSheet from './SetlistEditorSheet'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'

/** 7択移行前の旧ステータス値 → 日本語フォールバック */
const LEGACY_TICKET_LABEL: Record<string, string> = {
  'open':     '発売中',        // → before-sale 相当
  'applied':  '申し込み済み',  // → waiting（結果待ち）相当
  'won':      'チケット当選',  // → paid 相当
  'lost':     'チケット落選',
  'pending':  '抽選中',
}

const squirclePath = (s: number) => {
  const r = s / 2
  const k = r * 0.72
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

const TYPE_GRADIENT: Record<string, string> = {
  'ワンマン':         'var(--gradient-live-wanman)',
  '対バン':           'var(--gradient-live-taiban)',
  'フェス':           'var(--gradient-live-fes)',
  '配信':             'var(--gradient-live-taiban)',
  '舞台・公演':       'var(--gradient-live-wanman)',
  'メディア出演':     'var(--gradient-live-taiban)',
  'リリースイベント': 'var(--gradient-live-fes)',
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dow = DOW_JA[new Date(y, m - 1, d).getDay()]
  return `${y}年${m}月${d}日（${dow}）`
}

/** 今日からの日数差（YYYY-MM-DD → 日数）。マイナスは過去。 */
function daysFromToday(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

/** 差分を「今日 / 明日 / 明後日 / あとN日 / N日経過」の形に */
function formatDaysLabel(diff: number): string {
  if (diff === 0) return '今日'
  if (diff === 1) return '明日'
  if (diff === 2) return '明後日'
  if (diff > 0)  return `あと${diff}日`
  return `${-diff}日経過`
}

/** GrapeLive から最優先の「期限イベント」を1つ抽出 */
function pickUrgency(live: GrapeLive | null): { label: string; date: string; diff: number; tone: 'danger' | 'warn' | 'info' } | null {
  if (!live) return null
  const candidates: { label: string; date: string }[] = []
  if (live.ticketStatus === 'waiting'      && live.announcementDate) candidates.push({ label: '抽選結果発表', date: live.announcementDate })
  if (live.ticketStatus === 'before-sale'  && live.saleStartDate)    candidates.push({ label: '発売開始',     date: live.saleStartDate   })
  if (live.ticketStatus === 'payment-due'  && live.ticketDeadline)   candidates.push({ label: '入金期限',     date: live.ticketDeadline  })
  if (!candidates.length) return null
  // 絶対値で最も近い日付を採用
  const best = candidates
    .map(c => ({ ...c, diff: daysFromToday(c.date) }))
    .sort((a, b) => Math.abs(a.diff) - Math.abs(b.diff))[0]
  // 14日より先は表示しない（過去の期限 or 近日のみ）
  if (best.diff > 14) return null
  const tone: 'danger' | 'warn' | 'info' =
    best.diff < 0 ? 'danger'
    : best.diff <= 2 ? 'danger'
    : best.diff <= 5 ? 'warn'
    : 'info'
  return { ...best, tone }
}

// ─── InfoRow ────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  children,
}: {
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '11px 0',
        borderBottom: '1px solid var(--color-encore-border-light)',
      }}
    >
      <div style={{ color: 'var(--color-encore-text-muted)', flexShrink: 0, marginTop: 1 }}>
        {icon}
      </div>
      <div
        style={{
          ...ty.body,
          fontSize: 14,
          lineHeight: 1.5,
          flex: 1,
          color: 'var(--color-encore-green)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface EventPreviewScreenProps {
  live: GrapeLive | null
  onClose: () => void
  onEdit: (live: GrapeLive, openSection?: 'ticket') => void
  onDelete?: (id: string) => void
  onDuplicate?: (live: GrapeLive) => void
  onStatusChange?: (id: string, status: AttendanceStatus) => void
  /** 左右スワイプで前後イベントへ移動するための全ライブ配列（日時順） */
  allLives?: GrapeLive[]
  /** 前後ナビゲーション時に呼ばれる */
  onNavigate?: (live: GrapeLive) => void
  /**
   * セットリスト編集画面を開く（Premium 時）
   * Day 2 で SetlistEditorSheet を実装するまでは親側で未設定でも OK。
   */
  onOpenSetlistEditor?: (live: GrapeLive) => void
  /** Free ユーザ向け Premium 訴求（PremiumUpgradeSheet を開く等） */
  onUpgradePremium?: () => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EventPreviewScreen({
  live,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  allLives,
  onNavigate,
  onOpenSetlistEditor,
  onUpgradePremium,
}: EventPreviewScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showStatusSheet, setShowStatusSheet] = useState(false)
  const [memoExpanded, setMemoExpanded] = useState(false)
  const [showSetlistEditor, setShowSetlistEditor] = useState(false)
  const { show: showToast } = useGrapeToast()
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [lbScale, setLbScale] = useState(1)
  // カバーアート単体のライトボックス（live.images とは独立、枚数 1 専用）
  const [coverLightbox, setCoverLightbox] = useState(false)
  const [coverLbScale, setCoverLbScale] = useState(1)

  // 前後ライブソート済みリスト（dots インジケーター用の位置と総数）
  const sortedAll = useMemo(() => {
    if (!allLives || !live) return []
    const sorted = [...allLives].sort((a, b) => {
      const k = a.date.localeCompare(b.date)
      if (k !== 0) return k
      return (a.startTime ?? '').localeCompare(b.startTime ?? '')
    })
    return sorted
  }, [allLives, live])
  const currentIdx = useMemo(() => sortedAll.findIndex(l => l.id === live?.id), [sortedAll, live])
  const lbLastDist = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const isOpen = live !== null

  // ── drag-to-dismiss + swipe-to-navigate ───────────────────────────────────
  const [dragY, setDragY] = useState(0)
  const [dragX, setDragX] = useState(0)
  // ナビゲーション遷移のフェーズ:
  //   'exit-left'       : 現カードが左へ退場中（次のライブへ移動）
  //   'exit-right'      : 現カードが右へ退場中（前のライブへ移動）
  //   'enter-from-right': 新カードを右端にスナップ配置（アニメ前）
  //   'enter-from-left' : 新カードを左端にスナップ配置（アニメ前）
  //   null              : 静止中
  type NavPhase = 'exit-left' | 'exit-right' | 'enter-from-right' | 'enter-from-left' | null
  const [navPhase, setNavPhase] = useState<NavPhase>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const activeDrag = useRef(false)
  const gestureMode = useRef<'vertical' | 'horizontal' | null>(null)
  const COVER_H = 240
  const DISMISS_PX = 100
  const DISMISS_VEL = 0.35 // px/ms
  const SWIPE_THRESHOLD = 60 // px
  const GESTURE_DECIDE_PX = 10 // 方向判定閾値

  // 前後イベントを計算（日付 + 開演時刻でソート）
  const { prevLive, nextLive } = (() => {
    if (!live || !allLives || allLives.length < 2) return { prevLive: null, nextLive: null }
    const sorted = [...allLives].sort((a, b) => {
      const k = a.date.localeCompare(b.date)
      if (k !== 0) return k
      return (a.startTime ?? '').localeCompare(b.startTime ?? '')
    })
    const idx = sorted.findIndex(l => l.id === live.id)
    if (idx === -1) return { prevLive: null, nextLive: null }
    return {
      prevLive: idx > 0 ? sorted[idx - 1] : null,
      nextLive: idx < sorted.length - 1 ? sorted[idx + 1] : null,
    }
  })()

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    activeDrag.current = false
    gestureMode.current = null
    const panelEl = panelRef.current
    if (!panelEl) return
    const relY = e.touches[0].clientY - panelEl.getBoundingClientRect().top
    // カバー領域上 or スクロール最上段からのみジェスチャーを受け付ける
    activeDrag.current = relY < COVER_H || (scrollRef.current?.scrollTop ?? 1) === 0
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!activeDrag.current) return
    const dx = e.touches[0].clientX - touchStartX.current
    const dy = e.touches[0].clientY - touchStartY.current
    // ジェスチャー方向を決定
    if (gestureMode.current === null) {
      if (Math.abs(dx) > GESTURE_DECIDE_PX && Math.abs(dx) > Math.abs(dy)) {
        gestureMode.current = 'horizontal'
      } else if (Math.abs(dy) > GESTURE_DECIDE_PX) {
        gestureMode.current = 'vertical'
      }
    }
    if (gestureMode.current === 'vertical') {
      if (dy > 0) setDragY(dy)
    } else if (gestureMode.current === 'horizontal') {
      // 前後イベントが無い方向には少しだけ引っ張れる（ラバーバンド）
      if ((dx < 0 && !nextLive) || (dx > 0 && !prevLive)) {
        setDragX(dx * 0.35)
      } else {
        setDragX(dx)
      }
    }
  }

  // 方向性のある遷移アニメーション共通ロジック。
  // exit → onNavigate → 新カードを反対側へスナップ → 中心へスライドイン、の 3 段階で
  // 「消えた方向と逆側から次カードが現れる」直感に合わせる。
  const animateNavigate = (dir: 'next' | 'prev', target: GrapeLive) => {
    setNavPhase(dir === 'next' ? 'exit-left' : 'exit-right')
    setTimeout(() => {
      // 新カードを反対側（enter）に配置 → live 差し替え
      setNavPhase(dir === 'next' ? 'enter-from-right' : 'enter-from-left')
      setDragX(0)
      onNavigate?.(target)
      // 2 フレーム待ってから null に戻し transform:translate(0,0) へ遷移を開始させる
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setNavPhase(null))
      })
    }, 180)
  }

  const onTouchEnd = () => {
    if (!activeDrag.current) { activeDrag.current = false; return }
    const elapsed = Math.max(Date.now() - touchStartTime.current, 1)
    if (gestureMode.current === 'vertical' && dragY > 0) {
      const velocity = dragY / elapsed
      if (dragY > DISMISS_PX || velocity > DISMISS_VEL) {
        setDragY(0)
        onClose()
      } else {
        setDragY(0)
      }
    } else if (gestureMode.current === 'horizontal' && Math.abs(dragX) > 0) {
      const velocity = Math.abs(dragX) / elapsed
      const shouldNav = Math.abs(dragX) > SWIPE_THRESHOLD || velocity > DISMISS_VEL
      if (shouldNav && dragX < 0 && nextLive) {
        animateNavigate('next', nextLive)
      } else if (shouldNav && dragX > 0 && prevLive) {
        animateNavigate('prev', prevLive)
      } else {
        setDragX(0)
      }
    }
    activeDrag.current = false
    gestureMode.current = null
  }
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setMounted(true))
      setMemoExpanded(false)
    } else {
      setMounted(false)
      setShowMenu(false)
      setDragY(0)
      setDragX(0)
    }
  }, [isOpen])

  // イベント切り替え時にスクロールを最上部へ戻す
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [live?.id])

  // メニュー外クリックで閉じる
  useEffect(() => {
    if (!showMenu) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showMenu])

  if (!live && !mounted) return null

  // ── アイコンボタン共通スタイル（カバーアート上）
  const iconBtnStyle: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.38)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    flexShrink: 0,
  }

  return (
    <>
      {/* ── バックドロップ ─────────────────────────────────────
          position: fixed で viewport 基準にする（iPhone PWA のノッチ／ホームインジケーター
          領域まで含めて全画面をカバー。phone-frame の overflow:hidden を超えて描画される） */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 300,
          background: isOpen && mounted ? 'rgba(0,0,0,0.52)' : 'rgba(0,0,0,0)',
          transition: 'background 0.32s',
          pointerEvents: isOpen ? 'auto' : 'none',
        }}
      />

      {/* ── パネル本体 ─────────────────────────────────────────── */}
      <div
        ref={panelRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          // StatusBar + Calendar大タイトルヘッダーの高さ分だけ空ける（ViewToggleは隠す）
          top: 106,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 301,
          background: 'var(--color-encore-bg)',
          borderRadius: '20px 20px 0 0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          // ジェスチャーに応じて translate を合成（縦ドラッグ・横スワイプ・ナビ遷移）
          transform: (() => {
            if (navPhase === 'exit-left')        return 'translateX(-100%)'
            if (navPhase === 'exit-right')       return 'translateX(100%)'
            if (navPhase === 'enter-from-right') return 'translateX(100%)'
            if (navPhase === 'enter-from-left')  return 'translateX(-100%)'
            if (dragX !== 0) return `translateX(${dragX}px)`
            if (dragY > 0)   return `translateY(${dragY}px)`
            return isOpen && mounted ? 'translate(0,0)' : 'translateY(105%)'
          })(),
          // enter-from-* のフレームだけ transition:none で新カードを反対側に瞬間スナップし、
          // 次フレームで null 化したときに transform:0 へアニメが走る（スライドイン）。
          transition: (() => {
            if (navPhase === 'enter-from-right' || navPhase === 'enter-from-left') return 'none'
            if ((dragY > 0 || dragX !== 0) && navPhase === null) return 'none'
            return 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)'
          })(),
        }}
      >
        {/* ── カバーアート ──────────────────────────────────────── */}
        <div style={{ position: 'relative', height: COVER_H, flexShrink: 0 }}>
          {/* 画像 or プレースホルダー */}
          {live?.coverImage ? (
            <img
              src={live.coverImage}
              alt={live?.title ?? ''}
              onClick={() => { setCoverLightbox(true); setCoverLbScale(1) }}
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%', height: '100%',
                background: TYPE_GRADIENT[live?.liveType ?? ''] ?? 'linear-gradient(135deg, rgba(27,60,45,0.18), rgba(27,60,45,0.05))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* ぼかし背景（アーティスト画像あり時） */}
              {(live?.artistImage || (live?.artistImages && live.artistImages.length > 0)) && (
                <>
                  <img
                    src={live?.artistImage ?? live?.artistImages![0]}
                    alt=""
                    aria-hidden
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover',
                      filter: 'blur(28px)',
                      transform: 'scale(1.3)',
                      opacity: 0.8,
                    }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.12)' }} />
                </>
              )}
              {live?.artistImages && live.artistImages.length > 1 ? (
                <div style={{ width: 144, height: 144, clipPath: `path("${squirclePath(144)}")`, overflow: 'hidden', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                  <CyclingArtistImage images={live.artistImages} alt={live?.artist ?? ''} size={144} borderRadius={0} intervalMs={2400} />
                </div>
              ) : live?.artistImage ? (
                <div style={{
                  width: 144, height: 144,
                  clipPath: `path("${squirclePath(144)}")`,
                  overflow: 'hidden',
                  background: 'transparent',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <img src={live.artistImage} alt={live?.artist ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              ) : null}
            </div>
          )}

          {/* ── スワイプ位置インジケーター（右下のドット/件数ピル） ── */}
          {sortedAll.length > 1 && currentIdx >= 0 && (
            <div style={{
              position: 'absolute',
              right: 12, bottom: 10,
              display: 'flex', gap: 5, alignItems: 'center',
              padding: '4px 8px', borderRadius: 999,
              background: 'rgba(0,0,0,0.32)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 2,
              maxWidth: '70%',
              overflow: 'hidden',
            }}>
              {sortedAll.length <= 10 ? (
                sortedAll.map((_, i) => (
                  <span key={i} style={{
                    width: i === currentIdx ? 14 : 5,
                    height: 5, borderRadius: 999,
                    background: i === currentIdx ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'width 0.25s, background 0.25s',
                    flexShrink: 0,
                  }} />
                ))
              ) : (
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 10, fontWeight: 400,
                  color: '#fff',
                  fontVariantNumeric: 'tabular-nums',
                  letterSpacing: '0.04em',
                }}>
                  {currentIdx + 1} / {sortedAll.length}
                </span>
              )}
            </div>
          )}

          {/* ── ヘッダーボタン群 ─────────────────────────────── */}
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            {/* 閉じるボタン */}
            <button onClick={onClose} style={iconBtnStyle} title="閉じる">
              <X size={16} weight="bold" color="#fff" />
            </button>

            {/* 右: 編集 + その他 */}
            <div style={{ display: 'flex', gap: 8, position: 'relative' }} ref={menuRef}>
              {/* 編集ボタン（鉛筆） */}
              <button
                onClick={() => live && onEdit(live)}
                style={iconBtnStyle}
                title="編集"
              >
                <PencilSimple size={15} weight="bold" color="#fff" />
              </button>

              {/* その他ボタン（...） */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v) }}
                style={iconBtnStyle}
                title="その他"
              >
                <DotsThree size={20} weight="bold" color="#fff" />
              </button>

              {/* その他メニューポップアップ */}
              {showMenu && live && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    top: 42, right: 0,
                    background: 'var(--color-encore-bg)',
                    borderRadius: 12,
                    overflow: 'hidden',
                    minWidth: 160,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.22), 0 0 0 1px rgba(0,0,0,0.06)',
                    zIndex: 10,
                  }}
                >
                  {/* 複製 */}
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDuplicate?.(live)
                      showToast('イベントを複製しました')
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '13px 16px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      ...ty.bodySM,
                      color: 'var(--color-encore-green)',
                      textAlign: 'left',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Copy size={15} weight="regular" />
                    複製
                  </button>

                  <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 12px' }} />

                  {/* 削除（Destructive） */}
                  <button
                    onClick={() => { setShowMenu(false); live && onDelete?.(live.id) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '13px 16px',
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      ...ty.bodySM,
                      color: 'var(--color-encore-error)',
                      textAlign: 'left',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Trash size={15} weight="regular" color="var(--color-encore-error)" />
                    削除
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* カバー下部：ライブタイプ + ステータスバッジ */}
          {live && (
            <div
              style={{
                position: 'absolute', bottom: 14, left: 16,
                display: 'flex', gap: 6, alignItems: 'center',
              }}
            >
              {/* ライブタイプバッジ（静的） */}
              {live.liveType && (
                <span
                  style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 700,
                    padding: '5px 13px', borderRadius: 999,
                    background: 'rgba(0,0,0,0.38)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {live.liveType}
                </span>
              )}
              {/* 参戦ステータスバッジ（タップ可能 / 編集画面と同じプライマリーグリーン） */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowStatusSheet(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  padding: '5px 10px 5px 13px', borderRadius: 999,
                  background: 'var(--color-encore-green)',
                  color: 'var(--color-encore-white)',
                  border: 'none',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.22)',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {ATTENDANCE_LABEL[live.attendanceStatus]}
                <CaretDown size={9} weight="bold" color="var(--color-encore-white)" />
              </button>
            </div>
          )}
        </div>

        {/* ── イベント情報領域（スクロール可） ─────────────────── */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 48px' }}>
          {/* ── Urgency Banner（チケット期限カウントダウン） ── */}
          {(() => {
            const u = pickUrgency(live)
            if (!u) return null
            const palette = {
              danger: { bg: 'rgba(219, 96, 80, 0.10)', border: 'rgba(219, 96, 80, 0.28)', fg: 'var(--color-encore-error)' },
              warn:   { bg: 'rgba(192, 138, 74, 0.10)', border: 'rgba(192, 138, 74, 0.28)', fg: 'var(--color-encore-amber)' },
              info:   { bg: 'var(--color-encore-bg-section)',    border: 'var(--color-encore-border-light)', fg: 'var(--color-encore-green)' },
            }[u.tone]
            return (
              <button
                onClick={() => live && onEdit(live, 'ticket')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', marginBottom: 14,
                  padding: '10px 14px',
                  background: palette.bg,
                  border: `1px solid ${palette.border}`,
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Warning size={16} weight="fill" color={palette.fg} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 700, color: palette.fg }}>
                    {u.label}
                  </span>
                  <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 13, fontWeight: 700, color: palette.fg }}>
                    {formatDaysLabel(u.diff)}
                  </span>
                  <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 11, fontWeight: 400, color: palette.fg, opacity: 0.72 }}>
                    {u.date}
                  </span>
                </div>
                <CaretRight size={12} weight="bold" color={palette.fg} style={{ flexShrink: 0, opacity: 0.7 }} />
              </button>
            )
          })()}

          {/* タイトル */}
          <div
            style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 20, fontWeight: 700, lineHeight: 1.3,
              color: 'var(--color-encore-green)',
              marginBottom: 4,
            }}
          >
            {live?.title}
          </div>

          {/* アーティスト（複数の場合はアバターリスト / 単体はテキスト） */}
          {live && (() => {
            const names = live.artists && live.artists.length > 0 ? live.artists : [live.artist]
            const images = live.artistImages ?? (live.artistImage ? [live.artistImage] : [])
            const isMulti = names.length >= 2
            if (isMulti) {
              return (
                <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {names.map((n, i) => (
                    <div key={`${n}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {images[i] ? (
                        <div
                          style={{
                            width: 24, height: 24,
                            clipPath: `path("${squirclePath(24)}")`,
                            overflow: 'hidden',
                            flexShrink: 0,
                            background: 'var(--color-encore-bg-section)',
                          }}
                        >
                          <img src={images[i]} alt={n} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        </div>
                      ) : (
                        <div
                          style={{
                            width: 24, height: 24,
                            clipPath: `path("${squirclePath(24)}")`,
                            background: 'var(--color-encore-bg-section)',
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <span style={{ ...ty.body, fontSize: 13, color: 'var(--color-encore-green)' }}>
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
              )
            }
            // 単体アーティストは従来通りテキストのみ（カバーに画像があるため）
            return (
              <div style={{ ...ty.sub, fontSize: 13, marginBottom: 20 }}>
                {names[0]}
              </div>
            )
          })()}

          {/* 情報行 */}
          <div>
            {/* 日付 */}
            {live?.date && (
              <InfoRow icon={<CalendarBlank size={16} weight="regular" />}>
                {formatDate(live.date)}
              </InfoRow>
            )}

            {/* 時刻 */}
            {(live?.openingTime || live?.startTime) && (
              <InfoRow icon={<Clock size={16} weight="regular" />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {live.openingTime && (
                    <span>
                      <span style={{ fontSize: 11, color: 'var(--color-encore-text-muted)', marginRight: 6 }}>開場</span>
                      {live.openingTime}
                    </span>
                  )}
                  {live.startTime && (
                    <span>
                      <span style={{ fontSize: 11, color: 'var(--color-encore-text-muted)', marginRight: 6 }}>開演</span>
                      {live.startTime}{live.endTime ? `〜${live.endTime}` : '〜'}
                    </span>
                  )}
                </div>
              </InfoRow>
            )}

            {/* 会場 */}
            {live?.venue && (
              <InfoRow icon={<MapPin size={16} weight="regular" />}>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(live.venue)}`, '_blank')}
                  style={{
                    background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
                    color: 'var(--color-encore-amber)',
                    textDecoration: 'underline', textDecorationColor: 'rgba(192,138,74,0.4)',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {live.venue}
                </button>
              </InfoRow>
            )}

            {/* チケット状況 */}
            {live?.ticketStatus ? (
              <InfoRow icon={<Ticket size={16} weight="regular" />}>
                <button
                  onClick={() => live && onEdit(live, 'ticket')}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 0,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ color: 'var(--color-encore-green)', textDecoration: 'underline', textDecorationColor: 'var(--color-encore-border)' }}>
                    {TICKET_STATUS_LABEL[live.ticketStatus as keyof typeof TICKET_STATUS_LABEL] ?? LEGACY_TICKET_LABEL[live.ticketStatus] ?? live.ticketStatus}
                  </span>
                  {live.ticketStatus === 'waiting' && live.announcementDate ? (
                    <span style={{ ...ty.captionMuted, marginLeft: 10 }}>
                      抽選結果：{live.announcementDate}{live.announcementTime ? ` ${live.announcementTime}` : ''}
                    </span>
                  ) : live.ticketStatus !== 'waiting' && live.ticketDeadline ? (
                    <span style={{ ...ty.captionMuted, marginLeft: 10 }}>
                      期限 {live.ticketDeadline}
                    </span>
                  ) : null}
                </button>
              </InfoRow>
            ) : live ? (
              <InfoRow icon={<Ticket size={16} weight="regular" />}>
                <button
                  onClick={() => onEdit(live, 'ticket')}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span style={{ color: 'var(--color-encore-amber)', textDecoration: 'underline', textDecorationColor: 'rgba(192,138,74,0.4)', fontSize: 13 }}>
                    チケット情報を登録する
                  </span>
                </button>
              </InfoRow>
            ) : null}

            {/* 価格 */}
            {typeof live?.price === 'number' && live.price > 0 && (
              <InfoRow icon={<CurrencyJpy size={16} weight="regular" />}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>
                    ¥{live.price.toLocaleString('ja-JP')}
                  </span>
                  {live.drink1Separate && (
                    <span style={{ ...ty.captionMuted }}>
                      + 1Drink 別途
                    </span>
                  )}
                </div>
              </InfoRow>
            )}

            {/* 座席情報 */}
            {live?.seatInfo && (
              <InfoRow icon={<Armchair size={16} weight="regular" />}>
                <span>{live.seatInfo}</span>
              </InfoRow>
            )}

            {/* メモ */}
            {live?.memo && (() => {
              const MEMO_THRESHOLD = 100
              const isLong = live.memo.length > MEMO_THRESHOLD
              return (
                <InfoRow icon={<Note size={16} weight="regular" />}>
                  <span
                    style={{
                      whiteSpace: 'pre-wrap',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: isLong && !memoExpanded ? 4 : 9999,
                      overflow: 'hidden',
                    }}
                  >
                    {live.memo}
                  </span>
                  {isLong && (
                    <button
                      onClick={() => setMemoExpanded(v => !v)}
                      style={{
                        marginTop: 4,
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        fontSize: 12,
                        fontWeight: 700,
                        color: 'var(--color-encore-amber)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {memoExpanded ? '閉じる' : 'さらに表示'}
                    </button>
                  )}
                </InfoRow>
              )
            })()}
          </div>

          {/* 画像ストリップ */}
          {live?.images && live.images.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Images size={14} weight="regular" color="var(--color-encore-text-muted)" />
                <span style={{ ...ty.caption, color: 'var(--color-encore-text-muted)' }}>
                  画像 {live.images.length}枚
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 4,
              }}>
                {live.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => { setLightboxIdx(i); setLbScale(1) }}
                    style={{
                      display: 'block', padding: 0, border: 'none',
                      borderRadius: 6, overflow: 'hidden',
                      cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                      aspectRatio: '4/3',
                      background: 'var(--color-encore-bg-section)',
                    }}
                  >
                    <img
                      src={src}
                      alt={`画像${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* セットリストセクション（Premium 機能）*/}
          {live && (
            <SetlistSection
              live={live}
              onEditSetlist={() => {
                setShowSetlistEditor(true)
                onOpenSetlistEditor?.(live)
              }}
              onUpgradePremium={onUpgradePremium}
            />
          )}

          {/* 編集ボタン（フッター側） */}
          <button
            onClick={() => live && onEdit(live)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, width: '100%', height: 46, marginTop: 24,
              borderRadius: 999,
              background: 'var(--color-encore-bg-section)',
              border: 'none', cursor: 'pointer',
              ...ty.bodySM,
              fontWeight: 700,
              color: 'var(--color-encore-green)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <PencilSimple size={14} weight="regular" />
            イベントを編集
          </button>
        </div>
      </div>

      {/* ── 参戦ステータス選択シート ──────────────────────────── */}
      {showStatusSheet && live && (
        <div
          onClick={() => setShowStatusSheet(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(0,0,0,0.32)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-encore-bg)',
              borderRadius: '20px 20px 0 0',
              padding: '8px 0 40px',
            }}
          >
            {/* ドラッグハンドル */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 8 }}>
              <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--color-encore-border)' }} />
            </div>
            {/* タイトル */}
            <div style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 13, fontWeight: 700,
              color: 'var(--color-encore-text-muted)',
              textAlign: 'center', paddingBottom: 12,
            }}>
              参戦ステータス
            </div>
            {/* 4択リスト */}
            {(Object.entries(ATTENDANCE_LABEL) as [AttendanceStatus, string][]).map(([status, label]) => {
              const isSelected = live.attendanceStatus === status
              return (
                <button
                  key={status}
                  onClick={() => {
                    const changed = live.attendanceStatus !== status
                    onStatusChange?.(live.id, status)
                    setShowStatusSheet(false)
                    if (changed) showToast(`「${label}」に変更しました`)
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '14px 24px',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    borderBottom: '1px solid var(--color-encore-border-light)',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 15, fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
                  }}>
                    {label}
                  </span>
                  {isSelected && (
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: 'var(--color-encore-green)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 画像ライトボックス ─────────────────────────────────── */}
      {lightboxIdx !== null && live?.images && (
        <div
          onClick={() => setLightboxIdx(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* 画像 */}
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                lbLastDist.current = Math.sqrt(dx * dx + dy * dy)
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const dist = Math.sqrt(dx * dx + dy * dy)
                const delta = dist / (lbLastDist.current || dist)
                setLbScale(s => Math.min(5, Math.max(1, s * delta)))
                lbLastDist.current = dist
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length < 2) lbLastDist.current = 0
            }}
            style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={live.images[lightboxIdx]}
              alt={`画像${lightboxIdx + 1}`}
              style={{
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain', display: 'block',
                transform: `scale(${lbScale})`,
                transformOrigin: 'center',
                transition: lbScale === 1 ? 'transform 0.2s' : 'none',
                touchAction: 'none',
              }}
              onDoubleClick={() => setLbScale(s => s > 1 ? 1 : 2.5)}
            />
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={() => setLightboxIdx(null)}
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top) + 16px)',
              right: 16,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={18} weight="bold" color="#fff" />
          </button>

          {/* 左右ナビ */}
          {live.images.length > 1 && lightboxIdx > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx - 1); setLbScale(1) }}
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CaretLeft size={18} weight="bold" color="#fff" />
            </button>
          )}
          {live.images.length > 1 && lightboxIdx < live.images.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(lightboxIdx + 1); setLbScale(1) }}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                width: 36, height: 36, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <CaretRight size={18} weight="bold" color="#fff" />
            </button>
          )}

          {/* ページインジケーター */}
          {live.images.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 6,
            }}>
              {live.images.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === lightboxIdx ? 20 : 6, height: 6, borderRadius: 3,
                    background: i === lightboxIdx ? '#fff' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── カバーアート単体ライトボックス（枚数1専用・prev/next なし） ── */}
      {coverLightbox && live?.coverImage && (
        <div
          onClick={() => setCoverLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 500,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                lbLastDist.current = Math.sqrt(dx * dx + dy * dy)
              }
            }}
            onTouchMove={(e) => {
              if (e.touches.length === 2) {
                const dx = e.touches[0].clientX - e.touches[1].clientX
                const dy = e.touches[0].clientY - e.touches[1].clientY
                const dist = Math.sqrt(dx * dx + dy * dy)
                const delta = dist / (lbLastDist.current || dist)
                setCoverLbScale(s => Math.min(5, Math.max(1, s * delta)))
                lbLastDist.current = dist
              }
            }}
            onTouchEnd={(e) => {
              if (e.touches.length < 2) lbLastDist.current = 0
            }}
            style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <img
              src={live.coverImage}
              alt={live.title ?? ''}
              style={{
                maxWidth: '100%', maxHeight: '100%',
                objectFit: 'contain', display: 'block',
                transform: `scale(${coverLbScale})`,
                transformOrigin: 'center',
                transition: coverLbScale === 1 ? 'transform 0.2s' : 'none',
                touchAction: 'none',
              }}
              onDoubleClick={() => setCoverLbScale(s => s > 1 ? 1 : 2.5)}
            />
          </div>

          <button
            onClick={() => setCoverLightbox(false)}
            style={{
              position: 'absolute',
              // iOS ノッチ/Dynamic Island 下に X が隠れないよう safe-area を加算
              top: 'calc(env(safe-area-inset-top) + 16px)',
              right: 16,
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={18} weight="bold" color="#fff" />
          </button>
        </div>
      )}

      {/* ── セットリスト編集シート ─────────────────────────── */}
      {live && (
        <SetlistEditorSheet
          live={live}
          isOpen={showSetlistEditor}
          onClose={() => setShowSetlistEditor(false)}
          onSaved={() => showToast('セットリストを保存しました')}
        />
      )}
    </>
  )
}
