'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import { StatusBar } from '@/components/encore/NavHeader'
import type { GrapeLive, GrapeArtist } from '@/lib/grape/types'
import { useGrapeStore } from '@/lib/grape/useGrapeStore'
import { LIVE_TYPE_COLOR } from '@/lib/grape/constants'
import { CalendarBlank, Ticket, ChartBar, GearSix, CaretLeft, CaretRight, MusicNote } from '@phosphor-icons/react'
import ArtistCard from '@/components/encore/ArtistCard'
import PhoneFrame from '@/components/grape/PhoneFrame'
import ArtistStackChart from '@/components/encore/ArtistStackChart'

// ─── 定数 ─────────────────────────────────────────────────────────────────────

const NOW           = new Date()
const CURRENT_YEAR  = NOW.getFullYear()
const CURRENT_MONTH = NOW.getMonth() + 1

// アーティスト別カラー（BarChart用）
const ARTIST_COLORS = [
  'var(--color-encore-green)',
  'var(--color-encore-amber)',
  '#0EA5E9',
  '#7C3AED',
  '#DB2777',
  'var(--color-encore-green-muted)',
]

const TAB_ITEMS = [
  { key: 'calendar', label: 'CALENDAR', Icon: CalendarBlank, href: '/grape/calendar' },
  { key: 'tickets',  label: 'TICKETS',  Icon: Ticket,        href: '/grape/tickets'  },
  { key: 'report',   label: 'REPORT',   Icon: ChartBar,      href: '/grape/report'   },
  { key: 'settings', label: 'SETTINGS', Icon: GearSix,       href: '/grape/settings' },
]

type Period = '今月' | '今年' | '累計'
const PERIODS: Period[] = ['今月', '今年', '累計']

// 曲トレンド（ダミー・架空）
const SONG_TREND = [
  { title: 'NOCTURNE',      artist: 'AOI',      count: 3, image: '/grape/artist/soloA_ssw.png' },
  { title: 'Neon Drive',    artist: 'NANA',     count: 2, image: '/grape/artist/soloB_RB.png' },
  { title: 'Aurora',        artist: 'Luna',     count: 2, image: '/grape/artist/vtuber.jpg'   },
  { title: 'Silent Bloom',  artist: 'koharu',   count: 2, image: '/grape/artist/soloD.png'    },
  { title: 'Paper Plane',   artist: 'MEI',      count: 1, image: '/grape/artist/soloC.png'    },
]

// ─── カウントアップフック ─────────────────────────────────────────────────────

function useCountUp(target: number, duration = 700): number {
  const [count, setCount] = useState(0)
  const rafRef  = useRef<number | null>(null)
  const fromRef = useRef(0)

  useEffect(() => {
    const from = fromRef.current
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const start = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      const next = Math.round(from + (target - from) * eased)
      setCount(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        fromRef.current = target
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration]) // eslint-disable-line react-hooks/exhaustive-deps

  return count
}

// ─── 集計ユーティリティ ──────────────────────────────────────────────────────

function filterByPeriod(lives: GrapeLive[], period: Period): GrapeLive[] {
  if (period === '今月') {
    const prefix = `${CURRENT_YEAR}-${String(CURRENT_MONTH).padStart(2, '0')}`
    return lives.filter(l => l.date.startsWith(prefix))
  }
  if (period === '今年') return lives.filter(l => l.date.startsWith(String(CURRENT_YEAR)))
  return lives
}

function computeArtistStats(lives: GrapeLive[], artists: GrapeArtist[]) {
  const map = new Map<string, number>()
  lives.forEach(l => map.set(l.artist, (map.get(l.artist) ?? 0) + 1))
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      name,
      count,
      image: artists.find(a => a.name === name)?.image,
    }))
}

function computeVenueStats(lives: GrapeLive[]) {
  const map = new Map<string, number>()
  lives.forEach(l => map.set(l.venue, (map.get(l.venue) ?? 0) + 1))
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))
}

