'use client'

import React, { useState, useMemo, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import {
  CaretLeft, CaretRight, CaretDown, MusicNote, MapPin, Question,
  DotsThree, Trash, X, UploadSimple, Cake, UserCirclePlus, UserCircle,
  PencilSimple, CheckCircle,
} from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import { useGrapeStore } from '@/lib/grape/useGrapeStore'
import type { GrapeLive, GrapeArtist } from '@/lib/grape/types'
import EventPreviewScreen from '@/components/grape/EventPreviewScreen'
import { ATTENDANCE_LABEL, CURRENT_YEAR, CURRENT_MONTH, TODAY, LIVE_TYPE_COLOR, DOW_SUN_COLOR, DOW_SAT_COLOR } from '@/lib/grape/constants'
import ColorPicker from '@/components/encore/ColorPicker'
import PhoneFrame from '@/components/grape/PhoneFrame'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'
import ArtistDeleteConfirmDialog from '@/components/grape/ArtistDeleteConfirmDialog'

// ─── 定数 ─────────────────────────────────────────────────────────────────────

const ATTENDANCE_COLOR: Record<string, string> = {
  attended:  'var(--color-encore-green)',
  planned:   'var(--color-encore-amber)',
  candidate: 'var(--color-encore-text-sub)',
  skipped:   'var(--color-encore-text-muted)',
}

type FilterTab = 'ALL' | '予定' | '参戦済み' | '気になる'
const FILTER_TABS: FilterTab[] = ['ALL', '予定', '参戦済み', '気になる']

// ─── ユーティリティ ────────────────────────────────────────────────────────────

const DOW_JA = ['日', '月', '火', '水', '木', '金', '土']

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()} (${DOW_JA[d.getDay()]})`
}

function fmtPrice(price: number): string {
  return '¥' + price.toLocaleString('ja-JP')
}

/** Stats strip 用: 100万以上は万表記に自動変換してchipからはみ出さないようにする */
function fmtPriceCompact(price: number): string {
  if (price >= 1_000_000) {
    const man = price / 10_000
    // 小数点以下が切れる場合は整数、そうでなければ小数1桁
    return `¥${Number.isInteger(man) ? man : man.toFixed(1)}万`
  }
  return '¥' + price.toLocaleString('ja-JP')
}

// ─── StatChip ─────────────────────────────────────────────────────────────────

function StatChip({
  icon,
  label,
  value,
  highlight,
  compact,
  suffix,
  onClick,
}: {
  icon?: React.ReactNode
  label: string
  value: string | number
  highlight?: boolean
  compact?: boolean
  suffix?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '16px 6px 12px', gap: 3,
        cursor: onClick ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon && (
        <div style={{ marginBottom: 2 }}>{icon}</div>
      )}
      {/* value + optional suffix (例: ? ボタン) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <span style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: compact ? 13 : 18, fontWeight: 700, lineHeight: 1,
          color: highlight ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
          whiteSpace: 'nowrap',
        }}>
          {value}
        </span>
        {suffix}
      </div>
      <span style={{
        ...ty.caption, fontSize: 10,
        color: 'var(--color-encore-text-sub)',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── ArtistEventCard ──────────────────────────────────────────────────────────

function ArtistEventCard({
  live,
  isFirst,
  isLast,
  onTap,
}: {
  live: GrapeLive
  isFirst: boolean
  isLast: boolean
  onTap: (l: GrapeLive) => void
}) {
  // DOT_TOP: カード内でドットを配置するy位置（上から）
  const DOT_TOP = 22
  const DOT_SIZE = 9

  return (
    <div
      style={{ display: 'flex', gap: 0, paddingLeft: 16 }}
      onClick={() => onTap(live)}
    >
      {/* ── Timeline column ────────────────────────────────────── */}
      {/* position: relative にして内部を全て absolute で配置 */}
      {/* alignSelf: stretch でカードと同じ高さに引き伸ばす       */}
      <div style={{
        position: 'relative', width: 20, flexShrink: 0, alignSelf: 'stretch',
      }}>
        {/* 上ライン: top → ドット中心まで（前カードの下ラインと接続） */}
        {!isFirst && (
          <div style={{
            position: 'absolute',
            top: 0,
            height: DOT_TOP + Math.ceil(DOT_SIZE / 2), // ドット中心まで
            width: 1,
            left: '50%', transform: 'translateX(-50%)',
            background: 'var(--color-encore-border-light)',
          }} />
        )}
        {/* ドット / チェック: left: 50% + translateX(-50%) で完全センタリング */}
        {live.attendanceStatus === 'attended' ? (
          <div style={{
            position: 'absolute',
            top: DOT_TOP - 1.5,
            left: '50%', transform: 'translateX(-50%)',
            lineHeight: 0, zIndex: 1,
            filter: 'drop-shadow(0 0 0 2px var(--color-encore-bg))',
          }}>
            <CheckCircle size={12} weight="fill" color="var(--color-encore-green)" />
          </div>
        ) : (
          <div style={{
            position: 'absolute',
            top: DOT_TOP,
            left: '50%', transform: 'translateX(-50%)',
            width: DOT_SIZE, height: DOT_SIZE,
            borderRadius: '50%',
            background: ATTENDANCE_COLOR[live.attendanceStatus] ?? 'var(--color-encore-border)',
            boxShadow: '0 0 0 2px var(--color-encore-bg)',
            zIndex: 1,
          }} />
        )}
        {/* 下ライン: ドット下端 → カード下端（次カードの上ラインと接続） */}
        {!isLast && (
          <div style={{
            position: 'absolute',
            top: DOT_TOP + DOT_SIZE,
            bottom: 0,
            width: 1,
            left: '50%', transform: 'translateX(-50%)',
            background: 'var(--color-encore-border-light)',
          }} />
        )}
      </div>

      {/* Card */}
      <div style={{
        flex: 1, minWidth: 0, marginLeft: 10, marginRight: 16,
        paddingBottom: isLast ? 0 : 8,
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}>
        <div style={{
          background: 'var(--color-encore-bg-section)',
          borderRadius: 10, overflow: 'hidden',
        }}>
          {/* スキップ状態はカード全体をグレーダウン */}
          <div style={{
            display: 'flex', gap: 10, padding: '12px 12px 10px', alignItems: 'flex-start',
            opacity: live.attendanceStatus === 'skipped' ? 0.42 : 1,
            filter: live.attendanceStatus === 'skipped' ? 'grayscale(0.5)' : 'none',
            transition: 'opacity 0.15s',
          }}>
            {/* Cover thumbnail */}
            <div style={{
              width: 52, height: 52, borderRadius: 7,
              overflow: 'hidden', flexShrink: 0,
              background: 'var(--color-encore-border-light)',
            }}>
              {live.coverImage ? (
                <img src={live.coverImage} alt={live.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : live.artistImage ? (
                <img src={live.artistImage} alt={live.artist}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: LIVE_TYPE_COLOR[live.liveType ?? ''] ?? 'var(--color-encore-green)',
                  opacity: 0.15,
                }} />
              )}
            </div>

            {/* Info — flex column, flex:1 → カード右端まで広がる */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Title row: タイトル（左）+ 金額（右） */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 4 }}>
                <div style={{
                  ...ty.sectionSM, fontSize: 13,
                  flex: 1, minWidth: 0,
                  display: '-webkit-box',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 2,
                  overflow: 'hidden',
                  lineHeight: 1.4,
                }}>
                  {live.title}
                </div>
                {live.price !== undefined && live.price > 0 && (
                  <div style={{
                    ...ty.price, fontSize: 11,
                    color: 'var(--color-encore-text-sub)',
                    flexShrink: 0,
                    whiteSpace: 'nowrap',
                    paddingTop: 1,
                  }}>
                    {fmtPrice(live.price)}
                  </div>
                )}
              </div>
              {/* Date */}
              <div style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 13, fontWeight: 700,
                color: 'var(--color-encore-text-sub)',
                marginBottom: 5,
              }}>
                {fmtDate(live.date)}
              </div>
              {/* Venue + 参戦ステータスバッジ — info div が flex:1 なのでこの行は全幅 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {/* 左: アイコン + 会場名（flex:1 で残りを全部使う） */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, minWidth: 0 }}>
                  <MapPin size={10} weight="fill" color="var(--color-encore-text-muted)" />
                  <span style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 11, display: 'block',
                    color: 'var(--color-encore-text-sub)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {live.venue ?? '会場未定'}
                  </span>
                </div>
                {/* 右: バッジ — 常にカード右端 */}
                <span style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 999,
                  border: `1px solid ${ATTENDANCE_COLOR[live.attendanceStatus] ?? 'var(--color-encore-border)'}`,
                  color: ATTENDANCE_COLOR[live.attendanceStatus] ?? 'var(--color-encore-text-muted)',
                  background: 'transparent',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {ATTENDANCE_LABEL[live.attendanceStatus]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── LiveTypeBreakdown ────────────────────────────────────────────────────────

function LiveTypeBreakdown({ lives }: { lives: GrapeLive[] }) {
  const types = Object.keys(LIVE_TYPE_COLOR)
  const data = types.map(t => ({ type: t, count: lives.filter(l => l.liveType === t).length }))
  const active = data.filter(d => d.count > 0)
  if (active.length === 0) return null
  const total = active.reduce((s, d) => s + d.count, 0)

  return (
    <div style={{
      margin: '0 16px', borderRadius: 10,
      background: 'var(--color-encore-bg-section)', padding: 14,
    }}>
      {/* Stacked bar */}
      <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2, marginBottom: 14 }}>
        {active.map(d => (
          <div key={d.type} style={{
            flex: d.count,
            background: LIVE_TYPE_COLOR[d.type] ?? 'var(--color-encore-border)',
            borderRadius: 2,
          }} />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 0' }}>
        {active.map(d => (
          <div key={d.type} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              width: 7, height: 7, borderRadius: 2, flexShrink: 0,
              background: LIVE_TYPE_COLOR[d.type] ?? 'var(--color-encore-border)',
            }} />
            <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', fontSize: 11 }}>{d.type}</span>
            <span style={{ ...ty.caption, fontWeight: 700, marginLeft: 'auto', paddingRight: 10 }}>
              {d.count}
            </span>
          </div>
        ))}
      </div>
      <div style={{
        ...ty.caption, textAlign: 'right', marginTop: 10,
        borderTop: '1px solid var(--color-encore-border-light)', paddingTop: 8,
        color: 'var(--color-encore-text-sub)',
      }}>
        合計 {total}本
      </div>
    </div>
  )
}

// ─── TopVenues ────────────────────────────────────────────────────────────────

function TopVenues({ lives }: { lives: GrapeLive[] }) {
  const venueMap = new Map<string, number>()
  lives.forEach(l => venueMap.set(l.venue, (venueMap.get(l.venue) ?? 0) + 1))
  const venues = Array.from(venueMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([name, count]) => ({ name, count }))
  if (venues.length === 0) return null
  const max = venues[0].count

  return (
    <div style={{
      margin: '0 16px', borderRadius: 10,
      background: 'var(--color-encore-bg-section)', overflow: 'hidden',
    }}>
      {venues.map((v, idx) => (
        <div key={v.name}>
          <div style={{ padding: '11px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 10, fontWeight: 700, width: 14, textAlign: 'center', flexShrink: 0,
                color: idx === 0 ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
              }}>
                {idx + 1}
              </span>
              <span style={{ ...ty.bodySM, fontWeight: 700, flex: 1, fontSize: 12 }}>{v.name}</span>
              <span style={{ ...ty.caption, fontWeight: 700 }}>{v.count}回</span>
            </div>
            <div style={{ paddingLeft: 22 }}>
              <div style={{
                height: 3, borderRadius: 2,
                background: 'var(--color-encore-border-light)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  width: `${(v.count / max) * 100}%`,
                  background: idx === 0 ? 'var(--color-encore-green)' : 'var(--color-encore-green-muted)',
                }} />
              </div>
            </div>
          </div>
          {idx < venues.length - 1 && (
            <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 14px' }} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── MonthlyActivityChart ─────────────────────────────────────────────────────

const CHART_CURRENT_YEAR  = CURRENT_YEAR
const CHART_CURRENT_MONTH = CURRENT_MONTH

function MonthlyActivityChart({ lives }: { lives: GrapeLive[] }) {
  // 今年（CHART_CURRENT_YEAR）のデータに絞る
  const yearLives = lives.filter(l => l.date.startsWith(String(CHART_CURRENT_YEAR)))

  const data = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const prefix = `${CHART_CURRENT_YEAR}-${String(month).padStart(2, '0')}`
    return { month, count: yearLives.filter(l => l.date.startsWith(prefix)).length }
  })

  const maxCount = Math.max(...data.map(d => d.count), 1)
  const CHART_H = 72

  return (
    <div style={{
      margin: '0 16px', borderRadius: 10,
      background: 'var(--color-encore-bg-section)',
      padding: '16px 10px 12px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: CHART_H + 36 }}>
        {data.map(d => {
          const isPast   = d.month < CHART_CURRENT_MONTH
          const isCurr   = d.month === CHART_CURRENT_MONTH
          const isFuture = d.month > CHART_CURRENT_MONTH
          const barH = d.count > 0 ? Math.max((d.count / maxCount) * CHART_H, 6) : 0
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
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 10, fontWeight: isCurr ? 700 : 400,
                height: 14, lineHeight: '14px',
                color: 'var(--color-encore-green)',
                visibility: d.count > 0 ? 'visible' : 'hidden',
              }}>
                {d.count}
              </div>
              <div style={{
                width: '100%', height: barH > 0 ? barH : 2,
                borderRadius: 3, background: barColor,
                alignSelf: 'flex-end',
              }} />
              <div style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 10, lineHeight: 1,
                color: 'var(--color-encore-green)',
                fontWeight: isCurr ? 700 : 400,
              }}>
                {d.month}
              </div>
            </div>
          )
        })}
      </div>
      {/* 凡例 */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        gap: 10, marginTop: 8,
        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
        fontSize: 10, color: 'var(--color-encore-text-sub)',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--color-encore-green)' }} />
          今月
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'var(--color-encore-amber)' }} />
          予定
        </span>
      </div>
    </div>
  )
}

// ─── SectionLabel ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div style={{ padding: '18px 16px 8px' }}>
      <span style={{
        fontFamily: 'var(--font-google-sans), sans-serif',
        fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: 'var(--color-encore-text-muted)',
      }}>
        {label}
      </span>
    </div>
  )
}

// ─── ArtistAvatar ─────────────────────────────────────────────────────────────

function ArtistAvatar({ image, name, size = 40 }: { image?: string; name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 999, flexShrink: 0,
      background: 'var(--color-encore-bg-section)',
      overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
      border: '1.5px solid var(--color-encore-border-light)',
    }}>
      {image ? (
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <UserCircle size={size * 0.55} weight="light" color="var(--color-encore-text-muted)" />
      )}
    </div>
  )
}

// ─── ArtistEditSheet ──────────────────────────────────────────────────────────

function ArtistEditSheet({
  artist,
  onSave,
  onClose,
}: {
  artist: GrapeArtist
  onSave: (updated: GrapeArtist) => void
  onClose: () => void
}) {
  const [name,         setName]         = useState(artist.name)
  const [image,        setImage]        = useState(artist.image ?? '')
  const [birthday,     setBirthday]     = useState(artist.birthday ?? '')
  const [alwaysColor,  setAlwaysColor]  = useState(artist.alwaysColor ?? false)
  const [defaultColor, setDefaultColor] = useState<string | null>(artist.defaultColor ?? null)
  const [showOverlay,  setShowOverlay]  = useState(false)
  const [showBdPicker, setShowBdPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initMonth = birthday ? parseInt(birthday.split('-')[1]) - 1 : new Date().getMonth()
  const [pickerMonth, setPickerMonth] = useState(initMonth)

  // 月ナビ: 1月〜12月でクランプ（年をまたがない）
  const goMonth = (delta: number) => {
    setPickerMonth(m => Math.max(0, Math.min(11, m + delta)))
  }

  // 年なしで分解
  const bdParts = birthday ? birthday.split('-').map(Number) : null
  const bdMonth = bdParts?.[1] ?? null
  const bdDay   = bdParts?.[2] ?? null

  // 誕生日表示: 年なし「M月D日」
  const formatBirthday = (val: string) => {
    if (!val) return ''
    const [, m, d] = val.split('-').map(Number)
    return `${m}月${d}日`
  }

  // 年は固定 2000 で曜日計算
  const firstDow    = new Date(2000, pickerMonth, 1).getDay()
  const daysInMonth = new Date(2000, pickerMonth + 1, 0).getDate()
  const calCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (calCells.length % 7 !== 0) calCells.push(null)

  const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']
  const navBtnStyle = (disabled: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: disabled ? 'default' : 'pointer',
    width: 44, height: 44, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-google-sans), sans-serif',
    fontSize: 22, fontWeight: 700, lineHeight: 1,
    color: disabled ? 'var(--color-encore-border)' : 'var(--color-encore-green)',
    WebkitTapHighlightColor: 'transparent',
  })

  const canSave = name.trim().length > 0

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => { setImage(ev.target?.result as string); setShowOverlay(false) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', zIndex: 70 }}>
      <div onClick={() => { setShowOverlay(false); onClose() }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', zIndex: 1,
        background: 'var(--color-encore-bg)',
        borderRadius: '24px 24px 0 0',
        padding: '0 0 36px',
        maxHeight: '85vh', overflowY: 'auto',
      }}>
        {/* ドラッグハンドル */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--color-encore-border)' }} />
        </div>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--color-encore-text-muted)', WebkitTapHighlightColor: 'transparent' }}>
            <X size={20} weight="bold" />
          </button>
          <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>
            アーティストを編集
          </span>
          <button
            onClick={() => canSave && onSave({ ...artist, name: name.trim(), image: image || undefined, birthday: birthday || undefined, alwaysColor: alwaysColor || undefined, defaultColor: (alwaysColor && defaultColor) ? defaultColor : undefined })}
            style={{
              background: canSave ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
              border: 'none', borderRadius: 999, padding: '6px 16px',
              cursor: canSave ? 'pointer' : 'default',
              transition: 'background 0.15s', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 13, fontWeight: 700, color: canSave ? '#fff' : 'var(--color-encore-text-muted)' }}>保存</span>
          </button>
        </div>
        {/* アバター */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div onClick={() => setShowOverlay(v => !v)} style={{ position: 'relative', width: 72, height: 72, cursor: 'pointer' }}>
            <ArtistAvatar image={image || undefined} name={name} size={72} />
            {showOverlay && (
              <div onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(26,58,45,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <UploadSimple size={22} weight="regular" color="#fff" />
              </div>
            )}
          </div>
          <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 11, color: 'var(--color-encore-text-muted)' }}>
            {showOverlay ? 'タップして写真を選択' : 'タップして変更'}
          </span>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
        {/* フォーム */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 名前 */}
          <div>
            <div style={{ ...ty.captionMuted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>アーティスト名</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1.5px solid var(--color-encore-border-light)', padding: '8px 0' }}>
              <UserCirclePlus size={16} weight="regular" color="var(--color-encore-text-muted)" />
              <input
                value={name} onChange={e => setName(e.target.value)} placeholder="アーティスト名"
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 16, color: 'var(--color-encore-green)' }}
              />
              {name.length > 0 && (
                <button onClick={() => setName('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                  <X size={14} weight="bold" color="var(--color-encore-text-muted)" />
                </button>
              )}
            </div>
          </div>
          {/* 誕生日 */}
          <div>
            <div style={{ ...ty.captionMuted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>誕生日（任意）</div>
            <button onClick={() => setShowBdPicker(v => !v)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1.5px solid ${showBdPicker ? 'var(--color-encore-green)' : 'var(--color-encore-border-light)'}`, padding: '8px 0', background: 'transparent', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', transition: 'border-color 0.15s' }}>
              <Cake size={16} weight="regular" color="var(--color-encore-text-muted)" />
              <span style={{ flex: 1, textAlign: 'left', fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 16, color: birthday ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)' }}>
                {birthday ? formatBirthday(birthday) : '誕生日を選択'}
              </span>
              {birthday && (
                <div onClick={e => { e.stopPropagation(); setBirthday(''); setShowBdPicker(false) }} style={{ lineHeight: 1, padding: 2 }}>
                  <X size={14} weight="bold" color="var(--color-encore-text-muted)" />
                </div>
              )}
            </button>
            {showBdPicker && (
              <div style={{ marginTop: 8, borderRadius: 10, border: '1px solid var(--color-encore-border-light)', background: 'var(--color-encore-bg)', padding: '12px 10px 14px' }}>
                {/* ナビゲーション行（月のみ、1〜12月） */}
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                  <button
                    onClick={() => goMonth(-1)}
                    disabled={pickerMonth === 0}
                    style={navBtnStyle(pickerMonth === 0)}
                  >‹</button>
                  <span style={{
                    flex: 1, textAlign: 'center',
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)',
                  }}>
                    {pickerMonth + 1}月
                  </span>
                  <button
                    onClick={() => goMonth(1)}
                    disabled={pickerMonth === 11}
                    style={navBtnStyle(pickerMonth === 11)}
                  >›</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
                  {DOW_LABELS.map((d, i) => (
                    <div key={d} style={{ textAlign: 'center', padding: '2px 0', fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, fontWeight: 700, color: i === 0 ? DOW_SUN_COLOR : i === 6 ? DOW_SAT_COLOR : 'var(--color-encore-text-muted)' }}>{d}</div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0' }}>
                  {calCells.map((day, idx) => {
                    if (!day) return <div key={`e-${idx}`} />
                    const isSelected = day === bdDay && pickerMonth + 1 === bdMonth
                    const dow = (firstDow + (day - 1)) % 7
                    return (
                      <button
                        key={day}
                        onClick={() => { const mm = String(pickerMonth + 1).padStart(2, '0'); const dd = String(day).padStart(2, '0'); setBirthday(`2000-${mm}-${dd}`); setShowBdPicker(false) }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 36, borderRadius: 999, background: isSelected ? 'var(--color-encore-green)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 12, fontWeight: isSelected ? 700 : 400, color: isSelected ? '#fff' : dow === 0 ? DOW_SUN_COLOR : dow === 6 ? DOW_SAT_COLOR : 'var(--color-encore-green)', WebkitTapHighlightColor: 'transparent', transition: 'background 0.12s' }}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
          {/* イベントカラー設定 */}
          <div>
            <button
              onClick={() => setAlwaysColor(v => !v)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '10px 0', background: 'transparent', border: 'none', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
            >
              <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 15, fontWeight: 400, color: 'var(--color-encore-green)' }}>
                イベントを常に色指定する
              </span>
              <div style={{ position: 'relative', width: 44, height: 26, borderRadius: 999, background: alwaysColor ? 'var(--color-encore-green)' : 'var(--color-encore-border)', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 3, left: alwaysColor ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
            </button>
            {alwaysColor && (
              <ColorPicker value={defaultColor} onChange={c => setDefaultColor(c)} showDefault={false} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ArtistMenuPopover ────────────────────────────────────────────────────────
// ... ボタンの直下に生えるポップオーバー型メニュー

function ArtistMenuPopover({ onEdit, onDelete, onClose }: { onEdit: () => void; onDelete: () => void; onClose: () => void }) {
  const itemStyle: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
    padding: '13px 16px',
    background: 'transparent', border: 'none', cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent', textAlign: 'left' as const,
  }
  return (
    <>
      {/* バックドロップ（タップで閉じる・透明） */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 50 }}
      />
      {/* ポップオーバー本体 */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: 100,   // sticky wrapper top(0) + button top(52) + button height(34) + gap(14)
          right: 10,
          zIndex: 51,
          width: 200,
          background: 'rgba(18,36,26,0.94)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
        }}
      >
        {/* 吹き出し矢印（...ボタン中心に合わせる） */}
        <div style={{
          position: 'absolute', top: -6, right: 27,
          width: 12, height: 12,
          background: 'rgba(18,36,26,0.94)',
          transform: 'rotate(45deg)',
          borderRadius: 2,
        }} />

        {/* 編集 */}
        <button style={itemStyle} onClick={() => { onClose(); setTimeout(onEdit, 80) }}>
          <PencilSimple size={18} weight="regular" color="rgba(255,255,255,0.9)" />
          <span style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
          }}>
            名前・写真を編集
          </span>
        </button>

        {/* セパレータ */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.10)', margin: '0 12px' }} />

        {/* 削除 */}
        <button style={itemStyle} onClick={() => { onClose(); setTimeout(onDelete, 80) }}>
          <Trash size={18} weight="regular" color="#FF6B6B" />
          <span style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700, color: '#FF6B6B',
          }}>
            アーティストを削除
          </span>
        </button>
      </div>
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Period = '今月' | '今年' | '累計'

function filterLivesByPeriod(lives: GrapeLive[], period: Period): GrapeLive[] {
  if (period === '今月') {
    const prefix = `${CURRENT_YEAR}-${String(CURRENT_MONTH).padStart(2, '0')}`
    return lives.filter(l => l.date.startsWith(prefix))
  }
  if (period === '今年') return lives.filter(l => l.date.startsWith(String(CURRENT_YEAR)))
  return lives
}

function buildPeriodLabel(period: Period): string {
  if (period === '今月') return `${CURRENT_MONTH}月イベント数`
  if (period === '今年') return `${CURRENT_YEAR}年イベント数`
  return '累計イベント数'
}

export default function ArtistDetailPage() {
  const params        = useParams()
  const router        = useRouter()
  const searchParams  = useSearchParams()
  const id            = typeof params.id === 'string' ? params.id : ''

  // Report ページから渡される期間クエリ（未指定時は「累計」扱い）
  const rawPeriod = searchParams.get('period')
  const defaultPeriod: Period =
    rawPeriod === '今月' || rawPeriod === '今年' || rawPeriod === '累計'
      ? rawPeriod
      : '累計'
  const [period, setPeriod]           = useState<Period>(defaultPeriod)
  const [monthOffset, setMonthOffset] = useState(0)
  const [showPeriodMenu, setShowPeriodMenu] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const { lives, artists, updateLive, deleteLive, addLive, updateArtist, deleteArtist } = useGrapeStore()
  const { show: showToast } = useGrapeToast()

  const artist = useMemo(() => artists.find(a => a.id === id), [artists, id])

  // Lives featuring this artist (as main artist or co-artist)
  const artistLives = useMemo(() => {
    if (!artist) return []
    return lives
      .filter(l => l.artist === artist.name || l.artists?.includes(artist.name))
      .sort((a, b) => b.date.localeCompare(a.date))  // newest first
  }, [lives, artist])

  // 今月モード時の表示月
  const displayDate = useMemo(() => {
    const d = new Date(CURRENT_YEAR, CURRENT_MONTH - 1 + monthOffset)
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  }, [monthOffset])

  // 期間でフィルタしたライブ数（ヒーロー表示用）
  const periodLives = useMemo(() => {
    if (period === '今月') {
      const prefix = `${displayDate.year}-${String(displayDate.month).padStart(2, '0')}`
      return artistLives.filter(l => l.date.startsWith(prefix))
    }
    return filterLivesByPeriod(artistLives, period)
  }, [artistLives, period, displayDate])

  const periodLabel = period === '今月'
    ? `${displayDate.month}月イベント数`
    : buildPeriodLabel(period)

  // Stats
  const attended  = useMemo(() => artistLives.filter(l => l.attendanceStatus === 'attended'), [artistLives])
  const planned   = useMemo(() => artistLives.filter(l => l.attendanceStatus === 'planned'), [artistLives])
  const candidate = useMemo(() => artistLives.filter(l => l.attendanceStatus === 'candidate'), [artistLives])
  // 合計費用: 「参戦済み」+「行く」のみ（スキップ・気になる は除外）
  const totalSpend = useMemo(() =>
    artistLives
      .filter(l => l.attendanceStatus === 'attended' || l.attendanceStatus === 'planned')
      .reduce((s, l) => s + (l.price ?? 0), 0),
    [artistLives]
  )

  // Filter tabs
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL')
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const tabStripRef = useRef<HTMLDivElement>(null)

  // 期間フィルタ済みをベースにさらに参加ステータスで絞る
  const filteredLives = useMemo(() => {
    if (activeTab === '予定')    return periodLives.filter(l => l.attendanceStatus === 'planned')
    if (activeTab === '参戦済み') return periodLives.filter(l => l.attendanceStatus === 'attended')
    if (activeTab === '気になる') return periodLives.filter(l => l.attendanceStatus === 'candidate')
    return periodLives
  }, [periodLives, activeTab])

  // タブバッジ用カウント（期間ベース）
  const periodPlannedCount    = useMemo(() => periodLives.filter(l => l.attendanceStatus === 'planned').length,    [periodLives])
  const periodAttendedCount   = useMemo(() => periodLives.filter(l => l.attendanceStatus === 'attended').length,   [periodLives])
  const periodCandidateCount  = useMemo(() => periodLives.filter(l => l.attendanceStatus === 'candidate').length,  [periodLives])

  // flex:1 等幅タブなのでパーセントで位置計算 → DOM計測不要・初回から即表示
  const tabN = FILTER_TABS.length
  const tabIdx = FILTER_TABS.indexOf(activeTab)
  const tabIndicatorLeft  = `${(tabIdx / tabN) * 100}%`
  const tabIndicatorWidth = `${(1 / tabN) * 100}%`

  // 合計費用ツールチップ
  const [costTooltipVisible, setCostTooltipVisible] = useState(false)

  // アーティスト操作メニュー
  const [showMenu,         setShowMenu]         = useState(false)
  const [showEditSheet,    setShowEditSheet]    = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleSaveArtist = (updated: GrapeArtist) => {
    updateArtist(updated)
    setShowEditSheet(false)
    showToast('アーティスト情報を保存しました')
  }

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

  // EventPreviewScreen
  const [previewLive, setPreviewLive] = useState<GrapeLive | null>(null)

  if (!artist) {
    return (
      <PhoneFrame center>
          <span style={{ ...ty.section, color: 'var(--color-encore-text-sub)' }}>アーティストが見つかりません</span>
          <button
            onClick={() => router.back()}
            style={{
              ...ty.bodySM, color: 'var(--color-encore-amber)', fontWeight: 700,
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            ← 戻る
          </button>
      </PhoneFrame>
    )
  }

  // ── ここから先: artist は確定（上の `if (!artist) return` で早期リターン済み）──

  // アーティスト削除ハンドラ（共通ダイアログ ArtistDeleteConfirmDialog 使用）
  // 2 択: イベントも削除 / イベントは残す
  // トーストは遷移先ページがマウントしてから表示させるため setTimeout で遅延実行。
  const artistLinkedEventCount = lives.filter(l => l.artist === artist.name).length

  const handleDeleteArtistWithEvents = () => {
    const name = artist.name
    const count = artistLinkedEventCount
    // 紐づくライブを削除
    lives.forEach(l => { if (l.artist === name) deleteLive(l.id) })
    deleteArtist(artist.id)
    setShowDeleteDialog(false)
    router.back()
    setTimeout(() => {
      showToast(
        count > 0
          ? `「${name}」とイベント ${count} 件を削除しました`
          : `「${name}」を削除しました`,
      )
    }, 120)
  }

  const handleDeleteArtistKeepEvents = () => {
    const name = artist.name
    // artistImage をクリアして Person アイコン fallback へ
    lives.forEach(l => {
      if (l.artist === name) {
        updateLive({ ...l, artistImage: undefined, artistImages: undefined })
      }
    })
    deleteArtist(artist.id)
    setShowDeleteDialog(false)
    router.back()
    setTimeout(() => {
      showToast(`「${name}」を削除しました（イベントは残しました）`)
    }, 120)
  }

  // この画面のみ正方形ヒーロー。PhoneFrame 幅 393 に合わせる。
  const HERO_H = 393

  return (
    <PhoneFrame>
        {/* StatusBar は Hero 画像の上にオーバーレイするため通常表示はしない
            （画像が最上部まで到達するインスタ/MusicApp 風レイアウト） */}

        {/* ── 全体スクロールコンテナ ───────────────────────────── */}
        <div
          style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >

          {/* ステータスバー + 戻るボタン / ...ボタン: height:0 の sticky wrapper で常に固定 */}
          <div style={{ position: 'sticky', top: 0, height: 0, zIndex: 30, pointerEvents: 'none' }}>
            {/* 透明ステータスバー（画像上に白文字でオーバーレイ） */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 24px',
              color: '#fff',
              textShadow: '0 1px 3px rgba(0,0,0,0.45)',
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 15, fontWeight: 700,
              letterSpacing: '-0.03em',
              pointerEvents: 'none',
            }}>
              <span>19:17</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor">
                  <rect x="0" y="6" width="3" height="5" rx="0.5"/>
                  <rect x="4.5" y="4" width="3" height="7" rx="0.5"/>
                  <rect x="9" y="1.5" width="3" height="9.5" rx="0.5"/>
                  <rect x="13.5" y="0" width="3" height="11" rx="0.5" opacity="0.5"/>
                </svg>
                <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1"/>
                  <rect x="2" y="2" width="16" height="8" rx="1.5"/>
                  <rect x="22.5" y="3.5" width="2" height="5" rx="1" opacity="0.45"/>
                </svg>
              </span>
            </div>

            {/* 戻るボタン（左） */}
            <button
              onClick={() => router.back()}
              style={{
                position: 'absolute', top: 52, left: 16,
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(0,0,0,0.36)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                pointerEvents: 'all',
              }}
            >
              <CaretLeft size={16} weight="bold" color="#fff" />
            </button>
            {/* ...ボタン（右） */}
            <button
              onClick={() => setShowMenu(true)}
              style={{
                position: 'absolute', top: 52, right: 16,
                width: 34, height: 34, borderRadius: '50%',
                background: 'rgba(0,0,0,0.36)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                WebkitTapHighlightColor: 'transparent',
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
                pointerEvents: 'all',
              }}
            >
              <DotsThree size={20} weight="bold" color="#fff" />
            </button>
          </div>

          {/* ── Hero ──────────────────────────────────────────── */}
          <div style={{ position: 'relative', height: HERO_H }}>
            {/* Artist image */}
            {artist.image ? (
              <img
                src={artist.image}
                alt={artist.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(160deg, var(--color-encore-green) 0%, rgba(26,58,45,0.6) 100%)',
              }} />
            )}

            {/* Top scrim（ステータスバー + コントロールボタン可読性のため強めに） */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 130,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
              pointerEvents: 'none',
            }} />

            {/* Bottom scrim */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
              background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.72))',
              pointerEvents: 'none',
            }} />

            {/* Artist info overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '0 18px 16px',
            }}>
              {/* Artist name */}
              <div style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 26, fontWeight: 700, lineHeight: 1.2,
                color: '#fff',
                textShadow: '0 1px 8px rgba(0,0,0,0.4)',
                marginBottom: 4,
              }}>
                {artist.name}
              </div>

              {/* 期間別イベント数 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 11, fontWeight: 400,
                  color: 'rgba(255,255,255,0.65)',
                }}>
                  {periodLabel}
                </span>
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 22, fontWeight: 700, lineHeight: 1,
                  color: '#fff',
                }}>
                  {periodLives.length}<span style={{ fontSize: 13, fontWeight: 400, marginLeft: 2 }}>本</span>
                </span>
              </div>
            </div>
          </div>

          {/* ── Stats strip ─────────────────────────────────────── */}
          {/* position: relative でツールチップをここから相対配置 */}
          <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '1px solid var(--color-encore-border-light)',
            background: 'var(--color-encore-bg)',
          }}>
            <StatChip label="予定" value={planned.length} highlight onClick={() => setActiveTab('予定')} />
            <div style={{ width: 1, background: 'var(--color-encore-border-light)', flexShrink: 0, alignSelf: 'stretch', margin: '8px 0' }} />
            <StatChip
              label="参戦済み"
              value={attended.length}
              onClick={() => setActiveTab('参戦済み')}
            />
            <div style={{ width: 1, background: 'var(--color-encore-border-light)', flexShrink: 0, alignSelf: 'stretch', margin: '8px 0' }} />
            <StatChip label="気になる" value={candidate.length} onClick={() => setActiveTab('気になる')} />
            <div style={{ width: 1, background: 'var(--color-encore-border-light)', flexShrink: 0, alignSelf: 'stretch', margin: '8px 0' }} />
            <StatChip
              label="合計費用"
              value={totalSpend > 0 ? fmtPriceCompact(totalSpend) : '—'}
              compact
              suffix={
                <button
                  onClick={e => { e.stopPropagation(); setCostTooltipVisible(v => !v) }}
                  style={{
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0, flexShrink: 0,
                    WebkitTapHighlightColor: 'transparent',
                    opacity: 0.55,
                  }}
                >
                  <Question size={14} weight="regular" color="var(--color-encore-text-sub)" />
                </button>
              }
            />
          </div>

          {/* ツールチップ */}
          {costTooltipVisible && (
            <>
              {/* 背景タップで閉じる */}
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                onClick={() => setCostTooltipVisible(false)}
              />
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 12,
                zIndex: 50,
                background: 'var(--color-encore-green)',
                color: '#fff',
                borderRadius: 10,
                padding: '10px 13px',
                maxWidth: 210,
                lineHeight: 1.6,
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 11, fontWeight: 400,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                pointerEvents: 'none',
              }}>
                {/* 吹き出し三角 */}
                <div style={{
                  position: 'absolute', top: -5, right: 18,
                  width: 10, height: 10,
                  background: 'var(--color-encore-green)',
                  transform: 'rotate(45deg)',
                  borderRadius: 2,
                }} />
                「行く」または「参戦済み」のイベント費用の合計です
              </div>
            </>
          )}
        </div>

          {/* ── Period title ─────────────────────────────────── */}
          <div style={{ position: 'relative' }}>
            <div style={{
              padding: '8px 12px 8px',
              background: 'var(--color-encore-bg-section)',
              borderTop: '1px solid var(--color-encore-border-light)',
              borderBottom: '1px solid var(--color-encore-border-light)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              {/* ドロップダウントリガー（左揃え） */}
              <button
                onClick={() => setShowPeriodMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  flex: 1, justifyContent: 'flex-start',
                  background: 'none', border: 'none', padding: '4px 0',
                  cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--color-encore-green)',
                }}>
                  {period === '今月'
                    ? `${displayDate.year !== CURRENT_YEAR ? `${displayDate.year}年` : ''}${displayDate.month}月のレポート`
                    : period === '今年' ? `${CURRENT_YEAR}年のレポート`
                    : 'これまでのレポート'}
                </span>
                <CaretDown
                  size={12} weight="bold"
                  color="var(--color-encore-green)"
                  style={{
                    transition: 'transform 0.2s',
                    transform: showPeriodMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                    flexShrink: 0,
                  }}
                />
              </button>

              {/* 日付（今月以外） */}
              {period !== '今月' && (
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 10, fontWeight: 400,
                  color: 'var(--color-encore-text-muted)',
                }}>
                  {TODAY} 現在
                </span>
              )}

              {/* ◀▶ 月送りボタン（今月時のみ、右端） */}
              {period === '今月' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                  <button
                    onClick={() => setMonthOffset(o => o - 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <CaretLeft size={13} weight="bold" color="var(--color-encore-green)" />
                  </button>
                  <button
                    onClick={() => setMonthOffset(o => o + 1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', WebkitTapHighlightColor: 'transparent' }}
                  >
                    <CaretRight size={13} weight="bold" color="var(--color-encore-green)" />
                  </button>
                </div>
              )}
            </div>

            {/* ── Period dropdown menu ── */}
            {showPeriodMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 49 }}
                  onClick={() => setShowPeriodMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 4px)',
                  left: 16,
                  zIndex: 50,
                  background: 'var(--color-encore-bg)',
                  borderRadius: 12,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
                  overflow: 'hidden',
                  minWidth: 160,
                }}>
                  {(['今月', '今年', '累計'] as Period[]).map((p, idx) => {
                    const label = p === '今月' ? `${CURRENT_MONTH}月のレポート`
                                : p === '今年' ? `${CURRENT_YEAR}年のレポート`
                                : 'これまでのレポート'
                    const isSelected = p === period
                    return (
                      <button
                        key={p}
                        onClick={() => { setPeriod(p); setMonthOffset(0); setShowPeriodMenu(false) }}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '13px 16px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          borderTop: idx > 0 ? '1px solid var(--color-encore-border-light)' : 'none',
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <span style={{
                          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                          fontSize: 13, fontWeight: isSelected ? 700 : 400,
                          color: isSelected ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
                        }}>
                          {label}
                        </span>
                        {isSelected && (
                          <CheckCircle size={16} weight="fill" color="var(--color-encore-green)" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* ── Filter tabs (sticky) ─────────────────────────── */}
          <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--color-encore-bg)' }}>
            <div
              ref={tabStripRef}
              style={{
                position: 'relative',
                display: 'flex',
                boxShadow: 'inset 0 -1px 0 var(--color-encore-border-light)',
              }}
            >
            {FILTER_TABS.map((tab, idx) => {
              const isActive = tab === activeTab
              return (
                <button
                  key={tab}
                  ref={el => { tabRefs.current[idx] = el }}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '11px 0',
                    background: 'transparent', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 700,
                    color: isActive ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                    transition: 'color 0.2s',
                    WebkitTapHighlightColor: 'transparent',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab}
                  {tab !== 'ALL' && (
                    <span style={{
                      marginLeft: 5, fontSize: 10,
                      color: isActive ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                    }}>
                      {tab === '予定' ? periodPlannedCount : tab === '参戦済み' ? periodAttendedCount : periodCandidateCount}
                    </span>
                  )}
                </button>
              )
            })}
            {/* Sliding underline — position:relative親で正確に配置 */}
            <div style={{
              position: 'absolute', bottom: 0, height: 2,
              borderRadius: 1,
              background: 'var(--color-encore-green)',
              left: tabIndicatorLeft,
              width: tabIndicatorWidth,
              transition: 'left 0.22s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>

          {/* ── Events & Stats ──────────────────────────────────── */}
          <div>

          {filteredLives.length === 0 ? (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '48px 24px', gap: 8,
            }}>
              <MusicNote size={32} weight="light" color="var(--color-encore-border)" />
              <span style={{ ...ty.sub, textAlign: 'center' }}>
                {activeTab === '予定' ? '予定のイベントはありません' :
                 activeTab === '参戦済み' ? 'まだ参戦記録がありません' :
                 activeTab === '気になる' ? '気になるイベントはありません' :
                 'イベントがありません'}
              </span>
            </div>
          ) : (
            <>
              {/* ── Timeline events ── */}
              <SectionLabel label="Events" />
              <div style={{ paddingBottom: 4 }}>
                {filteredLives.map((live, i) => (
                  <ArtistEventCard
                    key={live.id}
                    live={live}
                    isFirst={i === 0}
                    isLast={i === filteredLives.length - 1}
                    onTap={setPreviewLive}
                  />
                ))}
              </div>

              {/* ── Stats sections (only on ALL tab) ── */}
              {activeTab === 'ALL' && (
                <>
                  {period !== '今月' && (
                    <>
                      <SectionLabel label={period === '累計' ? 'Activity' : `Activity · ${CHART_CURRENT_YEAR}`} />
                      <MonthlyActivityChart lives={periodLives} />
                    </>
                  )}

                  <SectionLabel label="Live Type" />
                  <LiveTypeBreakdown lives={periodLives} />

                  <SectionLabel label="Venues" />
                  <TopVenues lives={periodLives} />
                </>
              )}

              <div style={{ height: 32 }} />
            </>
          )}
          </div>
        </div>{/* end: 全体スクロールコンテナ */}

        {/* ── アーティストメニュー ─────────────────────────────── */}
        {showMenu && (
          <ArtistMenuPopover
            onEdit={() => setShowEditSheet(true)}
            onDelete={() => setShowDeleteDialog(true)}
            onClose={() => setShowMenu(false)}
          />
        )}
        {showEditSheet && (
          <ArtistEditSheet
            artist={artist}
            onSave={handleSaveArtist}
            onClose={() => setShowEditSheet(false)}
          />
        )}
        {showDeleteDialog && (
          <ArtistDeleteConfirmDialog
            artistName={artist.name}
            linkedEventCount={artistLinkedEventCount}
            onConfirmWithEvents={handleDeleteArtistWithEvents}
            onConfirmKeepEvents={handleDeleteArtistKeepEvents}
            onCancel={() => setShowDeleteDialog(false)}
          />
        )}

        {/* ── EventPreviewScreen ──────────────────────────────── */}
        <EventPreviewScreen
          live={previewLive}
          onClose={() => setPreviewLive(null)}
          onEdit={() => setPreviewLive(null)}
          onDelete={(id) => {
            deleteLive(id)
            setPreviewLive(null)
          }}
          onDuplicate={(live) => {
            const dup = { ...live, id: `live-${Date.now()}` }
            addLive(dup)
            setPreviewLive(null)
          }}
        />
    </PhoneFrame>
  )
}
