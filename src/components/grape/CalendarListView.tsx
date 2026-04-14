'use client'

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, GrapeArtist, LiveCardStatus } from '@/lib/grape/types'
import { ATTENDANCE_TO_LIVE_STATUS, BANNER_BG_COLOR, BANNER_BORDER_COLOR, CURRENT_YEAR } from '@/lib/grape/constants'
import LiveCard from '@/components/encore/LiveCard'
import { Cake, BellRinging, X as XIcon } from '@phosphor-icons/react'
import DismissableBanner from '@/components/grape/DismissableBanner'

interface CalendarListViewProps {
  lives: GrapeLive[]
  artists: GrapeArtist[]
  today: string
  onEventTap: (live: GrapeLive) => void
  onAddTap: () => void
  // バナー（スクロール内で表示）
  todayBirthdays?: GrapeArtist[]
  tomorrowLives?: GrapeLive[]
  birthdayBannerDismissed?: boolean
  onDismissBirthday?: () => void
  notifDismissed?: boolean
  onDismissNotif?: () => void
}

export interface CalendarListViewHandle {
  scrollToToday: () => void
}

// ─── フィルタータイプ ─────────────────────────────────────────────────────────
type FilterKey = 'upcoming' | 'yearCurrent' | 'ended'

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'upcoming',    label: '開催予定'              },
  { key: 'ended',       label: '終了'                  },
  { key: 'yearCurrent', label: String(CURRENT_YEAR)   },
]

// 「終了」タブに分類する条件（将来のスキップは含まない）
function isFilterEnded(live: GrapeLive, today: string): boolean {
  return live.date < today || live.attendanceStatus === 'attended'
}

// カードをグレーダウンする条件（将来のスキップも薄く表示）
function isGreyedOut(live: GrapeLive, today: string): boolean {
  return (
    live.date < today ||
    live.attendanceStatus === 'attended' ||
    live.attendanceStatus === 'skipped'
  )
}

// ─── HorizontalTabs版フィルター（ENCORE HorizontalTabs準拠） ─────────────────
function FilterHorizontalTabs({
  value,
  onChange,
}: {
  value: FilterKey
  onChange: (k: FilterKey) => void
}) {
  const activeIndex = FILTER_OPTIONS.findIndex((o) => o.key === value)
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const tab = tabRefs.current[activeIndex]
    if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth })
  }, [activeIndex])

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        background: 'var(--color-encore-bg)',
        boxShadow: 'inset 0 -1px 0 var(--color-encore-border-light)',
        flexShrink: 0,
      }}
    >
      {FILTER_OPTIONS.map((opt, i) => {
        const isActive = value === opt.key
        return (
          <div
            key={opt.key}
            ref={(el) => { tabRefs.current[i] = el }}
            onClick={() => onChange(opt.key)}
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '13px 8px 12px',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 12,
              fontWeight: 700,
              color: isActive ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'color 0.2s',
              WebkitTapHighlightColor: 'transparent',
              userSelect: 'none',
            }}
          >
            {opt.label}
          </div>
        )
      })}
      {/* スライドアンダーライン */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          height: 2,
          background: 'var(--color-encore-green)',
          left: indicator.left,
          width: indicator.width,
          transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
    </div>
  )
}