function computeMonthlyStats(lives: GrapeLive[]) {
  return Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    count: lives.filter(l => parseInt(l.date.split('-')[1], 10) === i + 1).length,
  }))
}

function computeTypeStats(lives: GrapeLive[]) {
  const types = ['ワンマン', '対バン', 'フェス', '配信', '舞台・公演', 'メディア出演', 'リリースイベント', 'その他'] as const
  return types.map(t => ({ type: t, count: lives.filter(l => l.liveType === t).length }))
}

// ─── 共通パーツ ───────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ padding: '22px 20px 8px' }}>
      <span style={{
        fontFamily: 'var(--font-google-sans), sans-serif',
        fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-encore-text-muted)',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── HeroCard ──────────────────────────────────────────────────────────────────

function HeroCard({
  lives, period, periodLabel: propLabel, artistStats, venueStats,
}: {
  lives: GrapeLive[]
  period: Period
  periodLabel?: string
  artistStats: ReturnType<typeof computeArtistStats>
  venueStats: ReturnType<typeof computeVenueStats>
}) {
  const attended  = lives.filter(l => l.attendanceStatus === 'attended').length
  const confirmed = lives.filter(l => l.attendanceStatus === 'planned').length
  const candidate = lives.filter(l => l.attendanceStatus === 'candidate').length
  const skipped   = lives.filter(l => l.attendanceStatus === 'skipped').length
  const topArtist = artistStats[0]
  const topVenue  = venueStats[0]

  // カウントアップ
  const animTotal     = useCountUp(lives.length)
  const animAttended  = useCountUp(attended)
  const animConfirmed = useCountUp(confirmed)
  const animCandidate = useCountUp(candidate)
  const animSkipped   = useCountUp(skipped)

  const heroLabel = propLabel ?? (period === '今月'
    ? `今月のイベント数 · ${CURRENT_MONTH}月`
    : period === '今年'
      ? `今年のイベント数 · ${CURRENT_YEAR}`
      : '累計イベント数')

  return (
    <div style={{
      margin: '12px 16px 0',
      borderRadius: 8,
      background: 'var(--color-encore-bg-section)',
      overflow: 'hidden',
    }}>
      {/* メイン数値 */}
      <div style={{ padding: '22px 20px 16px', display: 'flex', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ ...ty.caption, marginBottom: 8 }}>
            {heroLabel}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 56, fontWeight: 700, lineHeight: 1,
              color: 'var(--color-encore-green)', letterSpacing: '-0.02em',
              fontVariantNumeric: 'tabular-nums',
              minWidth: `${String(lives.length).length}ch`,
              display: 'inline-block',
            }}>
              {animTotal}
            </span>
            <span style={{ ...ty.caption }}>本</span>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
            {attended > 0 && (
              <span style={{ ...ty.caption, fontVariantNumeric: 'tabular-nums' }}>参戦済み {animAttended}</span>
            )}
            {confirmed > 0 && (
              <span style={{ ...ty.caption, fontVariantNumeric: 'tabular-nums' }}>予定 {animConfirmed}</span>
            )}
            {candidate > 0 && (
              <span style={{ ...ty.caption, fontVariantNumeric: 'tabular-nums' }}>気になる {animCandidate}</span>
            )}
            {skipped > 0 && (
              <span style={{ ...ty.caption, fontVariantNumeric: 'tabular-nums' }}>スキップ {animSkipped}</span>
            )}
          </div>
        </div>

        {/* アーティストアバター群（最大5枠、5名以上はオーバーフロー表示） */}
        {(() => {
          const total     = artistStats.length
          const hasMore   = total > 4
          const displayed = hasMore ? artistStats.slice(0, 4) : artistStats.slice(0, 5)
          const overflow  = total - 4   // hasMore のとき > 0

          return (
            <div style={{ display: 'flex', paddingTop: 4 }}>
              {displayed.map((a, i) => (
                <div key={a.name} style={{
                  width: 38, height: 38, borderRadius: '50%', overflow: 'hidden',
                  border: '2px solid var(--color-encore-bg-section)',
                  marginLeft: i > 0 ? -11 : 0,
                  background: 'var(--color-encore-bg)', flexShrink: 0,
                }}>
                  {a.image && (
                    <img src={a.image} alt={a.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  )}
                </div>
              ))}

              {/* +N オーバーフロー */}
              {hasMore && (
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  border: '2px solid var(--color-encore-bg-section)',
                  marginLeft: -11,
                  background: 'var(--color-encore-green)',
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-google-sans), sans-serif',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                    letterSpacing: '-0.02em',
                  }}>
                    +{overflow}
                  </span>
                </div>
              )}
            </div>
          )
        })()}
      </div>

      {/* サブ統計 */}
      <div style={{
        borderTop: '1px solid var(--color-encore-border-light)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
        <div style={{ padding: '13px 16px', borderRight: '1px solid var(--color-encore-border-light)', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ ...ty.caption, marginBottom: 5 }}>最多アーティスト</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
            {topArtist?.image && (
              <div style={{ width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                <img src={topArtist.image} alt={topArtist.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </div>
            )}
            <div style={{
              ...ty.section, fontSize: 18,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              minWidth: 0, flex: 1,
            }}>{topArtist?.name ?? '—'}</div>
          </div>
          {topArtist && <div style={{ ...ty.caption, marginTop: 3 }}>{topArtist.count}本</div>}
        </div>
        <div style={{ padding: '13px 16px', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ ...ty.caption, marginBottom: 5 }}>最多会場</div>
          <div style={{
            ...ty.section, lineHeight: 1.35, fontSize: 18,
            overflow: 'hidden',
            display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
          }}>{topVenue?.name ?? '—'}</div>
          {topVenue && <div style={{ ...ty.caption, marginTop: 3 }}>{topVenue.count}回</div>}
        </div>
      </div>
    </div>
  )
}

// ─── MonthlyChart ─────────────────────────────────────────────────────────────

function MonthlyChart({ data }: { data: ReturnType<typeof computeMonthlyStats> }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  const CHART_H  = 72
  const [ready, setReady] = useState(false)

  // data が変わるたびに 0 → 実値 へアニメーション
  useEffect(() => {
    setReady(false)
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)))
    return () => cancelAnimationFrame(id)
  }, [data])

  return (
    <div style={{
      margin: '0 16px', borderRadius: 8,
      background: 'var(--color-encore-bg-section)',
      padding: '16px 14px 12px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: 4, height: CHART_H + 36,
      }}>
        {data.map((d, i) => {
          const isPast   = d.month < CURRENT_MONTH
          const isCurr   = d.month === CURRENT_MONTH
          const isFuture = d.month > CURRENT_MONTH
          const targetH  = d.count > 0 ? Math.max((d.count / maxCount) * CHART_H, 6) : 0
          const barH     = ready ? (targetH > 0 ? targetH : 2) : 2
          const barColor = isCurr
            ? 'var(--color-encore-green)'
            : isFuture && d.count > 0
              ? 'var(--color-encore-amber)'
              : isPast && d.count > 0
                ? 'var(--color-encore-green-muted)'
                : 'var(--color-encore-border-light)'
          return (
            <div key={d.month} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            }}>
              <div style={{
                ...ty.caption, fontSize: 12, height: 14,
                fontWeight: isCurr ? 700 : 400,
                color: 'var(--color-encore-green)',
                visibility: d.count > 0 ? 'visible' : 'hidden',
                transition: 'opacity 0.3s',
                opacity: ready ? 1 : 0,
              }}>
                {d.count}
              </div>
              <div style={{
                width: '100%', height: barH,
                borderRadius: 3, background: barColor,
                alignSelf: 'flex-end',
                transition: `height 0.55s cubic-bezier(0.34, 1.3, 0.64, 1) ${i * 25}ms`,
              }} />
              <div style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 12, lineHeight: 1,
                color: 'var(--color-encore-green)',
                fontWeight: isCurr ? 700 : 400,
              }}>
                {d.month}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ ...ty.caption, textAlign: 'right', marginTop: 6 }}>
        ■ 今月　<span style={{ color: 'var(--color-encore-amber)' }}>■</span> 予定
      </div>
    </div>
  )
}

