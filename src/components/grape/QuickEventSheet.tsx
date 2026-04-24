'use client'

import React, { useEffect, useState, useRef } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, AttendanceStatus, GrapeArtist, LiveTypeGrape, TicketStatus } from '@/lib/grape/types'
import { CaretDown, CaretUp, CaretLeft, CaretRight, Camera, LinkSimple, Note, Car, X, CalendarBlank, ArrowsOutCardinal, Trash, Plus, UserCirclePlus, Clock, CheckCircle, Images, Palette } from '@phosphor-icons/react'
import ColorPicker, { DEFAULT_EVENT_COLOR_VISUAL, type ColorValue } from '@/components/encore/ColorPicker'
import { TODAY, DOW_SUN_COLOR, DOW_SAT_COLOR, TICKET_STATUS_LABEL } from '@/lib/grape/constants'
import { useIsPremium } from '@/lib/grape/premium'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'
import { Sparkle as SparkleIcon } from '@phosphor-icons/react'

// ─── Props ────────────────────────────────────────────────────────────────────
interface QuickEventSheetProps {
  date?: string
  /** 開始時刻（分） */
  startMin?: number
  /** 終了時刻（分） */
  endMin?: number
  live?: GrapeLive
  artists?: GrapeArtist[]
  onAddArtist?: (artist: GrapeArtist) => void
  onClose: () => void
  onSave?: (live: Partial<GrapeLive>) => void
  openSection?: 'ticket'
  /** Freeユーザ向けのPremium訴求バナー表示用コールバック（新規作成時のみ有効） */
  onShowPremium?: () => void
  /** 同日重複検出のための既存ライブ一覧（自分自身は除外される） */
  allLives?: GrapeLive[]
  /** 新規作成時の初期値として使われる、過去イベントからの推定値 */
  smartDefaults?: {
    liveType?: LiveTypeGrape
  } | null
  /** 会場入力欄フォーカス時に表示する直近会場サジェスト（重複排除済み） */
  recentVenues?: string[]
}

// ─── ENCORE準拠: 下線スタイルのinput wrapper ─────────────────────────────────
// InputField.tsx と同じ: 枠なし、下線のみ、フォーカスでグリーン下線アニメ

function FieldWrap({
  label,
  children,
  focused,
}: {
  label: string
  children: React.ReactNode
  focused?: boolean
}) {
  return (
    <div
      style={{
        position: 'relative',
        borderBottom: '1.5px solid var(--color-encore-border-light)',
        paddingTop: 4,
        transition: 'border-color 0.2s',
        marginBottom: 0,
      }}
    >
      <span
        style={{
          ...ty.caption,
          display: 'block',
          marginBottom: 2,
          color: focused ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
          transition: 'color 0.2s',
        }}
      >
        {label}
      </span>
      {children}
      {/* フォーカスアニメーションライン */}
      <div
        style={{
          position: 'absolute',
          bottom: -1,
          left: 0,
          right: 0,
          height: 1,
          background: 'var(--color-encore-green)',
          transform: focused ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'left',
        }}
      />
    </div>
  )
}

// テキスト / 日付 / 時刻 input の共通スタイル（ENCORE InputField準拠）
const flatInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  padding: '4px 0 8px',
  ...ty.body,
  fontSize: 15,
  lineHeight: 1.4,
  color: 'var(--color-encore-green)',
}

// ─── FlatInput ─────────────────────────────────────────────────────────────
function FlatInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  onFocusChange,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** 親にフォーカス状態を通知（サジェスト表示など） */
  onFocusChange?: (focused: boolean) => void
}) {
  const [focused, setFocused] = useState(false)
  return (
    <FieldWrap label={label} focused={focused}>
      <input
        type={type}
        className="grape-soft-placeholder"
        style={flatInputStyle}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => { setFocused(true); onFocusChange?.(true) }}
        onBlur={() => { setFocused(false); onFocusChange?.(false) }}
        placeholder={placeholder}
      />
    </FieldWrap>
  )
}

// ─── ENCORE準拠 Select wrapper ─────────────────────────────────────────────
// Select.tsx: bg-section、borderRadius 3、CaretDown、カスタムドロップダウン

function EncoreSelect<T extends string>({
  label,
  value,
  onChange,
  options,
  placeholder = '選択',
}: {
  label?: string
  value: T | ''
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {label && (
        <div style={{ ...ty.bodySM, marginBottom: 6, color: 'var(--color-encore-text-sub)' }}>
          {label}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: '100%',
          height: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          background: 'var(--color-encore-bg-section)',
          borderRadius: 3,
          border: 'none',
          cursor: 'pointer',
          ...(selected ? ty.body : ty.bodySM),
          fontSize: 15,
          color: selected ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          style={{
            color: 'var(--color-encore-green)',
            marginLeft: 8,
            flexShrink: 0,
            display: 'flex',
            transition: 'transform 0.2s',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <CaretDown size={16} weight="light" />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--color-encore-bg)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
            overflow: 'hidden',
            zIndex: 50,
          }}
        >
          {options.map((opt) => {
            const isActive = value === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false) }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: isActive ? 'var(--color-encore-bg-section)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  ...ty.bodySM,
                  color: isActive ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
                  fontWeight: isActive ? 700 : 400,
                  textAlign: 'left',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── FormSection (折りたたみセクション) ──────────────────────────────────────
function FormSection({
  icon,
  label,
  badge,
  children,
  defaultOpen = false,
}: {
  icon: React.ReactNode
  label: string
  badge?: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--color-encore-border-light)', overflow: 'visible', flexShrink: 0 }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 14px',
          background: open ? 'var(--color-grape-tint-04)' : 'var(--color-encore-bg)',
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          borderBottom: open ? '1px solid var(--color-encore-border-light)' : 'none',
          transition: 'background 0.15s',
          borderRadius: open ? '9px 9px 0 0' : 9,
        }}
      >
        <span style={{ color: 'var(--color-encore-green)', display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ ...ty.sectionSM, flex: 1, textAlign: 'left' }}>{label}</span>
        {!!badge && (
          <span
            style={{
              ...ty.caption,
              fontSize: 11,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 999,
              background: 'var(--color-encore-amber)',
              color: 'var(--color-encore-white)',
              marginRight: 4,
            }}
          >
            {badge}
          </span>
        )}
        <span style={{ color: 'var(--color-encore-text-sub)', display: 'flex', alignItems: 'center' }}>
          {open ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
        </span>
      </button>
      {open && (
        <div style={{ padding: '16px 14px 18px', display: 'flex', flexDirection: 'column', gap: 16, borderRadius: '0 0 9px 9px', background: 'var(--color-encore-bg)', overflow: 'visible' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── ArtistSelect ─────────────────────────────────────────────────────────────
type LocalArtist = GrapeArtist

function ArtistSelect({
  value, onChange, artists: allArtists, onAddArtist,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  artists: LocalArtist[]
  onAddArtist: () => void
}) {

  const toggle = (id: string) => {
    if (value.includes(id)) {
      // 最後の1人は外せない
      if (value.length === 1) return
      onChange(value.filter(v => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' as const }}>
      {/* 新しいアーティストを登録ボタン（左端） */}
      <button
        onClick={onAddArtist}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: 5, flexShrink: 0, background: 'transparent', border: 'none',
          cursor: 'pointer', WebkitTapHighlightColor: 'transparent', padding: '2px 4px',
        }}
      >
        <div style={{
          width: 48, height: 48, borderRadius: '50%',
          border: '1px solid var(--color-encore-green)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--color-encore-green)', flexShrink: 0,
        }}>
          <Plus size={18} weight="regular" />
        </div>
        <span style={{
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 10, fontWeight: 400, color: 'var(--color-encore-green)',
          whiteSpace: 'nowrap',
        }}>
          アーティスト登録
        </span>
      </button>

      {allArtists.map((a) => {
        const isSelected = value.includes(a.id)
        const selectionOrder = value.indexOf(a.id) + 1  // 1-based, 0 = not selected
        return (
          <button
            key={a.id}
            onClick={() => toggle(a.id)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 5, flexShrink: 0, background: 'transparent', border: 'none',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent', padding: '2px 4px',
            }}
          >
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%', overflow: 'hidden',
                border: isSelected ? '2.5px solid var(--color-encore-green)' : '2.5px solid transparent',
                boxSizing: 'border-box', background: 'var(--color-encore-bg-section)',
                transition: 'border-color 0.15s',
              }}>
                {a.image ? (
                  <img src={a.image} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...ty.caption, fontWeight: 700, color: 'var(--color-encore-text-sub)' }}>
                    {a.name[0]}
                  </div>
                )}
              </div>
              {/* 選択順バッジ（①②③...） */}
              {isSelected && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--color-encore-green)',
                  border: '1.5px solid var(--color-encore-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 8, fontWeight: 700, color: 'var(--color-encore-white)',
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  flexShrink: 0,
                }}>
                  {selectionOrder}
                </div>
              )}
            </div>
            <span style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 10, fontWeight: isSelected ? 700 : 400,
              color: isSelected ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
              whiteSpace: 'nowrap', maxWidth: 56, overflow: 'hidden',
              textOverflow: 'ellipsis', transition: 'color 0.15s',
            }}>
              {a.name}
            </span>
          </button>
        )
      })}

    </div>
  )
}

