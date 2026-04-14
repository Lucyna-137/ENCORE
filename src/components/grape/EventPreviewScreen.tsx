'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  X, PencilSimple, DotsThree,
  CalendarBlank, Clock, MapPin, Ticket, Note,
  Copy, Trash, CaretLeft, CaretRight, Images, CaretDown,
} from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, AttendanceStatus } from '@/lib/grape/types'
import { ATTENDANCE_LABEL, TICKET_STATUS_LABEL, DOW_SUN_FIRST as DOW_JA } from '@/lib/grape/constants'
import CyclingArtistImage from './CyclingArtistImage'

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
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function EventPreviewScreen({
  live,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
}: EventPreviewScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showStatusSheet, setShowStatusSheet] = useState(false)
  const [memoExpanded, setMemoExpanded] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const [lbScale, setLbScale] = useState(1)
  const lbLastDist = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const isOpen = live !== null

  // ── drag-to-dismiss ────────────────────────────────────────────────────────
  const [dragY, setDragY] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const touchStartTime = useRef(0)
  const activeDrag = useRef(false)
  const COVER_H = 252
  const DISMISS_PX = 100
  const DISMISS_VEL = 0.35 // px/ms

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
    touchStartTime.current = Date.now()
    activeDrag.current = false
    const panelEl = panelRef.current
    if (!panelEl) return
    const relY = e.touches[0].clientY - panelEl.getBoundingClientRect().top
    activeDrag.current = relY < COVER_H || (scrollRef.current?.scrollTop ?? 1) === 0
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!activeDrag.current) return
    const dy = e.touches[0].clientY - touchStartY.current
    if (dy > 0) setDragY(dy)
  }

  const onTouchEnd = () => {
    if (!activeDrag.current || dragY === 0) { activeDrag.current = false; return }
    const velocity = dragY / Math.max(Date.now() - touchStartTime.current, 1)
    activeDrag.current = false
    if (dragY > DISMISS_PX || velocity > DISMISS_VEL) {
      setDragY(0)
      onClose()
    } else {
      setDragY(0)
    }
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
    }
  }, [isOpen])

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
      {/* ── バックドロップ ───────────────────────────────────── */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
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
          transform: dragY > 0 ? `translateY(${dragY}px)` : isOpen && mounted ? 'translateY(0)' : 'translateY(105%)',
          transition: dragY > 0 ? 'none' : 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* ── カバーアート ──────────────────────────────────────── */}
        <div style={{ position: 'relative', height: COVER_H, flexShrink: 0 }}>
          {/* 画像 or プレースホルダー */}
          {live?.coverImage ? (
            <img
              src={live.coverImage}
              alt={live?.title ?? ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                    onClick={() => { setShowMenu(false); onDuplicate?.(live) }}
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
              {/* 参戦ステータスバッジ（タップ可能） */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowStatusSheet(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  padding: '5px 10px 5px 13px', borderRadius: 999,
                  background: 'rgba(0,0,0,0.38)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {ATTENDANCE_LABEL[live.attendanceStatus]}
                <CaretDown size={9} weight="bold" color="#fff" />
              </button>
            </div>
          )}
        </div>

        {/* ── イベント情報領域（スクロール可） ─────────────────── */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 48px' }}>
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

          {/* アーティスト名 */}
          <div
            style={{
              ...ty.sub, fontSize: 13,
              marginBottom: 20,
            }}
          >
            {live?.artists ? live.artists.join(' , ') : live?.artist}
          </div>

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
            position: 'absolute', inset: 0, zIndex: 400,
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
                    onStatusChange?.(live.id, status)
                    setShowStatusSheet(false)
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
            position: 'absolute', inset: 0, zIndex: 500,
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
              position: 'absolute', top: 16, right: 16,
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
    </>
  )
}