// ─── ArtistRankingList ────────────────────────────────────────────────────────

function ArtistRankingList({
  data,
  artists,
  period,
}: {
  data: ReturnType<typeof computeArtistStats>
  artists: import('@/lib/grape/types').GrapeArtist[]
  period: Period
}) {
  return (
    <div style={{ margin: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((a, i) => {
        const artistId = artists.find(ar => ar.name === a.name)?.id
        return (
          <a
            key={a.name}
            href={artistId ? `/grape/artist/${artistId}?period=${encodeURIComponent(period)}` : undefined}
            style={{ textDecoration: 'none', display: 'block' }}
          >
            <ArtistCard
              name={a.name}
              image={a.image}
              color={ARTIST_COLORS[i % ARTIST_COLORS.length]}
              liveCount={a.count}
            />
          </a>
        )
      })}
    </div>
  )
}

// ─── LiveTypeRatioCard ────────────────────────────────────────────────────────

function LiveTypeRatioCard({
  data, total,
}: { data: ReturnType<typeof computeTypeStats>; total: number }) {
  const active = data.filter(d => d.count > 0)
  return (
    <div style={{
      margin: '0 16px', borderRadius: 8,
      background: 'var(--color-encore-bg-section)', padding: '16px',
    }}>
      {/* 積み上げバー */}
      <div style={{
        display: 'flex', height: 14, borderRadius: 7,
        overflow: 'hidden', gap: 2, marginBottom: 16,
      }}>
        {active.map(d => (
          <div key={d.type} style={{
            flex: d.count, background: LIVE_TYPE_COLOR[d.type] ?? 'var(--color-encore-border)',
            borderRadius: 2,
          }} />
        ))}
      </div>
      {/* 凡例 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 0' }}>
        {data.map(d => (
          <div key={d.type} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 2, flexShrink: 0,
              background: LIVE_TYPE_COLOR[d.type] ?? 'var(--color-encore-border)',
            }} />
            <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)' }}>{d.type}</span>
            <span style={{
              ...ty.caption, fontWeight: 700,
              marginLeft: 'auto', paddingRight: 12,
              color: d.count > 0 ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
            }}>
              {d.count}
            </span>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div style={{
          ...ty.caption, textAlign: 'right', marginTop: 12,
          borderTop: '1px solid var(--color-encore-border-light)', paddingTop: 10,
        }}>
          合計 {total}本
        </div>
      )}
    </div>
  )
}

// ─── VenueRankingCard ─────────────────────────────────────────────────────────

function VenueRankingCard({
  data, max,
}: { data: ReturnType<typeof computeVenueStats>; max: number }) {
  return (
    <div style={{
      margin: '0 16px', borderRadius: 8,
      background: 'var(--color-encore-bg-section)', overflow: 'hidden',
    }}>
      {data.map((venue, idx) => (
        <div key={venue.name}>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <span style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 12, fontWeight: 700, width: 14, textAlign: 'center', flexShrink: 0,
                color: idx === 0 ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
              }}>
                {idx + 1}
              </span>
              <span style={{ ...ty.bodySM, fontWeight: 700, flex: 1 }}>{venue.name}</span>
              <span style={{ ...ty.caption, fontWeight: 700 }}>{venue.count}回</span>
            </div>
            <div style={{ paddingLeft: 24 }}>
              <div style={{
                height: 3, borderRadius: 2,
                background: 'var(--color-encore-border-light)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${(venue.count / max) * 100}%`,
                  background: idx === 0 ? 'var(--color-encore-green)' : 'var(--color-encore-green-muted)',
                }} />
              </div>
            </div>
          </div>
          {idx < data.length - 1 && (
            <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 16px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── SongTrendCard ────────────────────────────────────────────────────────────

function SongTrendCard({ data }: { data: typeof SONG_TREND }) {
  return (
    <div style={{
      margin: '0 16px', borderRadius: 8,
      background: 'var(--color-encore-bg-section)', overflow: 'hidden',
    }}>
      {data.map((song, idx) => (
        <div key={song.title}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 6, overflow: 'hidden',
              flexShrink: 0, background: 'var(--color-encore-bg)',
            }}>
              <img src={song.image} alt={song.artist}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                ...ty.bodySM, fontWeight: 700,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{song.title}</div>
              <div style={{ ...ty.caption, marginTop: 2 }}>{song.artist}</div>
            </div>
            <span style={{
              ...ty.caption, fontWeight: 700,
              background: 'var(--color-encore-bg)',
              padding: '3px 9px', borderRadius: 999,
              flexShrink: 0,
            }}>
              {song.count}回
            </span>
          </div>
          {idx < data.length - 1 && (
            <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 16px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ period }: { period: Period }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '64px 32px 32px', gap: 10,
    }}>
      <MusicNote size={40} weight="light" color="var(--color-encore-border)" />
      <div style={{ ...ty.section, textAlign: 'center', marginTop: 8 }}>
        まだレポートが育っていません
      </div>
      <div style={{ ...ty.sub, textAlign: 'center', lineHeight: 1.7 }}>
        イベントに参加すると、<br />ここにあなたの記録がたまっていきます。
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { lives, artists } = useGrapeStore()
  const [period, setPeriod]           = useState<Period>('今年')
  const [monthOffset, setMonthOffset] = useState(0)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // 今月モード時に表示する年月
  const displayDate = useMemo(() => {
    const d = new Date(CURRENT_YEAR, CURRENT_MONTH - 1 + monthOffset)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }, [monthOffset])

  const filteredLives = useMemo(() => {
    if (period === '今月') {
      const prefix = `${displayDate.year}-${String(displayDate.month).padStart(2, '0')}`
      return lives.filter(l => l.date.startsWith(prefix))
    }
    return filterByPeriod(lives, period)
  }, [lives, period, displayDate])

  const heroLabel = period === '今月'
    ? `イベント数 · ${displayDate.year !== CURRENT_YEAR ? `${displayDate.year}年` : ''}${displayDate.month}月`
    : period === '今年'
      ? `今年のイベント数 · ${CURRENT_YEAR}`
      : '累計イベント数'

  const artistStats   = useMemo(() => computeArtistStats(filteredLives, artists), [filteredLives, artists])
  const venueStats    = useMemo(() => computeVenueStats(filteredLives), [filteredLives])
  const monthlyStats  = useMemo(() => computeMonthlyStats(filteredLives), [filteredLives])
  const typeStats     = useMemo(() => computeTypeStats(filteredLives), [filteredLives])
  const maxVenue      = venueStats[0]?.count ?? 1

  // スワイプハンドラ（今月モード時のみ月送り）
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || period !== '今月') return
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      setMonthOffset(o => dx < 0 ? o + 1 : o - 1)
    }
    touchStartRef.current = null
  }

  // PieChart 用データ: alwaysColor 設定済みならそのカラー、未設定は ARTIST_COLORS ローテーション
  const pieData = useMemo(() => artistStats.map((stat, i) => {
    const artist = artists.find(a => a.name === stat.name)
    const color  = (artist?.alwaysColor && artist?.defaultColor)
      ? artist.defaultColor
      : ARTIST_COLORS[i % ARTIST_COLORS.length]
    return { label: stat.name, value: stat.count, color, image: stat.image, avatarColor: color }
  }), [artistStats, artists])

  return (
    <PhoneFrame>
        <StatusBar />

        {/* ── ヘッダー ── */}
        <div style={{
          padding: '8px 20px 12px',
          background: 'var(--color-encore-bg)',
          flexShrink: 0,
        }}>
          <div className="grape-page-title" style={{ ...ty.display, lineHeight: 1 }}>Report</div>
        </div>

        {/* ── 期間タブ ── */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '10px 20px',
          background: 'var(--color-encore-bg)',
          borderBottom: '1px solid var(--color-encore-border-light)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 8, flex: 1 }}>
            {PERIODS.map(p => {
              const isActive = p === period
              return (
                <button
                  key={p}
                  onClick={() => { setPeriod(p); setMonthOffset(0) }}
                  style={{
                    padding: '8px 20px', borderRadius: 999,
                    // border幅は常に 1.5px 固定（色だけ切替）でレイアウトシフト回避
                    border: `1.5px solid ${isActive ? 'transparent' : 'var(--color-encore-border)'}`,
                    background: isActive ? 'var(--color-encore-green)' : 'transparent',
                    color: isActive ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 14, fontWeight: 700,
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                    transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                  }}
                >
                  {p}
                </button>
              )
            })}
          </div>

          {/* 月ナビゲーション（今月選択時のみ） */}
          {period === '今月' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button
                onClick={() => setMonthOffset(o => o - 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}
              >
                <CaretLeft size={13} weight="bold" color="var(--color-encore-green)" />
              </button>
              <span style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 12, fontWeight: 700,
                color: 'var(--color-encore-green)',
                minWidth: 28, textAlign: 'center',
                display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', gap: 1,
              }}>
                {displayDate.year !== CURRENT_YEAR ? (
                  <>
                    <span style={{ fontSize: 10 }}>{displayDate.year}/</span>
                    <span style={{ fontSize: 16 }}>{displayDate.month}</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: 16 }}>{displayDate.month}</span>
                    <span>月</span>
                  </>
                )}
              </span>
              <button
                onClick={() => setMonthOffset(o => o + 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}
              >
                <CaretRight size={13} weight="bold" color="var(--color-encore-green)" />
              </button>
            </div>
          )}
        </div>

        {/* ── スクロールコンテンツ ── */}
        <div
          style={{ flex: 1, overflowY: 'auto' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {filteredLives.length === 0 ? (
            <EmptyState period={period} />
          ) : (
            <div style={{ paddingBottom: 28 }}>

              {/* Hero */}
              <HeroCard
                lives={filteredLives} period={period} periodLabel={heroLabel}
                artistStats={artistStats} venueStats={venueStats}
              />

              {/* 月別推移（今月以外） */}
              {period !== '今月' && (
                <>
                  <SectionLabel label={period === '累計' ? 'Activity' : `Activity · ${CURRENT_YEAR}`} />
                  <MonthlyChart data={monthlyStats} />
                </>
              )}

              {/* アーティスト別参戦数 */}
              <SectionLabel label="Artists" />
              <ArtistStackChart data={pieData} totalLabel="TOTAL EVENTS" />
              <div style={{ height: 12 }} />
              <ArtistRankingList data={artistStats} artists={artists} period={period} />

              {/* ライブ種別比率 */}
              <SectionLabel label="Live Type" />
              <LiveTypeRatioCard data={typeStats} total={filteredLives.length} />

              {/* よく行った会場 */}
              <SectionLabel label="Venues" />
              <VenueRankingCard data={venueStats} max={maxVenue} />

              {/* 曲トレンド: セットリスト機能実装後に復活予定 */}
              {/* <SectionLabel label="Songs" /> */}
              {/* <SongTrendCard data={SONG_TREND} /> */}

            </div>
          )}
        </div>

        {/* ── タブバー ── */}
        <div style={{
          height: 68, background: 'var(--color-encore-bg)',
          borderTop: '1px solid var(--color-encore-border-light)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-around', padding: '8px 4px 0', flexShrink: 0,
        }}>
          {TAB_ITEMS.map(({ key, label, Icon, href }) => {
            const isActive = key === 'report'
            const color = isActive ? 'var(--color-encore-amber)' : 'var(--color-encore-green)'
            return (
              <a key={key} href={href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 4, textDecoration: 'none', flex: 1, paddingTop: 4,
                WebkitTapHighlightColor: 'transparent',
              }}>
                <Icon size={24} weight="regular" color={color} />
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 10, fontWeight: 700,
                  letterSpacing: '0.08em', textTransform: 'uppercase' as const, color,
                }}>
                  {label}
                </span>
              </a>
            )
          })}
        </div>
    </PhoneFrame>
  )
}
