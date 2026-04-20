'use client'

import React, { useState, useMemo } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import { StatusBar } from '@/components/encore/NavHeader'
import type { GrapeLive, TicketStatus } from '@/lib/grape/types'
import { useGrapeStore } from '@/lib/grape/useGrapeStore'
import QuickEventSheet from '@/components/grape/QuickEventSheet'
import EventPreviewScreen from '@/components/grape/EventPreviewScreen'
import { TICKET_STATUS_CONFIG } from '@/lib/grape/constants'
import PhoneFrame from '@/components/grape/PhoneFrame'
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
            fontSize: 15, fontWeight: 700,
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
            fontSize: 11, fontWeight: 700,
            color: dowColor,
            fontFamily: 'var(--font-google-sans), sans-serif',
          }}>
            {month}/{day}（{dow}）
          </span>
          {live.price != null && live.price > 0 && (
            <span style={{
              fontSize: 11, fontWeight: 700,
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
                fontSize: 11,
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
  { key: 'calendar', label: 'CALENDAR', Icon: CalendarBlank, href: '/grape/calendar' },
  { key: 'tickets',  label: 'TICKETS',  Icon: Ticket,        href: '/grape/tickets'  },
  { key: 'report',   label: 'REPORT',   Icon: ChartBar,      href: '/grape/report'   },
  { key: 'settings', label: 'SETTINGS', Icon: GearSix,       href: '/grape/settings' },
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
  const searchInputRef = React.useRef<HTMLInputElement>(null)

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
              {urgentLives.length > 0 && (
                <span style={{
                  ...ty.caption,
                  fontSize: 11, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 999,
                  background: 'var(--color-encore-amber)',
                  color: 'var(--color-encore-white)',
                }}>
                  要対応 {urgentLives.length}件
                </span>
              )}
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
                    fontSize: 13, color: 'var(--color-encore-green)',
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
                  fontSize: 13, color: 'var(--color-encore-green)',
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
                return (
                  <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {label}
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: 'var(--color-encore-amber)',
                      display: 'inline-block',
                    }} />
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
          style={{
            flex: 1,
            overflowY: 'auto',
            background: 'var(--color-encore-bg)',
            position: 'relative',
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
                        fontSize: 13, fontWeight: 700, color: '#fff',
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
                      fontSize: 13, fontWeight: 400,
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
                    fontSize: 13, fontWeight: 400,
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
                    textTransform: 'uppercase',
                    color,
                  }}
                >
                  {label}
                </span>
              </a>
            )
          })}
        </div>

        {/* ── FAB ── */}
        {!showAddSheet && !previewLive && !editLive && (
          <button
            onClick={() => setShowAddSheet(true)}
            style={{
              position: 'absolute',
              bottom: 16 + 68,
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
            onAddArtist={addArtist}
            onClose={() => setShowAddSheet(false)}
            onSave={(payload) => {
              addLive(payload as GrapeLive)
              setShowAddSheet(false)
            }}
          />
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
          />
        )}
    </PhoneFrame>
  )
}