// ─── NewArtistSheet ────────────────────────────────────────────────────────────
function NewArtistSheet({
  onSave, onClose,
}: {
  onSave: (artist: LocalArtist) => void
  onClose: () => void
}) {
  const [name, setName] = useState('')
  const [image, setImage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80) }, [])

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setImage(URL.createObjectURL(f))
    e.target.value = ''
  }

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave({ id: `local-${Date.now()}`, name: trimmed, image: image || undefined })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 600,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.35)',
    }}>
      <div style={{
        background: 'var(--color-encore-bg)',
        borderRadius: '24px 24px 0 0',
        padding: '20px 20px 40px',
        display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        {/* ヘッダー */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...ty.heading, fontSize: 16 }}>アーティストを登録</span>
          <button onClick={onClose} style={{ background: 'var(--color-encore-bg-section)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
            <X size={13} weight="bold" color="var(--color-encore-text-sub)" />
          </button>
        </div>

        {/* アバター選択 + 名前入力 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{
              width: 64, height: 64, borderRadius: '50%',
              border: 'none',
              background: image ? 'transparent' : 'var(--color-encore-green-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, overflow: 'hidden',
              WebkitTapHighlightColor: 'transparent', padding: 0,
            }}
          >
            {image
              ? <img src={image} alt="アー写" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <UserCirclePlus size={28} weight="light" color="var(--color-encore-white)" />
            }
          </button>
          <div style={{ flex: 1, borderBottom: '1.5px solid var(--color-encore-border-light)', paddingBottom: 6 }}>
            <span style={{ ...ty.caption, display: 'block', marginBottom: 3, color: 'var(--color-encore-text-muted)' }}>アーティスト名</span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
              placeholder="アーティスト名"
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 16, fontWeight: 700, color: 'var(--color-encore-green)',
              }}
            />
          </div>
        </div>

        {/* 保存ボタン */}
        <button
          onClick={handleSave}
          disabled={!name.trim()}
          style={{
            height: 48, borderRadius: 999, border: 'none',
            background: name.trim() ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
            color: name.trim() ? 'var(--color-encore-white)' : 'var(--color-encore-text-muted)',
            cursor: name.trim() ? 'pointer' : 'default',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700,
            transition: 'background 0.2s, color 0.2s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          登録する
        </button>
      </div>
    </div>
  )
}

// ─── 参戦ステータス選択肢 ──────────────────────────────────────────────────────
const ATTENDANCE_STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
  { value: 'candidate', label: '気になる' },
  { value: 'planned',   label: '行く'     },
  { value: 'attended',  label: '参戦済み' },
  { value: 'skipped',   label: 'スキップ' },
]

// ─── BigTitleInput ─────────────────────────────────────────────────────────────
function BigTitleInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [focused, setFocused] = useState(false)
  return (
    <FieldWrap label="イベント名" focused={focused}>
      <input
        type="text"
        style={{
          ...flatInputStyle,
          fontSize: 20,
          fontWeight: 700,
          lineHeight: 1.3,
          padding: '6px 0 10px',
        }}
        className="grape-soft-placeholder"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="イベント名を入力"
      />
    </FieldWrap>
  )
}

// ─── BrandedCalendar ─────────────────────────────────────────────────────────
const CAL_DOW = ['月', '火', '水', '木', '金', '土', '日']

function BrandedCalendar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`

  const initY = value ? Number(value.split('-')[0]) : now.getFullYear()
  const initM = value ? Number(value.split('-')[1]) : now.getMonth() + 1
  const [viewYear, setViewYear] = useState(initY)
  const [viewMonth, setViewMonth] = useState(initM)

  const prevMonth = () => {
    if (viewMonth === 1) { setViewYear(y => y - 1); setViewMonth(12) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 12) { setViewYear(y => y + 1); setViewMonth(1) }
    else setViewMonth(m => m + 1)
  }

  const firstDow = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const btnBase: React.CSSProperties = {
    background: 'transparent', border: 'none', cursor: 'pointer',
    padding: 6, display: 'flex', alignItems: 'center',
    color: 'var(--color-encore-green)', WebkitTapHighlightColor: 'transparent',
  }

  return (
    <div style={{ padding: '8px 4px 4px' }}>
      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 6 }}>
        <button onClick={prevMonth} style={btnBase}><CaretLeft size={15} weight="light" /></button>
        <span style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--color-encore-green)' }}>
          {viewYear}年{viewMonth}月
        </span>
        <button onClick={nextMonth} style={btnBase}><CaretRight size={15} weight="light" /></button>
      </div>

      {/* DOW row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
        {CAL_DOW.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontFamily: 'var(--font-google-sans), sans-serif', color: i === 6 ? 'var(--color-encore-error)' : 'var(--color-encore-text-muted)', padding: '2px 0 4px' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {cells.map((day, idx) => {
          if (day === null) return <div key={`e-${idx}`} style={{ height: 34 }} />
          const dateStr = `${viewYear}-${String(viewMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const isSelected = dateStr === value
          const isToday = dateStr === todayStr
          const isSun = idx % 7 === 6
          return (
            <button
              key={dateStr}
              onClick={() => onChange(dateStr)}
              style={{ height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, WebkitTapHighlightColor: 'transparent' }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? 'var(--color-encore-green)' : 'transparent',
                border: isToday && !isSelected ? '1.5px solid var(--color-encore-green)' : '1.5px solid transparent',
              }}>
                <span style={{
                  fontSize: 13, lineHeight: 1,
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontWeight: isSelected || isToday ? 700 : 400,
                  color: isSelected ? 'var(--color-encore-white)' : isSun ? 'var(--color-encore-error)' : 'var(--color-encore-green)',
                }}>
                  {day}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── BigDateField ───────────────────────────────────────────────────────────────
function BigDateField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [showCal, setShowCal] = useState(false)

  const displayText = (() => {
    if (!value) return ''
    const [y, m, d] = value.split('-').map(Number)
    const dow = ['日', '月', '火', '水', '木', '金', '土']
    const day = dow[new Date(y, m - 1, d).getDay()]
    return `${y}年${m}月${d}日（${day}）`
  })()

  return (
    <div>
      <FieldWrap label="日付" focused={showCal}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowCal(v => !v)}
            style={{
              ...flatInputStyle,
              flex: 1,
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              padding: '4px 0 8px',
              color: displayText ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {displayText || '日付を選択'}
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowCal(v => !v)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0 0 8px', display: 'flex', alignItems: 'center',
              color: showCal ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
              transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            }}
          >
            <CalendarBlank size={17} weight="light" />
          </button>
        </div>
      </FieldWrap>

      {showCal && (
        <div style={{
          marginTop: 6,
          border: '1px solid var(--color-encore-border-light)',
          borderRadius: 12,
          background: 'var(--color-encore-bg)',
          overflow: 'hidden',
        }}>
          <BrandedCalendar
            value={value}
            onChange={(v) => { onChange(v); setShowCal(false) }}
          />
          {/* 「今日」ショートカット */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 12px 10px' }}>
            <button
              onClick={() => {
                const n = new Date()
                const s = `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`
                onChange(s)
                setShowCal(false)
              }}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 12, fontWeight: 700,
                color: 'var(--color-encore-green)',
                padding: '4px 8px',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              今日
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DrumColumn ─────────────────────────────────────────────────────────────
const DRUM_ITEM_H = 44

function DrumColumn({ items, value, onChange }: { items: string[]; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const idx = items.indexOf(value)
    if (idx >= 0) ref.current.scrollTop = idx * DRUM_ITEM_H
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleScroll = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (!ref.current) return
      const idx = Math.round(ref.current.scrollTop / DRUM_ITEM_H)
      const clamped = Math.max(0, Math.min(items.length - 1, idx))
      ref.current.scrollTop = clamped * DRUM_ITEM_H
      if (items[clamped] !== value) onChange(items[clamped])
    }, 80)
  }

  return (
    <div style={{ position: 'relative', flex: 1 }}>
      {/* Center highlight band */}
      <div style={{ position: 'absolute', top: DRUM_ITEM_H, left: 4, right: 4, height: DRUM_ITEM_H, background: 'var(--color-grape-tint-10)', borderRadius: 10, pointerEvents: 'none', zIndex: 1 }} />
      {/* Fade top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: DRUM_ITEM_H, background: 'linear-gradient(to bottom, var(--color-encore-bg) 30%, transparent)', pointerEvents: 'none', zIndex: 2 }} />
      {/* Fade bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: DRUM_ITEM_H, background: 'linear-gradient(to top, var(--color-encore-bg) 30%, transparent)', pointerEvents: 'none', zIndex: 2 }} />

      <div
        ref={ref}
        onScroll={handleScroll}
        style={{
          height: DRUM_ITEM_H * 3,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          position: 'relative',
          zIndex: 0,
        }}
      >
        <div style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'none' }} />
        {items.map(item => (
          <div
            key={item}
            style={{
              height: DRUM_ITEM_H,
              scrollSnapAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: item === value ? 30 : 22,
              fontWeight: item === value ? 700 : 400,
              color: item === value ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
              transition: 'font-size 0.12s, color 0.12s',
              userSelect: 'none',
            }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'none' }} />
      </div>
    </div>
  )
}

// ─── BrandedTimePicker ───────────────────────────────────────────────────────
const HOURS_LIST   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES_LIST = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

/** 未入力時のスマートデフォルト時刻を返す */
function smartDefaultTime(field: 'opening' | 'start' | 'end', startTime: string, openingTime: string): string {
  // 開場：開演が入力済みなら30分前、なければ現在時刻ベース
  if (field === 'opening' && startTime) {
    const [h, m] = startTime.split(':').map(Number)
    const totalMin = h * 60 + m - 30
    const clampedMin = Math.max(0, totalMin)
    const rh = Math.floor(clampedMin / 60) % 24
    const rm = Math.round((clampedMin % 60) / 5) * 5 % 60
    return `${String(rh).padStart(2,'0')}:${String(rm).padStart(2,'0')}`
  }
  // 終了：開演が入力済みなら2時間後、なければ現在時刻ベース
  if (field === 'end' && startTime) {
    const [h, m] = startTime.split(':').map(Number)
    const totalMin = h * 60 + m + 120
    const rh = Math.floor(totalMin / 60) % 24
    const rm = Math.round((totalMin % 60) / 5) * 5 % 60
    return `${String(rh).padStart(2,'0')}:${String(rm).padStart(2,'0')}`
  }
  // 未入力ならば現在時刻の次のキリの良い時間（5分単位で切り上げ→30分以上余ったら次の時間）
  const now = new Date()
  const totalMin = now.getHours() * 60 + now.getMinutes()
  const rounded = Math.ceil(totalMin / 5) * 5  // 5分単位切り上げ
  // さらに「キリの良い」= 分が0の次の時間（15分以上残っていればそのまま、そうでなければ次の正時）
  const nextHourMin = (Math.floor(totalMin / 60) + 1) * 60
  const nice = rounded % 60 <= 15 ? rounded : nextHourMin
  const rh = Math.floor(nice / 60) % 24
  const rm = nice % 60
  return `${String(rh).padStart(2,'0')}:${String(rm).padStart(2,'0')}`
}

function BrandedTimePicker({ value, label, onChange, onClose }: {
  value: string
  label: string
  onChange: (v: string) => void
  onClose: () => void
}) {
  const [h, setH] = useState(value ? value.split(':')[0].padStart(2,'0') : '00')
  const [m, setM] = useState(() => {
    const raw = value ? parseInt(value.split(':')[1], 10) : 0
    return String(Math.round(raw / 5) * 5 % 60).padStart(2, '0')
  })
  const [mounted, setMounted] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const handleConfirm = () => { onChange(`${h}:${m}`); onClose() }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: mounted ? 'rgba(0,0,0,0.3)' : 'transparent',
        transition: 'background 0.25s',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-encore-bg)',
          borderRadius: '24px 24px 0 0',
          paddingBottom: 32,
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--color-encore-border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 12px' }}>
          <span style={{ ...ty.caption, color: 'var(--color-encore-text-muted)', flex: 1 }}>{label}</span>
          <button
            onClick={handleConfirm}
            style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 13, fontWeight: 700,
              color: 'var(--color-encore-white)',
              background: 'var(--color-encore-green)',
              border: 'none', cursor: 'pointer',
              padding: '8px 20px', borderRadius: 999,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            確定
          </button>
        </div>

        {/* Drum rolls */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 40px' }}>
          <DrumColumn items={HOURS_LIST} value={h} onChange={setH} />
          <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-encore-green)', padding: '0 6px', flexShrink: 0 }}>:</span>
          <DrumColumn items={MINUTES_LIST} value={m} onChange={setM} />
        </div>
      </div>
    </div>
  )
}

// ─── FlatDateTimeField ────────────────────────────────────────────────────────
function FlatDateTimeField({
  label, dateValue, timeValue, placeholder, onTap, onClear,
}: {
  label: string; dateValue: string; timeValue: string
  placeholder: string; onTap: () => void; onClear: () => void
}) {
  const hasValue = !!dateValue
  const displayDate = dateValue ? dateValue.replace(/-/g, '/') : ''
  const displayTime = timeValue || '--:--'
  const display = hasValue ? `${displayDate}　${displayTime}` : ''
  return (
    <FieldWrap label={label} focused={false}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0 8px' }}>
        <button
          onClick={onTap}
          style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            padding: 0, textAlign: 'left',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 15, fontWeight: 400, lineHeight: 1.4,
            color: hasValue ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {display || placeholder}
        </button>
        {hasValue && (
          <button
            onClick={onClear}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 4, display: 'flex', alignItems: 'center',
              color: 'var(--color-encore-text-muted)',
              WebkitTapHighlightColor: 'transparent', flexShrink: 0,
            }}
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>
    </FieldWrap>
  )
}

// ─── DateTimePickerSheet ──────────────────────────────────────────────────────
const DTP_DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function DateTimePickerSheet({
  label, dateValue, timeValue, onConfirm, onClose,
}: {
  label: string; dateValue: string; timeValue: string
  onConfirm: (date: string, time: string) => void; onClose: () => void
}) {
  const initParts = dateValue ? dateValue.split('-').map(Number) : TODAY.split('-').map(Number)
  const [pickerYear, setPickerYear] = useState(initParts[0])
  const [pickerMonth, setPickerMonth] = useState(initParts[1] - 1)
  const [selectedDate, setSelectedDate] = useState(dateValue)
  const [phase, setPhase] = useState<'date' | 'time'>('date')

  const initTime = timeValue || '12:00'
  const [h, setH] = useState(initTime.split(':')[0].padStart(2, '0'))
  const [m, setM] = useState(() => {
    const raw = parseInt(initTime.split(':')[1] || '0', 10)
    return String(Math.round(raw / 5) * 5 % 60).padStart(2, '0')
  })

  const [mounted, setMounted] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setMounted(true)) }, [])

  const daysInMonth = new Date(pickerYear, pickerMonth + 1, 0).getDate()
  const firstDow = new Date(pickerYear, pickerMonth, 1).getDay()
  const calCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const prevMonth = () => {
    if (pickerMonth === 0) { setPickerYear(y => y - 1); setPickerMonth(11) }
    else setPickerMonth(pm => pm - 1)
  }
  const nextMonth = () => {
    if (pickerMonth === 11) { setPickerYear(y => y + 1); setPickerMonth(0) }
    else setPickerMonth(pm => pm + 1)
  }

  const handleDayTap = (day: number) => {
    const mm = String(pickerMonth + 1).padStart(2, '0')
    const dd = String(day).padStart(2, '0')
    setSelectedDate(`${pickerYear}-${mm}-${dd}`)
    setPhase('time')
  }

  const navBtnSt: React.CSSProperties = {
    background: 'transparent', border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-google-sans), sans-serif',
    fontSize: 24, fontWeight: 700, color: 'var(--color-encore-green)',
    padding: '4px 10px', WebkitTapHighlightColor: 'transparent',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: mounted ? 'rgba(0,0,0,0.3)' : 'transparent',
        transition: 'background 0.25s',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-encore-bg)', borderRadius: '24px 24px 0 0', paddingBottom: 32,
          transform: mounted ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.32s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--color-encore-border)' }} />
        </div>

        {phase === 'date' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 8px' }}>
              <span style={{ ...ty.caption, color: 'var(--color-encore-text-muted)', flex: 1 }}>{label} — 日付を選択</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 8px' }}>
              <button onClick={prevMonth} style={navBtnSt}>‹</button>
              <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' }}>
                {pickerYear}年{pickerMonth + 1}月
              </span>
              <button onClick={nextMonth} style={navBtnSt}>›</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 16px', marginBottom: 2 }}>
              {DTP_DOW_LABELS.map((d, i) => (
                <div key={d} style={{
                  textAlign: 'center', padding: '2px 0',
                  fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 11, fontWeight: 700,
                  color: i === 0 ? DOW_SUN_COLOR : i === 6 ? DOW_SAT_COLOR : 'var(--color-encore-text-muted)',
                }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px 0', padding: '0 16px' }}>
              {calCells.map((day, idx) => {
                if (!day) return <div key={`e-${idx}`} />
                const mm = String(pickerMonth + 1).padStart(2, '0')
                const dd = String(day).padStart(2, '0')
                const dateStr = `${pickerYear}-${mm}-${dd}`
                const isSelected = dateStr === selectedDate
                const isToday = dateStr === TODAY
                const dow = (firstDow + (day - 1)) % 7
                return (
                  <button key={day} onClick={() => handleDayTap(day)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 38, borderRadius: 999,
                    background: isSelected ? 'var(--color-encore-green)' : 'transparent',
                    border: isToday && !isSelected ? '1.5px solid var(--color-encore-green)' : 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 13,
                    fontWeight: isSelected ? 700 : 400,
                    color: isSelected ? '#fff' : dow === 0 ? DOW_SUN_COLOR : dow === 6 ? DOW_SAT_COLOR : 'var(--color-encore-green)',
                    WebkitTapHighlightColor: 'transparent', transition: 'background 0.12s',
                  }}>{day}</button>
                )
              })}
            </div>
            <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => selectedDate && onConfirm(selectedDate, '')}
                disabled={!selectedDate}
                style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 400,
                  color: selectedDate ? 'var(--color-encore-text-sub)' : 'var(--color-encore-text-muted)',
                  background: 'transparent', border: 'none',
                  cursor: selectedDate ? 'pointer' : 'default',
                  padding: '8px 0', WebkitTapHighlightColor: 'transparent',
                }}
              >時刻なしで確定</button>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', padding: '4px 20px 12px' }}>
              <button onClick={() => setPhase('date')} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 15, fontWeight: 400,
                color: 'var(--color-encore-green)', padding: '6px 0', marginRight: 10,
                WebkitTapHighlightColor: 'transparent',
              }}>‹ 日付</button>
              <span style={{ ...ty.caption, color: 'var(--color-encore-text-muted)', flex: 1 }}>{label} — 時刻</span>
              <button onClick={() => onConfirm(selectedDate, `${h}:${m}`)} style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 13, fontWeight: 700,
                color: 'var(--color-encore-white)', background: 'var(--color-encore-green)',
                border: 'none', cursor: 'pointer', padding: '8px 20px', borderRadius: 999,
                WebkitTapHighlightColor: 'transparent',
              }}>確定</button>
            </div>
            <div style={{ textAlign: 'center', paddingBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 13, fontWeight: 700, color: 'var(--color-encore-green)' }}>
                {selectedDate.replace(/-/g, '/')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 40px' }}>
              <DrumColumn items={HOURS_LIST} value={h} onChange={setH} />
              <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-encore-green)', padding: '0 6px', flexShrink: 0 }}>:</span>
              <DrumColumn items={MINUTES_LIST} value={m} onChange={setM} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── TripleTimePicker (開場 → 開演 ─ 終了) ────────────────────────────────────