// ─── ArtistFilterStrip ────────────────────────────────────────────────────────
function ArtistFilterStrip({
  lives,
  artists,
  selectedArtist,
  onSelect,
}: {
  lives: GrapeLive[]
  artists: GrapeArtist[]
  selectedArtist: string | null
  onSelect: (artist: string | null) => void
}) {
  // Collect unique artists + count from the current filtered lives
  const artistCountMap = new Map<string, number>()
  for (const live of lives) {
    const name = live.artist
    artistCountMap.set(name, (artistCountMap.get(name) ?? 0) + 1)
  }
  const artistEntries = [...artistCountMap.entries()]

  // Don't show strip if only 1 or 0 artists
  if (artistEntries.length <= 1) return null

  return (
    <div
      style={{
        background: 'var(--color-encore-bg)',
        borderBottom: '1px solid var(--color-encore-border-light)',
        flexShrink: 0,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch' as const,
      }}
    >
      <div style={{ display: 'flex', gap: 4, padding: '10px 16px 10px', alignItems: 'flex-start' }}>
        {/* ALL pill */}
        <button
          onClick={() => onSelect(null)}
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 5,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 6px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: selectedArtist === null ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
              border: selectedArtist === null ? 'none' : '2px solid var(--color-encore-border-light)',
              transition: 'background 0.18s, border-color 0.18s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 11,
              fontWeight: 700,
              color: selectedArtist === null ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
              letterSpacing: '0.03em',
              transition: 'color 0.18s',
            }}>ALL</span>
          </div>
        </button>

        {/* Artist avatars */}
        {artistEntries.map(([name, count]) => {
          const artistData = artists.find((a) => a.name === name)
          const isSelected = selectedArtist === name
          return (
            <button
              key={name}
              onClick={() => onSelect(isSelected ? null : name)}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 5,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0 6px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--color-encore-bg-section)',
                    outline: isSelected ? '2.5px solid var(--color-encore-green)' : '2px solid transparent',
                    outlineOffset: 1,
                    transition: 'outline-color 0.18s',
                  }}
                >
                  {artistData?.image ? (
                    <img
                      src={artistData.image}
                      alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--color-encore-green)',
                      fontFamily: 'var(--font-google-sans), sans-serif',
                      fontSize: 16, fontWeight: 700,
                      color: 'var(--color-encore-white)',
                    }}>
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Count badge */}
                <div style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  minWidth: 16,
                  height: 16,
                  borderRadius: 999,
                  background: 'var(--color-encore-amber)',
                  border: '1.5px solid var(--color-encore-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 8,
                  fontWeight: 700,
                  color: 'var(--color-encore-white)',
                  padding: '0 3px',
                }}>
                  {count}
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 9,
                fontWeight: isSelected ? 700 : 400,
                color: isSelected ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                letterSpacing: '0.02em',
                whiteSpace: 'nowrap',
                maxWidth: 52,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const CalendarListView = forwardRef<CalendarListViewHandle, CalendarListViewProps>(
  function CalendarListView({
    lives, artists, today, onEventTap,
    todayBirthdays = [], tomorrowLives = [],
    birthdayBannerDismissed = false, onDismissBirthday,
    notifDismissed = false, onDismissNotif,
  }, ref) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const todaySectionRef = useRef<HTMLDivElement>(null)
    const [filter, setFilter] = useState<FilterKey>('upcoming')
    const [selectedArtist, setSelectedArtist] = useState<string | null>(null)
    const [jumpTrigger, setJumpTrigger] = useState(0)

    // 今日ボタン用: フィルターを upcoming に切り替えてから直近ライブへヌルッとスクロール
    useImperativeHandle(ref, () => ({
      scrollToToday: () => {
        setFilter('upcoming')
        setJumpTrigger(t => t + 1)
      },
    }))

    // フィルタリング（タブ）
    const tabFilteredLives = React.useMemo(() => {
      const sorted = [...lives].sort((a, b) => a.date.localeCompare(b.date))
      switch (filter) {
        case 'upcoming':
          return sorted.filter((l) => !isFilterEnded(l, today))
        case 'ended':
          return sorted.filter((l) => isFilterEnded(l, today))
        case 'yearCurrent':
          return sorted.filter((l) => l.date.startsWith(String(CURRENT_YEAR)))
        default:
          return sorted
      }
    }, [lives, today, filter])

    // アーティスト絞り込み
    const filteredLives = React.useMemo(() => {
      if (!selectedArtist) return tabFilteredLives
      return tabFilteredLives.filter((l) => l.artist === selectedArtist)
    }, [tabFilteredLives, selectedArtist])

    // タブ切り替え時にアーティスト絞り込みをリセット
    useEffect(() => {
      setSelectedArtist(null)
    }, [filter])

    // 通常のフィルター切り替え（即時リセット）
    useEffect(() => {
      if (filter === 'yearCurrent' && todaySectionRef.current && scrollRef.current) {
        const containerTop = scrollRef.current.getBoundingClientRect().top
        const itemTop = todaySectionRef.current.getBoundingClientRect().top
        scrollRef.current.scrollTop += itemTop - containerTop - 12
      } else if (scrollRef.current) {
        scrollRef.current.scrollTop = 0
      }
    }, [filter])

    // 今日ボタン: DOM更新後にスムーズスクロール
    useEffect(() => {
      if (jumpTrigger === 0) return
      // setTimeout(0) でレンダリング後を確実に待つ
      const tid = setTimeout(() => {
        if (todaySectionRef.current && scrollRef.current) {
          const containerTop = scrollRef.current.getBoundingClientRect().top
          const itemTop = todaySectionRef.current.getBoundingClientRect().top
          const targetTop = scrollRef.current.scrollTop + itemTop - containerTop - 12
          scrollRef.current.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
        } else if (scrollRef.current) {
          scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }, 0)
      return () => clearTimeout(tid)
    }, [jumpTrigger])

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* HorizontalTabs フィルター（固定） */}
        <FilterHorizontalTabs value={filter} onChange={setFilter} />

        {/* リスト本体（バナー・アーティストフィルターもスクロール内） */}
        {filteredLives.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--color-encore-bg)' }}>
            {/* バナー群（スクロールエリア先頭） */}
            {todayBirthdays.length > 0 && !birthdayBannerDismissed && (
              <DismissableBanner onDismiss={onDismissBirthday!}>
                {(dismiss) => (
                  <div style={{ background: BANNER_BG_COLOR, borderBottom: `1px solid ${BANNER_BORDER_COLOR}`, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Cake size={15} weight="fill" color="var(--color-encore-amber)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {todayBirthdays.map((a, i) => a.image ? <img key={a.id} src={a.image} alt={a.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginLeft: i > 0 ? -6 : 0, boxShadow: i > 0 ? '0 0 0 1.5px var(--color-encore-bg)' : 'none' }} /> : null)}
                      </div>
                      <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-encore-amber)', marginRight: 5 }}>今日</span>
                        {todayBirthdays.map(a => a.name).join('、')} の誕生日
                      </span>
                    </div>
                    <button onClick={dismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0, color: 'var(--color-encore-text-muted)' }}><XIcon size={14} weight="bold" /></button>
                  </div>
                )}
              </DismissableBanner>
            )}
            {tomorrowLives.length > 0 && !notifDismissed && (
              <DismissableBanner onDismiss={onDismissNotif!}>
                {(dismiss) => (
                  <div style={{ position: 'relative', background: BANNER_BG_COLOR, borderBottom: `1px solid ${BANNER_BORDER_COLOR}`, padding: '9px 16px 9px 19px', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span className="encore-border-pulse" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--color-encore-amber)' }} />
                    <span className="encore-bell-ring" style={{ flexShrink: 0 }}><BellRinging size={15} weight="fill" color="var(--color-encore-amber)" /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--color-encore-amber)', marginRight: 6 }}>明日</span>
                      <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tomorrowLives[0].title}{tomorrowLives[0].startTime && ` ${tomorrowLives[0].startTime}〜`}
                        {tomorrowLives.length > 1 && <span style={{ color: 'var(--color-encore-text-muted)', marginLeft: 4 }}>他{tomorrowLives.length - 1}件</span>}
                      </span>
                    </div>
                    <button onClick={dismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0, color: 'var(--color-encore-text-muted)' }}><XIcon size={14} weight="bold" /></button>
                  </div>
                )}
              </DismissableBanner>
            )}
            {/* アーティストフィルター */}
            <ArtistFilterStrip lives={tabFilteredLives} artists={artists} selectedArtist={selectedArtist} onSelect={setSelectedArtist} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={ty.captionMuted}>
                {filter === 'upcoming' ? '開催予定のイベントはありません' : filter === 'ended' ? '終了したイベントはありません' : `${CURRENT_YEAR}年のイベントはありません`}
              </span>
            </div>
          </div>
        ) : (
          <div
            ref={scrollRef}
            style={{ flex: 1, overflowY: 'auto', background: 'var(--color-encore-bg)' }}
          >
            {/* バナー群（スクロールエリア先頭） */}
            {todayBirthdays.length > 0 && !birthdayBannerDismissed && (
              <DismissableBanner onDismiss={onDismissBirthday!}>
                {(dismiss) => (
                  <div style={{ background: BANNER_BG_COLOR, borderBottom: `1px solid ${BANNER_BORDER_COLOR}`, padding: '9px 16px', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <Cake size={15} weight="fill" color="var(--color-encore-amber)" style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {todayBirthdays.map((a, i) => a.image ? <img key={a.id} src={a.image} alt={a.name} style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginLeft: i > 0 ? -6 : 0, boxShadow: i > 0 ? '0 0 0 1.5px var(--color-encore-bg)' : 'none' }} /> : null)}
                      </div>
                      <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--color-encore-amber)', marginRight: 5 }}>今日</span>
                        {todayBirthdays.map(a => a.name).join('、')} の誕生日
                      </span>
                    </div>
                    <button onClick={dismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0, color: 'var(--color-encore-text-muted)' }}><XIcon size={14} weight="bold" /></button>
                  </div>
                )}
              </DismissableBanner>
            )}
            {tomorrowLives.length > 0 && !notifDismissed && (
              <DismissableBanner onDismiss={onDismissNotif!}>
                {(dismiss) => (
                  <div style={{ position: 'relative', background: BANNER_BG_COLOR, borderBottom: `1px solid ${BANNER_BORDER_COLOR}`, padding: '9px 16px 9px 19px', display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span className="encore-border-pulse" style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--color-encore-amber)' }} />
                    <span className="encore-bell-ring" style={{ flexShrink: 0 }}><BellRinging size={15} weight="fill" color="var(--color-encore-amber)" /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 700, color: 'var(--color-encore-amber)', marginRight: 6 }}>明日</span>
                      <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tomorrowLives[0].title}{tomorrowLives[0].startTime && ` ${tomorrowLives[0].startTime}〜`}
                        {tomorrowLives.length > 1 && <span style={{ color: 'var(--color-encore-text-muted)', marginLeft: 4 }}>他{tomorrowLives.length - 1}件</span>}
                      </span>
                    </div>
                    <button onClick={dismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent', flexShrink: 0, color: 'var(--color-encore-text-muted)' }}><XIcon size={14} weight="bold" /></button>
                  </div>
                )}
              </DismissableBanner>
            )}
            {/* アーティストフィルター（スクロール内） */}
            <ArtistFilterStrip lives={tabFilteredLives} artists={artists} selectedArtist={selectedArtist} onSelect={setSelectedArtist} />
            {/* カード群 */}
            <div style={{ padding: '8px 16px 24px' }}>
            {(() => {
              let lastMonth = ''
              let passedTodayRef = false

              return filteredLives.map((live) => {
                const isPast = isGreyedOut(live, today)
                const isFirstUpcoming = !isFilterEnded(live, today) && !passedTodayRef && filter !== 'ended'
                if (isFirstUpcoming) passedTodayRef = true

                const [y, m] = live.date.split('-')
                const monthKey = `${y}-${m}`
                const showMonthSep = monthKey !== lastMonth
                lastMonth = monthKey

                const liveStatus = ATTENDANCE_TO_LIVE_STATUS[live.attendanceStatus]
                type LiveType = 'ワンマン' | '対バン' | 'フェス' | '配信'
                const liveType = live.liveType as LiveType

                return (
                  <div
                    key={live.id}
                    ref={isFirstUpcoming ? todaySectionRef : undefined}
                  >
                    {/* 月区切りヘッダー */}
                    {showMonthSep && (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          paddingTop: 16,
                          paddingBottom: 10,
                        }}
                      >
                        <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 40, fontWeight: 700, color: 'var(--color-encore-green)', lineHeight: 1 }}>{Number(m)}</span>
                        <span style={{ ...ty.captionMuted, fontSize: 14, letterSpacing: '0.04em', marginTop: 2 }}>{y}</span>
                      </div>
                    )}

                    {/* LiveCard */}
                    <div
                      onClick={() => onEventTap(live)}
                      style={{
                        marginBottom: 28,
                        borderRadius: 8,
                        overflow: 'hidden',
                        opacity: isPast ? 0.6 : 1,
                        cursor: 'pointer',
                        boxShadow: '0 2px 14px rgba(0,0,0,0.09)',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <LiveCard
                        date={live.date}
                        liveType={liveType}
                        liveStatus={liveStatus}
                        name={live.title}
                        artist={live.artists ? live.artists.join(' , ') : live.artist}
                        venue={live.venue}
                        time={
                          live.openingTime
                            ? `開場 ${live.openingTime}／開演 ${live.startTime}〜`
                            : live.endTime
                            ? `開演 ${live.startTime}〜${live.endTime}`
                            : `開演 ${live.startTime}〜`
                        }
                        flyerImage={live.coverImage}
                        artistImage={live.artistImage}
                        artistImages={live.artistImages}
                      />
                    </div>
                  </div>
                )
              })
            })()}
            </div>
          </div>
        )}
      </div>
    )
  }
)

export default CalendarListView