function TripleTimePicker({
  openingTime,
  startTime,
  endTime,
  onOpeningChange,
  onStartChange,
  onEndChange,
  onPickerOpen,
  activeField,
}: {
  openingTime: string
  startTime: string
  endTime: string
  onOpeningChange: (v: string) => void
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  onPickerOpen: (field: 'opening'|'start'|'end') => void
  activeField: 'opening'|'start'|'end'|null
}) {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const diffMin = eh * 60 + em - (sh * 60 + sm)
  const durationLabel =
    diffMin > 0
      ? diffMin >= 60
        ? `${Math.floor(diffMin / 60)}時間${diffMin % 60 > 0 ? `${diffMin % 60}分` : ''}`
        : `${diffMin}分`
      : null

  const TimeChip = ({ label, value, fieldKey }: { label: string; value: string; fieldKey: 'opening'|'start'|'end' }) => {
    const isActive = activeField === fieldKey
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <FieldWrap label={label} focused={isActive}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => onPickerOpen(fieldKey)}
              style={{
                ...flatInputStyle,
                flex: 1,
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                background: 'transparent',
                padding: '4px 0 8px',
                letterSpacing: '0.02em',
                color: value ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {value || '--:--'}
            </button>
            <button
              tabIndex={-1}
              onClick={() => onPickerOpen(fieldKey)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '0 0 8px', display: 'flex', alignItems: 'center',
                color: isActive ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent', flexShrink: 0,
              }}
            >
              <Clock size={15} weight="light" />
            </button>
          </div>
        </FieldWrap>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <TimeChip label="開場" value={openingTime} fieldKey="opening" />

      <span style={{ paddingBottom: 12, flexShrink: 0, fontSize: 13, color: 'var(--color-encore-text-muted)', lineHeight: 1 }}>→</span>

      <TimeChip label="開演" value={startTime} fieldKey="start" />

      {/* duration separator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 10, flexShrink: 0 }}>
        <div style={{ width: 14, height: 1, background: 'var(--color-encore-border)' }} />
        {durationLabel && (
          <span style={{ ...ty.caption, fontSize: 9, color: 'var(--color-encore-text-sub)', whiteSpace: 'nowrap', marginTop: 3 }}>
            {durationLabel}
          </span>
        )}
      </div>

      <TimeChip label="終了" value={endTime} fieldKey="end" />
    </div>
  )
}

// ─── LiveType chips ─────────────────────────────────────────────────────────
const LIVE_TYPES: LiveTypeGrape[] = ['ワンマン', '対バン', 'フェス', '配信', '舞台・公演', 'メディア出演', 'リリースイベント', 'その他']

function LiveTypeToggle({ value, onChange }: { value: LiveTypeGrape | null; onChange: (v: LiveTypeGrape | null) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {LIVE_TYPES.map((t) => {
        const isActive = value === t
        return (
          <button
            key={t}
            onClick={() => onChange(isActive ? null : t)}
            style={{
              height: 28,
              padding: '0 10px',
              borderRadius: 999,
              border: `1.5px solid ${isActive ? 'var(--color-encore-green)' : 'var(--color-encore-border)'}`,
              background: isActive ? 'var(--color-encore-green)' : 'transparent',
              color: isActive ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
              cursor: 'pointer',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 11,
              fontWeight: 700,
              whiteSpace: 'nowrap',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.15s',
            }}
          >
            {t}
          </button>
        )
      })}
    </div>
  )
}

// ─── Ticket status options ────────────────────────────────────────────────────
const TICKET_STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'before-sale',  label: '発売前' },
  { value: 'waiting',      label: '結果待ち' },
  { value: 'payment-due',  label: '入金待ち' },
  { value: 'pay-at-door',  label: '当日支払い' },
  { value: 'paid',         label: '支払い済み' },
  { value: 'issued',       label: '発券済み' },
  { value: 'done',         label: '完了' },
]

// ─── Textarea wrapper (下線スタイル) ─────────────────────────────────────────
function FlatTextarea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [focused, setFocused] = useState(false)
  return (
    <FieldWrap label={label} focused={focused}>
      <textarea
        className="grape-soft-placeholder"
        style={{
          ...flatInputStyle,
          height: 80,
          resize: 'none',
          lineHeight: 1.6,
          paddingTop: 6,
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
      />
    </FieldWrap>
  )
}

// ─── ConfirmDiscardDialog ──────────────────────────────────────────────────────
function ConfirmDiscardDialog({ onDiscard, onCancel }: { onDiscard: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 700,
      display: 'flex', alignItems: 'flex-end',
      background: 'rgba(0,0,0,0.45)',
    }}>
      <div style={{
        width: '100%',
        background: 'var(--color-encore-bg)',
        borderRadius: '24px 24px 0 0',
        padding: '28px 20px 40px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <span style={{ ...ty.heading, fontSize: 16, display: 'block' }}>編集内容を破棄しますか？</span>
          <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', display: 'block', marginTop: 6 }}>
            加えた変更はすべて失われます
          </span>
        </div>
        <button
          onClick={onDiscard}
          style={{
            height: 46, borderRadius: 999, border: 'none',
            background: '#FF3B30', color: '#fff',
            cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          破棄する
        </button>
        <button
          onClick={onCancel}
          style={{
            height: 46, borderRadius: 999,
            border: '1.5px solid var(--color-encore-green)',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 14, fontWeight: 700,
            color: 'var(--color-encore-green)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          編集を続ける
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuickEventSheet({ date, startMin, endMin, live, artists: propArtists = [], onAddArtist: propOnAddArtist, onClose, onSave, openSection, onShowPremium, allLives = [], smartDefaults, recentVenues = [] }: QuickEventSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const isEditMode = !!live
  const isPremium  = useIsPremium()
  const showUpsellBanner = !isEditMode && !isPremium && !!onShowPremium
  const scrollableRef = React.useRef<HTMLDivElement>(null)
  const ticketSectionRef = React.useRef<HTMLDivElement>(null)

  const fmtMinToHHMM = (m: number) => {
    const clamped = Math.max(0, Math.min(23 * 60 + 59, m))
    const hh = String(Math.floor(clamped / 60)).padStart(2, '0')
    const mm = String(clamped % 60).padStart(2, '0')
    return `${hh}:${mm}`
  }
  const defaultStart = live?.startTime ?? (startMin != null ? fmtMinToHHMM(startMin) : '18:00')
  const defaultEnd   = live?.endTime   ?? (
    endMin != null   ? fmtMinToHHMM(endMin)
    : startMin != null ? fmtMinToHHMM(startMin + 60)
    : '20:00'
  )

  const [title, setTitle]         = useState(live?.title ?? '')
  const [artistIds, setArtistIds] = useState<string[]>(() => {
    if (live?.artists && live.artists.length > 0) {
      return live.artists.map(name => propArtists.find(a => a.name === name)?.id ?? name).filter(Boolean)
    }
    if (live) return [propArtists.find((a) => a.name === live.artist)?.id ?? propArtists[0]?.id ?? '']
    return [propArtists[0]?.id ?? '']
  })
  const [liveDate, setLiveDate]       = useState(live?.date ?? date ?? '')
  const [openingTime, setOpeningTime] = useState(live?.openingTime ?? '')
  const [startTime, setStartTime]     = useState(defaultStart)
  const [endTime, setEndTime]         = useState(defaultEnd)
  // スマートデフォルト: 新規作成 & 既存 live/prefill が無いときのみ適用
  // 会場は自動入力しない（複数推し活では毎回変わるため、代わりにフォーカス時サジェスト）
  const isCreating = !live
  const sdLiveType = isCreating ? (smartDefaults?.liveType ?? null) : null
  const [venue, setVenue]         = useState(live?.venue ?? '')
  const [liveType, setLiveType]   = useState<LiveTypeGrape | null>(live?.liveType ?? sdLiveType)
  const [venueFocused, setVenueFocused] = useState(false)
  const [status, setStatus]       = useState<AttendanceStatus>(live?.attendanceStatus ?? 'candidate')

  const [price, setPrice]                       = useState<string>(live?.price != null ? String(live.price) : '')
  const [drink1Sep, setDrink1Sep]               = useState<boolean>(live?.drink1Separate ?? false)
  const [ticketStatus, setTicketStatus]         = useState<TicketStatus | ''>(live?.ticketStatus ?? '')
  const [salePhase, setSalePhase]               = useState(live?.salePhase ?? '')
  const [ticketDeadline, setTicketDeadline]     = useState(live?.ticketDeadline ?? '')
  const [announcementDate, setAnnouncementDate] = useState(live?.announcementDate ?? '')
  const [announcementTime, setAnnouncementTime] = useState(live?.announcementTime ?? '')
  const [saleStartDate, setSaleStartDate]       = useState(live?.saleStartDate ?? '')
  const [saleStartTime, setSaleStartTime]       = useState(live?.saleStartTime ?? '')
  const [showDateTimePicker, setShowDateTimePicker] = useState<'announcement' | 'saleStart' | null>(null)
  const [ticketUrl, setTicketUrl]               = useState(live?.ticketUrl ?? '')
  const [memo, setMemo]                     = useState(live?.memo ?? '')
  const [transportMemo, setTransportMemo]   = useState('')
  const [accommodationMemo, setAccommodationMemo] = useState('')
  const [coverImage, setCoverImage]             = useState(live?.coverImage ?? '')
  const [coverImagePosition, setCoverImagePosition] = useState(live?.coverImagePosition ?? '50% 50%')
  const [images, setImages]                     = useState<string[]>(live?.images ?? [])
  const [eventColor, setEventColor]             = useState<ColorValue>(live?.color ?? null)
  const [showColorPicker, setShowColorPicker]   = useState(false)
  const [showNewArtist, setShowNewArtist]        = useState(false)
  const [activeTimePicker, setActiveTimePicker]  = useState<'opening'|'start'|'end'|null>(null)
  const { show: showToast } = useGrapeToast()

  const showArtistToast = (name: string) => {
    showToast(`${name} を登録しました`)
  }

  // 初期値を記録して変更検知に使う
  const initialRef = useRef({
    title:              live?.title ?? '',
    artistIds:          live?.artists
                          ? live.artists.map(n => propArtists.find(a => a.name === n)?.id ?? n)
                          : [propArtists.find((a) => a.name === live?.artist)?.id ?? propArtists[0]?.id ?? ''],
    liveDate:           live?.date ?? date ?? '',
    openingTime:        live?.openingTime ?? '',
    startTime:          defaultStart,
    endTime:            defaultEnd,
    venue:              live?.venue ?? '',
    liveType:           live?.liveType ?? sdLiveType,
    status:             (live?.attendanceStatus ?? 'candidate') as AttendanceStatus,
    ticketStatus:       live?.ticketStatus ?? '' as TicketStatus | '',
    salePhase:          live?.salePhase ?? '',
    ticketDeadline:     live?.ticketDeadline ?? '',
    announcementDate:   live?.announcementDate ?? '',
    announcementTime:   live?.announcementTime ?? '',
    saleStartDate:      live?.saleStartDate ?? '',
    saleStartTime:      live?.saleStartTime ?? '',
    ticketUrl:          live?.ticketUrl ?? '',
    memo:               live?.memo ?? '',
    coverImage:         live?.coverImage ?? '',
    transportMemo:      '',
    accommodationMemo:  '',
    eventColor:         live?.color ?? null as ColorValue,
  })

  const isDirty = (
    title             !== initialRef.current.title             ||
    artistIds.join(',') !== initialRef.current.artistIds.join(',') ||
    liveDate          !== initialRef.current.liveDate          ||
    openingTime       !== initialRef.current.openingTime       ||
    startTime         !== initialRef.current.startTime         ||
    endTime           !== initialRef.current.endTime           ||
    venue             !== initialRef.current.venue             ||
    liveType          !== initialRef.current.liveType          ||
    status            !== initialRef.current.status            ||
    ticketStatus      !== initialRef.current.ticketStatus      ||
    salePhase         !== initialRef.current.salePhase         ||
    ticketDeadline    !== initialRef.current.ticketDeadline    ||
    announcementDate  !== initialRef.current.announcementDate  ||
    announcementTime  !== initialRef.current.announcementTime  ||
    saleStartDate     !== initialRef.current.saleStartDate     ||
    saleStartTime     !== initialRef.current.saleStartTime     ||
    ticketUrl         !== initialRef.current.ticketUrl         ||
    memo              !== initialRef.current.memo              ||
    coverImage        !== initialRef.current.coverImage        ||
    transportMemo     !== initialRef.current.transportMemo     ||
    accommodationMemo !== initialRef.current.accommodationMemo ||
    eventColor        !== initialRef.current.eventColor        ||
    false
  )

  const handleCancel = () => {
    if (isDirty) {
      setShowConfirm(true)
    } else {
      onClose()
    }
  }

  // ─── 下書き自動保存（新規作成時のみ） ────────────────────────────────
  const DRAFT_KEY = 'grape-event-draft-v1'
  const [restoredDraft, setRestoredDraft] = useState<Record<string, unknown> | null>(null)
  const [draftRestoredBanner, setDraftRestoredBanner] = useState(false)

  // マウント時: 新規作成なら下書きをチェック（復元確認を出す）
  useEffect(() => {
    if (isEditMode) return
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) return
      const draft = JSON.parse(raw) as Record<string, unknown>
      // substantive な下書きのみ表示（空に近いデータは無視）
      const hasContent = !!(draft.title || draft.venue || draft.memo ||
        (Array.isArray(draft.artistIds) && draft.artistIds.length > 0 && draft.artistIds[0]))
      if (hasContent) setRestoredDraft(draft)
      else localStorage.removeItem(DRAFT_KEY)
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // dirty になるたび debounce で下書き保存（新規作成時のみ）
  useEffect(() => {
    if (isEditMode) return
    if (!isDirty) return
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({
          title, artistIds, liveDate, openingTime, startTime, endTime,
          venue, liveType, status,
          price, drink1Sep, ticketStatus, salePhase,
          ticketDeadline, announcementDate, announcementTime,
          saleStartDate, saleStartTime, ticketUrl,
          memo, transportMemo, accommodationMemo,
          coverImage, coverImagePosition, images, eventColor,
          savedAt: Date.now(),
        }))
      } catch {}
    }, 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    title, artistIds, liveDate, openingTime, startTime, endTime,
    venue, liveType, status,
    price, drink1Sep, ticketStatus, salePhase,
    ticketDeadline, announcementDate, announcementTime,
    saleStartDate, saleStartTime, ticketUrl,
    memo, coverImage, isDirty, isEditMode,
  ])

  const applyDraft = (draft: Record<string, unknown>) => {
    const s = (v: unknown) => (typeof v === 'string' ? v : '')
    setTitle(s(draft.title))
    if (Array.isArray(draft.artistIds)) setArtistIds(draft.artistIds as string[])
    if (draft.liveDate) setLiveDate(s(draft.liveDate))
    setOpeningTime(s(draft.openingTime))
    if (draft.startTime) setStartTime(s(draft.startTime))
    if (draft.endTime) setEndTime(s(draft.endTime))
    setVenue(s(draft.venue))
    if (draft.liveType) setLiveType(draft.liveType as LiveTypeGrape)
    if (draft.status) setStatus(draft.status as AttendanceStatus)
    setPrice(s(draft.price))
    setDrink1Sep(!!draft.drink1Sep)
    if (draft.ticketStatus !== undefined) setTicketStatus(draft.ticketStatus as TicketStatus | '')
    setSalePhase(s(draft.salePhase))
    setTicketDeadline(s(draft.ticketDeadline))
    setAnnouncementDate(s(draft.announcementDate))
    setAnnouncementTime(s(draft.announcementTime))
    setSaleStartDate(s(draft.saleStartDate))
    setSaleStartTime(s(draft.saleStartTime))
    setTicketUrl(s(draft.ticketUrl))
    setMemo(s(draft.memo))
    setTransportMemo(s(draft.transportMemo))
    setAccommodationMemo(s(draft.accommodationMemo))
    if (draft.coverImage) setCoverImage(s(draft.coverImage))
    if (draft.coverImagePosition) setCoverImagePosition(s(draft.coverImagePosition))
    if (Array.isArray(draft.images)) setImages(draft.images as string[])
    if (draft.eventColor !== undefined) setEventColor(draft.eventColor as ColorValue)
    setRestoredDraft(null)
    setDraftRestoredBanner(true)
    setTimeout(() => setDraftRestoredBanner(false), 3000)
  }

  const discardDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    setRestoredDraft(null)
  }

  useEffect(() => {
    setIsOpen(true)
    requestAnimationFrame(() => setMounted(true))
    return () => { setMounted(false); setIsOpen(false) }
  }, [])

  // openSection='ticket' のとき、アニメーション完了後にチケットセクションまでスクロール
  useEffect(() => {
    if (openSection !== 'ticket') return
    const timer = setTimeout(() => {
      const scrollEl = scrollableRef.current
      const ticketEl = ticketSectionRef.current
      if (scrollEl && ticketEl) {
        scrollEl.scrollTo({ top: ticketEl.offsetTop - 16, behavior: 'smooth' })
      }
    }, 420)
    return () => clearTimeout(timer)
  }, [openSection])

  const handleSave = () => {
    const selectedArtistObjs = artistIds.map(id => propArtists.find(a => a.id === id)).filter(Boolean) as GrapeArtist[]
    const mainArtist = selectedArtistObjs[0]
    const payload: Partial<GrapeLive> = {
      title,
      artist: mainArtist?.name ?? artistIds[0],
      artistImage: mainArtist?.image,
      artists: selectedArtistObjs.length > 1 ? selectedArtistObjs.map(a => a.name) : undefined,
      artistImages: selectedArtistObjs.length > 1 ? selectedArtistObjs.map(a => a.image).filter(Boolean) as string[] : undefined,
      date: liveDate,
      openingTime: openingTime || undefined,
      startTime,
      endTime,
      venue,
      liveType: liveType ?? undefined,
      attendanceStatus: status,
      ticketStatus: ticketStatus || undefined,
      ticketDeadline: ticketStatus === 'payment-due' ? (ticketDeadline || undefined) : undefined,
      announcementDate: ticketStatus === 'waiting' ? (announcementDate || undefined) : undefined,
      announcementTime: ticketStatus === 'waiting' ? (announcementTime || undefined) : undefined,
      saleStartDate: ticketStatus === 'before-sale' ? (saleStartDate || undefined) : undefined,
      saleStartTime: ticketStatus === 'before-sale' ? (saleStartTime || undefined) : undefined,
      ticketUrl: ticketUrl || undefined,
      salePhase: salePhase || undefined,
      price: price !== '' ? Number(price) : undefined,
      drink1Separate: drink1Sep || undefined,
      memo: memo || undefined,
      coverImage: coverImage || undefined,
      coverImagePosition: coverImagePosition !== '50% 50%' ? coverImagePosition : undefined,
      images: images.length > 0 ? images : undefined,
      color: eventColor ?? undefined,
    }
    // 保存成功したら下書きをクリア
    try { localStorage.removeItem(DRAFT_KEY) } catch {}
    onSave?.(payload)
    onClose()
    // トースト通知: 新規作成 or 編集
    showToast(isEditMode ? 'イベントを更新しました' : 'イベントを保存しました')
  }

  const ticketBadge = ticketStatus ? TICKET_STATUS_LABEL[ticketStatus as keyof typeof TICKET_STATUS_LABEL] : undefined

  return (
    <>
      {/* Panel — full screen */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 301,
          background: 'var(--color-encore-bg)',
          transform: isOpen && mounted ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ナビバー風ヘッダー（iOS ノッチに キャンセル/保存 が重ならないよう safe-area 加算） */}
        <div style={{
          padding: 'calc(env(safe-area-inset-top) + 14px) 16px 10px',
          borderBottom: '1px solid var(--color-encore-border-light)',
          flexShrink: 0,
        }}>
          {/* Row 1: キャンセル + 保存 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <button
              onClick={handleCancel}
              style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 14,
                fontWeight: 400,
                color: 'var(--color-encore-text-sub)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--color-encore-white)',
                background: 'var(--color-encore-green)',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 20px',
                borderRadius: 999,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              保存
            </button>
          </div>
          {/* Row 2: タイトル */}
          <div style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--color-encore-green)',
            lineHeight: 1.2,
          }}>
            {isEditMode ? 'イベントを編集' : 'イベントを追加'}
          </div>

          {/* Row 3: ステータスチップ列（参戦ステータス + チケットバッジ） */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 10, flexWrap: 'wrap',
          }}>
            {/* 参戦ステータス4択（セグメント風） */}
            {ATTENDANCE_STATUS_OPTIONS.map(opt => {
              const active = status === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setStatus(opt.value)}
                  style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '5px 11px',
                    borderRadius: 999,
                    border: active ? 'none' : '1px solid var(--color-encore-border-light)',
                    background: active ? 'var(--color-encore-green)' : 'transparent',
                    color: active ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {opt.label}
                </button>
              )
            })}
            {/* チケットステータスバッジ（設定済みのときのみ） */}
            {ticketBadge && (
              <button
                onClick={() => {
                  // チケットセクションへスクロール
                  ticketSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '5px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(192, 138, 74, 0.32)',
                  background: 'rgba(192, 138, 74, 0.12)',
                  color: 'var(--color-encore-amber)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 256 256" fill="none">
                  <path d="M96 72V184" stroke="currentColor" strokeWidth="20" strokeLinecap="round" />
                  <path d="M224 152V104C224 95.16 216.84 88 208 88C199.16 88 192 80.84 192 72V64C192 55.16 184.84 48 176 48H32C23.16 48 16 55.16 16 64V72C16 80.84 8.84 88 0 88" stroke="currentColor" strokeWidth="0" fill="none" />
                  <path d="M32 56H224C228.4 56 232 59.6 232 64V96C223.2 96 216 103.2 216 112V144C216 152.8 223.2 160 232 160V192C232 196.4 228.4 200 224 200H32C27.6 200 24 196.4 24 192V160C32.8 160 40 152.8 40 144V112C40 103.2 32.8 96 24 96V64C24 59.6 27.6 56 32 56Z" stroke="currentColor" strokeWidth="16" fill="none" strokeLinejoin="round" />
                </svg>
                {ticketBadge}
              </button>
            )}
          </div>
        </div>

        {/* Scrollable form */}
        <div ref={scrollableRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 下書き復元プロンプト（新規作成で前回保存されている場合） */}
          {restoredDraft && (() => {
            const savedAt = typeof restoredDraft.savedAt === 'number' ? new Date(restoredDraft.savedAt) : null
            const when = savedAt
              ? `${savedAt.getMonth() + 1}/${savedAt.getDate()} ${String(savedAt.getHours()).padStart(2, '0')}:${String(savedAt.getMinutes()).padStart(2, '0')}`
              : ''
            const preview = [restoredDraft.title, restoredDraft.venue].filter(Boolean).join(' · ')
            return (
              <div style={{
                background: 'var(--color-encore-bg-section)',
                border: '1px solid var(--color-encore-border-light)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 700,
                    color: 'var(--color-encore-green)',
                    marginBottom: preview ? 2 : 0,
                  }}>
                    前回の下書きがあります{when ? ` · ${when}` : ''}
                  </div>
                  {preview && (
                    <div style={{
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 11, fontWeight: 400,
                      color: 'var(--color-encore-text-sub)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {String(preview)}
                    </div>
                  )}
                </div>
                <button
                  onClick={discardDraft}
                  style={{
                    padding: '6px 12px', borderRadius: 999,
                    background: 'transparent', border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 400,
                    color: 'var(--color-encore-text-sub)',
                    WebkitTapHighlightColor: 'transparent',
                    flexShrink: 0,
                  }}
                >
                  破棄
                </button>
                <button
                  onClick={() => applyDraft(restoredDraft)}
                  style={{
                    padding: '6px 14px', borderRadius: 999,
                    background: 'var(--color-encore-green)',
                    color: 'var(--color-encore-white)',
                    border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 700,
                    WebkitTapHighlightColor: 'transparent',
                    flexShrink: 0,
                  }}
                >
                  復元
                </button>
              </div>
            )
          })()}

          {/* 復元完了トースト */}
          {draftRestoredBanner && (
            <div style={{
              background: 'rgba(26,58,45,0.08)',
              border: '1px solid rgba(26,58,45,0.18)',
              borderRadius: 10,
              padding: '8px 12px',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 11, fontWeight: 700,
              color: 'var(--color-encore-green)',
              textAlign: 'center',
            }}>
              ✓ 下書きを復元しました
            </div>
          )}

          {/* 同日重複警告（日付 + 時間帯が他のライブと被っている場合） */}
          {(() => {
            if (!liveDate) return null
            const parseMin = (t: string | undefined): number | null => {
              if (!t) return null
              const [h, m] = t.split(':').map(Number)
              if (Number.isNaN(h) || Number.isNaN(m)) return null
              return h * 60 + m
            }
            const newStart = parseMin(startTime)
            const newEnd   = parseMin(endTime) ?? (newStart != null ? newStart + 60 : null)
            if (newStart == null || newEnd == null) return null
            const conflicts = allLives.filter(l => {
              if (l.id === live?.id) return false // 自分自身は除外
              if (l.date !== liveDate) return false
              const s = parseMin(l.startTime) ?? 0
              const e = parseMin(l.endTime) ?? s + 60
              return s < newEnd && e > newStart
            })
            if (conflicts.length === 0) return null
            return (
              <div style={{
                background: 'rgba(219, 96, 80, 0.08)',
                border: '1px solid rgba(219, 96, 80, 0.28)',
                borderRadius: 10,
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 256 256" fill="var(--color-encore-error)">
                    <path d="M236.8 188.09 149.35 36.22a24.76 24.76 0 0 0-42.7 0L19.2 188.09a23.51 23.51 0 0 0 0 23.72A24.35 24.35 0 0 0 40.55 224h174.9a24.35 24.35 0 0 0 21.33-12.19 23.51 23.51 0 0 0 .02-23.72M120 104a8 8 0 0 1 16 0v40a8 8 0 0 1-16 0Zm8 88a12 12 0 1 1 12-12 12 12 0 0 1-12 12" />
                  </svg>
                  <span style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 700,
                    color: 'var(--color-encore-error)',
                    flex: 1, minWidth: 0,
                  }}>
                    同じ時間帯に {conflicts.length} 件のイベント
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 22 }}>
                  {conflicts.slice(0, 3).map(l => (
                    <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span style={{
                        fontFamily: 'var(--font-google-sans), sans-serif',
                        fontSize: 11, fontWeight: 700,
                        color: 'var(--color-encore-error)',
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                      }}>
                        {l.startTime}{l.endTime ? `〜${l.endTime}` : ''}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        fontSize: 11, fontWeight: 400,
                        color: 'var(--color-encore-text-sub)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {l.title}
                      </span>
                    </div>
                  ))}
                  {conflicts.length > 3 && (
                    <span style={{
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 11, fontWeight: 400,
                      color: 'var(--color-encore-text-muted)',
                    }}>
                      …他 {conflicts.length - 3} 件
                    </span>
                  )}
                </div>
              </div>
            )
          })()}

          {/* イベント名 */}
          <BigTitleInput value={title} onChange={setTitle} />

          {/* アーティスト */}
          <div>
            <span style={{ ...ty.caption, display: 'block', marginBottom: 10, color: 'var(--color-encore-text-muted)' }}>
              アーティスト{artistIds.length > 1 && <span style={{ marginLeft: 6, color: 'var(--color-encore-green)', fontWeight: 700 }}>{artistIds.length}組</span>}
            </span>
            <ArtistSelect
              value={artistIds}
              onChange={setArtistIds}
              artists={propArtists}
              onAddArtist={() => setShowNewArtist(true)}
            />
          </div>

          {/* 日付 */}
          <BigDateField value={liveDate} onChange={setLiveDate} />

          {/* 開場 / 開演 / 終了 */}
          <TripleTimePicker
            openingTime={openingTime}
            startTime={startTime}
            endTime={endTime}
            onOpeningChange={setOpeningTime}
            onStartChange={setStartTime}
            onEndChange={setEndTime}
            onPickerOpen={setActiveTimePicker}
            activeField={activeTimePicker}
          />

          {/* 会場 */}
          <div>
            <FlatInput
              label="会場"
              value={venue}
              onChange={setVenue}
              placeholder="会場名を入力"
              onFocusChange={setVenueFocused}
            />
            {/* 会場サジェスト（直近の会場・入力中テキストでフィルタ） */}
            {(() => {
              if (!venueFocused) return null
              if (recentVenues.length === 0) return null
              const filtered = venue.trim().length === 0
                ? recentVenues
                : recentVenues.filter(v => v.toLowerCase().includes(venue.trim().toLowerCase()) && v !== venue)
              if (filtered.length === 0) return null
              return (
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  marginTop: 8,
                }}>
                  {filtered.slice(0, 5).map(v => (
                    <button
                      key={v}
                      // onMouseDown でフォーカスが外れる前に処理（onClick だと blur が先に走って閉じる）
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setVenue(v)
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault()
                        setVenue(v)
                      }}
                      style={{
                        padding: '5px 12px', borderRadius: 999, border: 'none',
                        background: 'var(--color-encore-bg-section)',
                        color: 'var(--color-encore-green)',
                        fontSize: 12, fontWeight: 400,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        WebkitTapHighlightColor: 'transparent',
                        maxWidth: 240,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* 種別 */}
          <div>
            <span style={{ ...ty.caption, display: 'block', marginBottom: 8, color: 'var(--color-encore-text-muted)' }}>種別</span>
            <LiveTypeToggle value={liveType} onChange={setLiveType} />
          </div>

          {/* 参戦ステータスはヘッダのチップで操作（重複排除） */}

          {/* イベントの色 */}
          <div>
            <button
              onClick={() => setShowColorPicker(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '10px 0', width: '100%',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Palette size={16} weight="regular" color="var(--color-encore-green)" />
              <span style={{ ...ty.body, fontSize: 15, flex: 1, textAlign: 'left' }}>
                イベントの色
              </span>
              {/* 現在色チップ */}
              <div style={{
                width: 20, height: 20, borderRadius: 5,
                background: eventColor ?? DEFAULT_EVENT_COLOR_VISUAL,
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.12)',
                flexShrink: 0,
              }} />
              {showColorPicker
                ? <CaretUp size={12} weight="bold" color="var(--color-encore-text-muted)" />
                : <CaretDown size={12} weight="bold" color="var(--color-encore-text-muted)" />
              }
            </button>
            {showColorPicker && (
              <div style={{ paddingBottom: 10 }}>
                <ColorPicker
                  value={eventColor}
                  onChange={(c) => { setEventColor(c); setShowColorPicker(false) }}
                  showDefault={true}
                />
              </div>
            )}
          </div>

          {/* ─── 折りたたみセクション ─── */}

          {/* カバーアート */}
          <FormSection icon={<Camera size={16} weight="regular" />} label="カバーアート">
            <CoverArtEditor
              coverImage={coverImage}
              position={coverImagePosition}
              availableImages={images}
              onImageChange={setCoverImage}
              onPositionChange={setCoverImagePosition}
              onRemove={() => { setCoverImage(''); setCoverImagePosition('50% 50%') }}
            />
          </FormSection>

          {/* チケット */}
          <div ref={ticketSectionRef}>
            <FormSection icon={<TicketIcon />} label="チケット" badge={ticketBadge} defaultOpen={openSection === 'ticket' || !!ticketStatus}>
            {/* 販売フェーズ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <FlatInput label="販売フェーズ" value={salePhase} onChange={setSalePhase} placeholder="例: FC先行 / 一般発売" />
              {/* Suggestion chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['FC先行', 'オフィシャル先行', '一般先行', '一般発売', '先着順'].map(phase => (
                  <button
                    key={phase}
                    onClick={() => setSalePhase(phase)}
                    style={{
                      padding: '4px 10px', borderRadius: 999, border: 'none',
                      background: salePhase === phase ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
                      color: salePhase === phase ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    {phase}
                  </button>
                ))}
              </div>
            </div>
            <EncoreSelect<TicketStatus>
              label="チケット状態"
              value={ticketStatus as TicketStatus | ''}
              onChange={setTicketStatus}
              options={TICKET_STATUS_OPTIONS}
              placeholder="-- 未設定 --"
            />
            {ticketStatus === 'payment-due' && (
              <FlatInput label="入金期限" type="date" value={ticketDeadline} onChange={setTicketDeadline} />
            )}
            {ticketStatus === 'before-sale' && (
              <FlatDateTimeField
                label="発売開始日時"
                dateValue={saleStartDate}
                timeValue={saleStartTime}
                placeholder="日付を選択"
                onTap={() => setShowDateTimePicker('saleStart')}
                onClear={() => { setSaleStartDate(''); setSaleStartTime('') }}
              />
            )}
            {ticketStatus === 'waiting' && (
              <FlatDateTimeField
                label="抽選結果日時"
                dateValue={announcementDate}
                timeValue={announcementTime}
                placeholder="日付を選択"
                onTap={() => setShowDateTimePicker('announcement')}
                onClear={() => { setAnnouncementDate(''); setAnnouncementTime('') }}
              />
            )}
            <div style={{ position: 'relative' }}>
              <FieldWrap label="チケット価格（円）" focused={false}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <span style={{ ...flatInputStyle, width: 'auto', paddingRight: 4, color: 'var(--color-encore-text-sub)' }}>¥</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      style={{ ...flatInputStyle, flex: 1, MozAppearance: 'textfield' } as React.CSSProperties}
                      value={price}
                      onChange={(e) => setPrice(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="0"
                    />
                  </div>
                  {/* 1 Drink別途 トグルバッジ */}
                  <button
                    type="button"
                    onClick={() => setDrink1Sep(v => !v)}
                    style={{
                      flexShrink: 0,
                      height: 26,
                      paddingLeft: 10,
                      paddingRight: 10,
                      borderRadius: 13,
                      border: drink1Sep
                        ? '1.5px solid var(--color-encore-green)'
                        : '1.5px solid var(--color-encore-border-light)',
                      background: drink1Sep ? 'var(--color-grape-tint-06)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 11,
                      fontWeight: drink1Sep ? 700 : 400,
                      color: drink1Sep ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
                      WebkitTapHighlightColor: 'transparent',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {drink1Sep && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="var(--color-encore-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    1 Drink別途
                  </button>
                </div>
              </FieldWrap>
            </div>
            <div style={{ position: 'relative' }}>
              <FieldWrap label="チケットURL" focused={false}>
                <input
                  type="url"
                  className="grape-soft-placeholder"
                  style={flatInputStyle}
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="https://..."
                />
              </FieldWrap>
            </div>
            </FormSection>
          </div>

          {/* メモ */}
          <FormSection icon={<Note size={16} weight="regular" />} label="メモ">
            <FlatTextarea label="メモ" value={memo} onChange={setMemo} placeholder="自由にメモを書いておこう" />
          </FormSection>

          {/* 交通 / 宿メモ */}
          <FormSection icon={<Car size={16} weight="regular" />} label="交通 / 宿メモ">
            <FlatTextarea label="交通メモ" value={transportMemo} onChange={setTransportMemo} placeholder="新幹線・バスなど" />
            <FlatTextarea label="宿泊メモ" value={accommodationMemo} onChange={setAccommodationMemo} placeholder="ホテル名・チェックイン日など" />
          </FormSection>

          {/* 画像 */}
          <FormSection icon={<Images size={16} weight="regular" />} label="画像" badge={images.length > 0 ? String(images.length) : undefined}>
            <ImageUploadGrid images={images} onChange={setImages} />
          </FormSection>

          {/* Premium 訴求バナー（Freeユーザの新規作成時のみ・最下部） */}
          {showUpsellBanner && (
            <button
              onClick={onShowPremium}
              style={{
                background: 'rgba(192, 138, 74, 0.10)',
                border: '1px solid rgba(192, 138, 74, 0.28)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                marginTop: 4,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: 'rgba(192, 138, 74, 0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <SparkleIcon size={14} weight="fill" color="var(--color-encore-amber)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: 'var(--color-encore-green)',
                  lineHeight: 1.4,
                }}>
                  URLから自動取り込みがPremiumで使えます
                </div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 10, fontWeight: 400,
                  color: 'var(--color-encore-text-sub)',
                  marginTop: 1,
                }}>
                  公式サイトのURLから日時・会場・出演者を一括入力
                </div>
              </div>
              <span style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 16, fontWeight: 400,
                color: 'var(--color-encore-amber)',
              }}>›</span>
            </button>
          )}

          <div style={{ height: 36 }} />
        </div>
      </div>

      {/* 時刻ドラムピッカー — パネル全体を覆う */}
      {showDateTimePicker && (
        <DateTimePickerSheet
          key={showDateTimePicker}
          label={showDateTimePicker === 'announcement' ? '抽選結果日時' : '発売開始日時'}
          dateValue={showDateTimePicker === 'announcement' ? announcementDate : saleStartDate}
          timeValue={showDateTimePicker === 'announcement' ? announcementTime : saleStartTime}
          onConfirm={(date, time) => {
            if (showDateTimePicker === 'announcement') {
              setAnnouncementDate(date); setAnnouncementTime(time)
            } else {
              setSaleStartDate(date); setSaleStartTime(time)
            }
            setShowDateTimePicker(null)
          }}
          onClose={() => setShowDateTimePicker(null)}
        />
      )}

      {activeTimePicker && (
        <BrandedTimePicker
          key={activeTimePicker}
          value={(() => {
            const raw = activeTimePicker === 'opening' ? openingTime : activeTimePicker === 'start' ? startTime : endTime
            return raw || smartDefaultTime(activeTimePicker, startTime, openingTime)
          })()}
          label={activeTimePicker === 'opening' ? '開場時間' : activeTimePicker === 'start' ? '開演時間' : '終了時間'}
          onChange={(v) => {
            if (activeTimePicker === 'opening') setOpeningTime(v)
            else if (activeTimePicker === 'start') setStartTime(v)
            else setEndTime(v)
            setActiveTimePicker(null)
          }}
          onClose={() => setActiveTimePicker(null)}
        />
      )}

      {/* アーティスト新規登録シート */}
      {showNewArtist && (
        <NewArtistSheet
          onSave={(artist) => {
            propOnAddArtist?.(artist)
            setArtistIds(prev => [...prev, artist.id])
            setShowNewArtist(false)
            showArtistToast(artist.name)
          }}
          onClose={() => setShowNewArtist(false)}
        />
      )}

      {/* 編集内容破棄確認ダイアログ */}
      {showConfirm && (
        <ConfirmDiscardDialog
          onDiscard={() => {
            // 破棄 = 下書きもクリア（ユーザーが明示的に捨てる意思表示）
            try { localStorage.removeItem(DRAFT_KEY) } catch {}
            onClose()
          }}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {/* トーストは PhoneFrame 内の ToastHost が共通で表示（useGrapeToast 経由） */}
    </>
  )
}

// ─── ImageUploadGrid ─────────────────────────────────────────────────────────
/** 画像を base64 に圧縮変換（最大1200px, JPEG75%） */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const maxDim = 1200
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.75))
    }
    img.src = url
  })
}

const MAX_IMAGES = 5

function ImageUploadGrid({ images, onChange }: { images: string[]; onChange: (v: string[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const remaining = MAX_IMAGES - images.length
  const isFull = remaining <= 0

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, remaining)
    if (!files.length) return
    const compressed = await Promise.all(files.map(compressImage))
    onChange([...images, ...compressed])
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
      {/* サムネイルグリッド */}
      {images.length > 0 && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10,
        }}>
          {images.map((src, i) => (
            <div key={i} style={{ position: 'relative', paddingTop: '75%', borderRadius: 6, overflow: 'hidden' }}>
              <img
                src={src}
                alt={`画像${i + 1}`}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <button
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute', top: 4, right: 4,
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <X size={10} weight="bold" color="#fff" />
              </button>
            </div>
          ))}
        </div>
      )}
      {/* 追加ボタン（上限に達したら非表示） */}
      {!isFull && (
        <button
          onClick={() => fileRef.current?.click()}
          style={{
            width: '100%', height: 48, borderRadius: 8,
            border: '1.5px solid var(--color-encore-border)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 12, fontWeight: 700,
            color: 'var(--color-encore-green)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Plus size={14} weight="bold" />
          画像を追加
        </button>
      )}
      {/* 注記 */}
      <div style={{
        ...ty.captionMuted,
        marginTop: 6,
        textAlign: 'center',
      }}>
        {isFull
          ? `上限（${MAX_IMAGES}点）に達しました`
          : `最大${MAX_IMAGES}点まで追加できます（あと${remaining}点）`}
      </div>
    </div>
  )
}

// ─── CoverArtEditor ───────────────────────────────────────────────────────────
function CoverArtEditor({
  coverImage,
  position,
  availableImages = [],
  onImageChange,
  onPositionChange,
  onRemove,
}: {
  coverImage: string
  position: string
  /** 「画像」欄に登録済みの画像（これらからもカバーアート選択可能） */
  availableImages?: string[]
  onImageChange: (url: string) => void
  onPositionChange: (pos: string) => void
  onRemove: () => void
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, px: 50, py: 50 })

  // カバーアートとして選択可能な画像（現在のカバー以外）
  const pickableImages = availableImages.filter(img => img !== coverImage)

  const parsePos = (pos: string) => {
    const parts = pos.split(' ')
    return { px: parseFloat(parts[0]) || 50, py: parseFloat(parts[1]) || 50 }
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const { px, py } = parsePos(position)
    dragStart.current = { x: e.clientX, y: e.clientY, px, py }
    setIsDragging(true)
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    const newPx = Math.max(0, Math.min(100, dragStart.current.px - dx * 0.3))
    const newPy = Math.max(0, Math.min(100, dragStart.current.py - dy * 0.3))
    onPositionChange(`${newPx.toFixed(1)}% ${newPy.toFixed(1)}%`)
  }

  const handlePointerUp = () => setIsDragging(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onImageChange(url)
    onPositionChange('50% 50%')
    e.target.value = ''
  }

  // 変更ボタンの処理: availableImages があれば Picker、なければ直接ファイル選択
  const handleChangeClick = () => {
    if (pickableImages.length > 0) {
      setShowPicker(true)
    } else {
      fileRef.current?.click()
    }
  }

  if (!coverImage) {
    return (
      <>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        <div
          onClick={() => availableImages.length > 0 ? setShowPicker(true) : fileRef.current?.click()}
          style={{
            height: 96, borderRadius: 8,
            border: '1.5px dashed var(--color-encore-border)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 6,
            cursor: 'pointer', background: 'var(--color-encore-bg-section)',
          }}
        >
          <Camera size={24} weight="light" color="var(--color-encore-text-sub)" />
          <span style={{ ...ty.captionMuted, fontSize: 11 }}>
            {availableImages.length > 0
              ? `タップして画像を選択（登録済み${availableImages.length}枚/ローカル）`
              : 'タップして画像を追加'}
          </span>
        </div>
        {showPicker && (
          <CoverArtPicker
            images={availableImages}
            currentCover={coverImage}
            onPick={(url) => { onImageChange(url); onPositionChange('50% 50%'); setShowPicker(false) }}
            onPickLocal={() => { setShowPicker(false); setTimeout(() => fileRef.current?.click(), 0) }}
            onClose={() => setShowPicker(false)}
          />
        )}
      </>
    )
  }

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* プレビュー + ドラッグトリミング */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          width: '100%', height: 160, borderRadius: 8,
          overflow: 'hidden', position: 'relative',
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none', touchAction: 'none',
        }}
      >
        <img
          src={coverImage}
          alt="カバーアート"
          draggable={false}
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: position,
            display: 'block', pointerEvents: 'none',
          }}
        />
        {/* ヒントラベル */}
        {!isDragging && (
          <div style={{
            position: 'absolute', bottom: 8, left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0,0,0,0.48)', borderRadius: 999,
            padding: '3px 10px',
            display: 'flex', alignItems: 'center', gap: 4,
            pointerEvents: 'none',
          }}>
            <ArrowsOutCardinal size={11} color="white" weight="regular" />
            <span style={{ fontFamily: 'var(--font-google-sans), sans-serif', fontSize: 10, color: 'white', fontWeight: 700 }}>
              ドラッグして表示範囲を調整
            </span>
          </div>
        )}
      </div>

      {/* アクション */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button
          onClick={handleChangeClick}
          style={{
            height: 32, padding: '0 14px', borderRadius: 999,
            border: '1.5px solid var(--color-encore-green)',
            background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 12, fontWeight: 700,
            color: 'var(--color-encore-green)',
            display: 'flex', alignItems: 'center', gap: 5,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Camera size={12} weight="regular" />
          変更
        </button>
        <button
          onClick={onRemove}
          style={{
            height: 32, padding: '0 14px', borderRadius: 999,
            border: '1.5px solid var(--color-encore-border)',
            background: 'transparent', cursor: 'pointer',
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 12, fontWeight: 700,
            color: 'var(--color-encore-text-muted)',
            display: 'flex', alignItems: 'center', gap: 5,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Trash size={12} weight="regular" />
          削除
        </button>
      </div>

      {/* Picker Modal */}
      {showPicker && (
        <CoverArtPicker
          images={availableImages}
          currentCover={coverImage}
          onPick={(url) => { onImageChange(url); onPositionChange('50% 50%'); setShowPicker(false) }}
          onPickLocal={() => { setShowPicker(false); setTimeout(() => fileRef.current?.click(), 0) }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}

// ─── CoverArtPicker ───────────────────────────────────────────────────────────
/** 登録済み画像 or ローカルから選ぶモーダル */
function CoverArtPicker({
  images,
  currentCover,
  onPick,
  onPickLocal,
  onClose,
}: {
  images: string[]
  currentCover: string
  onPick: (url: string) => void
  onPickLocal: () => void
  onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26, 58, 45, 0.48)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-encore-bg)',
          borderRadius: '18px 18px 0 0',
          padding: '16px 0 20px',
          maxHeight: '72%',
          display: 'flex', flexDirection: 'column',
          animation: 'grape-slide-up 280ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* ドラッグハンドル */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <div style={{
            width: 36, height: 4,
            background: 'var(--color-encore-border)',
            borderRadius: 999,
          }} />
        </div>
        <div style={{
          ...ty.section, textAlign: 'center',
          padding: '8px 0 14px',
          color: 'var(--color-encore-text-sub)',
        }}>
          カバーアートを選択
        </div>

        {/* 登録済み画像グリッド */}
        {images.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: '0 16px 16px',
            overflowY: 'auto',
          }}>
            {images.map((img, i) => {
              const isCurrent = img === currentCover
              return (
                <button
                  key={i}
                  onClick={() => onPick(img)}
                  disabled={isCurrent}
                  style={{
                    position: 'relative',
                    aspectRatio: '1 / 1',
                    borderRadius: 8,
                    overflow: 'hidden',
                    padding: 0,
                    border: isCurrent
                      ? '2px solid var(--color-encore-green)'
                      : '1.5px solid var(--color-encore-border-light)',
                    background: 'var(--color-encore-bg-section)',
                    cursor: isCurrent ? 'default' : 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <img
                    src={img}
                    alt={`画像${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isCurrent ? 0.5 : 1 }}
                  />
                  {isCurrent && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(255,255,255,0.1)',
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-google-sans), sans-serif',
                        fontSize: 10, fontWeight: 700,
                        background: 'var(--color-encore-green)',
                        color: '#fff',
                        padding: '3px 8px',
                        borderRadius: 999,
                      }}>
                        使用中
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* ローカルから選ぶ */}
        <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 16px 8px' }} />
        <button
          onClick={onPickLocal}
          style={{
            padding: '14px 20px',
            background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'var(--color-encore-bg-section)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={14} weight="regular" color="var(--color-encore-green)" />
          </div>
          <div>
            <div style={{ ...ty.section }}>ローカルから選ぶ</div>
            <div style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', marginTop: 1 }}>
              端末の写真ライブラリから選択
            </div>
          </div>
        </button>

        {/* キャンセル */}
        <div style={{ height: 8, background: 'var(--color-encore-bg-section)', margin: '8px 0 0' }} />
        <button
          onClick={onClose}
          style={{
            padding: '14px 20px',
            background: 'none', border: 'none',
            ...ty.section, color: 'var(--color-encore-text-sub)',
            cursor: 'pointer',
            textAlign: 'center',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

function TicketIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor">
      <path d="M227.82,99.17a20,20,0,0,0,0-28.28L198.9,41.87a20,20,0,0,0-27.6-.4l-9.19,8.34a4,4,0,0,1-5.58-.18L148.13,41a20,20,0,0,0-28.28,0L28.18,132.63a20,20,0,0,0,0,28.28L57.1,189.83a20,20,0,0,0,27.6.4l9.19-8.34a4,4,0,0,1,5.58.18L107.87,190a20,20,0,0,0,28.28,0ZM95.51,174.07l-9.19,8.34a4,4,0,0,1-5.52-.08L51.88,153a4,4,0,0,1,0-5.66L143.51,55.72a4,4,0,0,1,5.65,0l8.41,8.4a20,20,0,0,0,22.27,4.17l6.52-2.89,23.76,23.76-2.89,6.51a20,20,0,0,0,4.17,22.27l8.41,8.41a4,4,0,0,1,0,5.65L128.18,224a4,4,0,0,1-5.65,0l-8.4-8.41A20,20,0,0,0,91.86,211.4Z" />
    </svg>
  )
}
