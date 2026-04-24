'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import * as ty from '@/components/encore/typographyStyles'
import { StatusBar } from '@/components/encore/NavHeader'
import {
  CalendarBlank, Ticket, ChartBar, GearSix,
  Bell, CloudArrowUp, CloudArrowDown,
  Envelope,
  FileText, ShieldCheck, Info, Star, ArrowSquareOut,
  MusicNote, UserCircle, PencilSimple, Trash, X,
  Check, UserCirclePlus, UploadSimple, Cake, CaretDown, CaretUp, Warning, Plus,
  Lock, Crown, CaretRight, Question, Flag,
} from '@phosphor-icons/react'
import PhoneFrame from '@/components/grape/PhoneFrame'
import PremiumUpgradeSheet from '@/components/grape/PremiumUpgradeSheet'
import ArtistDeleteConfirmDialog from '@/components/grape/ArtistDeleteConfirmDialog'
import BirthdayCalendar from '@/components/grape/BirthdayCalendar'
import { getAllSetlists } from '@/lib/grape/useSetlistStore'
import { buildExportPayload, buildExportFilename, downloadExportBlob, formatExportSummary } from '@/lib/grape/exportData'
import { useGrapeStore } from '@/lib/grape/useGrapeStore'
import { useIsPremium, setIsPremium } from '@/lib/grape/premium'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'
import { useShowHolidays, setShowHolidays } from '@/lib/grape/useShowHolidays'
import type { GrapeArtist, ArtistMember } from '@/lib/grape/types'
import { DOW_SUN_COLOR, DOW_SAT_COLOR } from '@/lib/grape/constants'
import ColorPicker from '@/components/encore/ColorPicker'
import { PRESET_SCHEMES, loadPaletteScheme, getCurrentPaletteSchemeId, subscribeToSchemeId } from '@/components/encore/ColorPalette'

// ─── 定数 ─────────────────────────────────────────────────────────────────────

const TAB_ITEMS = [
  { key: 'calendar', label: 'CALENDAR', Icon: CalendarBlank, href: '/grape/calendar/' },
  { key: 'tickets',  label: 'TICKETS',  Icon: Ticket,        href: '/grape/tickets/'  },
  { key: 'report',   label: 'REPORT',   Icon: ChartBar,      href: '/grape/report/'   },
  { key: 'settings', label: 'SETTINGS', Icon: GearSix,       href: '/grape/settings/' },
]

const APP_VERSION = '1.0.0'

// ─── SettingsSection ──────────────────────────────────────────────────────────

function SettingsSection({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        padding: '0 20px 8px',
        display: 'flex', alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase' as const,
          color: 'var(--color-encore-text-muted)',
          flex: 1,
        }}>
          {label}
        </span>
        {action}
      </div>
      <div style={{
        borderTop: '1px solid var(--color-encore-border-light)',
        borderBottom: '1px solid var(--color-encore-border-light)',
        background: 'var(--color-encore-bg)',
      }}>
        {children}
      </div>
    </div>
  )
}

// ─── SettingsDivider ──────────────────────────────────────────────────────────

function SettingsDivider({ indent = 62 }: { indent?: number }) {
  return (
    <div style={{
      height: 1,
      background: 'var(--color-encore-border-light)',
      marginLeft: indent,
    }} />
  )
}

// ─── SettingsIconWrap ─────────────────────────────────────────────────────────

function SettingsIconWrap({
  children, color = 'var(--color-encore-green)',
  bg = 'var(--color-encore-bg-section)',
}: {
  children: React.ReactNode
  color?: string
  bg?: string
}) {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, color,
    }}>
      {children}
    </div>
  )
}

// ─── SettingsRow ──────────────────────────────────────────────────────────────

function SettingsRow({
  icon, label, description, value,
  onClick, showChevron = true,
}: {
  icon?: React.ReactNode
  label: string
  description?: string
  value?: string
  onClick?: () => void
  showChevron?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center',
        padding: description ? '11px 20px' : '13px 20px', gap: 14,
        cursor: onClick ? 'pointer' : 'default',
        background: 'var(--color-encore-bg)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      <div style={{ flex: 1 }}>
        <div style={{ ...ty.body, fontSize: 16 }}>{label}</div>
        {description && (
          <div style={{ ...ty.bodySM, color: 'var(--color-encore-text-muted)', marginTop: 1 }}>{description}</div>
        )}
      </div>
      {value && <span style={{ ...ty.body, fontSize: 16, color: 'var(--color-encore-text-muted)' }}>{value}</span>}
      {showChevron && onClick && (
        <svg width="14" height="14" viewBox="0 0 256 256" fill="none">
          <polyline
            points="96,48 176,128 96,208"
            stroke="var(--color-encore-green)"
            strokeWidth="20" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  )
}

// ─── SettingsToggleRow ────────────────────────────────────────────────────────

function SettingsToggleRow({
  icon, label, description, value, onChange,
}: {
  icon?: React.ReactNode
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div
      onClick={() => onChange(!value)}
      style={{
        display: 'flex', alignItems: 'flex-start',
        padding: '12px 20px', gap: 14,
        cursor: 'pointer', background: 'var(--color-encore-bg)',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ ...ty.body, fontSize: 16 }}>{label}</span>
        {description && (
          <div style={{ ...ty.captionMuted, marginTop: 2, lineHeight: 1.45 }}>{description}</div>
        )}
      </div>
      {/* ENCORE Toggle準拠 */}
      <div style={{
        width: 51, height: 26, borderRadius: 999, flexShrink: 0,
        background: value ? 'var(--color-encore-green)' : '#D1D1D6',
        position: 'relative', transition: 'background 0.25s',
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute',
          width: 22, height: 22,
          background: 'var(--color-encore-white)',
          borderRadius: 999, top: 2,
          left: value ? 27 : 2,
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 1.5px 5px rgba(0,0,0,0.18), 0 0.5px 2px rgba(0,0,0,0.06)',
        }} />
      </div>
    </div>
  )
}

// ─── StyleSelector ────────────────────────────────────────────────────────────

// スキームプレビュー用のドット3色 (bg / primary / accent)
const SCHEME_PREVIEWS: Record<string, [string, string, string]> = {
  'preset-grape':  ['#F5F3FB', '#3D1A78', '#C04890'],
  'preset-ocean':  ['#F0F8F8', '#0E3D40', '#D07840'],
  'preset-moss':   ['#FAF8F4', '#1A3A2D', '#C08A4A'],
  'preset-slate':  ['#F3F4F7', '#1A2840', '#C8901A'],
}

function StyleSelector() {
  // useSyncExternalStore を使うことで:
  //   - getSnapshot (= getCurrentPaletteSchemeId) は毎レンダーに呼ばれる
  //     → Next.js ルーターキャッシュでコンポーネントが再マウントされない場合も
  //       ページ復帰時のレンダーで常に最新の localStorage 値を読み直せる
  //   - encore-palette-update イベントで外部変更も即座に反映される
  const activeId = React.useSyncExternalStore(
    subscribeToSchemeId,
    getCurrentPaletteSchemeId,
    () => 'preset-grape',
  )
  const { show: showToast } = useGrapeToast()

  const options = PRESET_SCHEMES.map(s => ({ id: s.id, label: s.name }))

  const handleSelect = (id: string) => {
    if (id === activeId) return  // 同じパレット選択時はトースト出さない
    const scheme = PRESET_SCHEMES.find(s => s.id === id)
    loadPaletteScheme(id)
    if (scheme) showToast(`パレットを「${scheme.name}」に変更しました`)
    // activeId は useSyncExternalStore が encore-palette-update で自動更新する
  }

  return (
    <div style={{ padding: '12px 20px', background: 'var(--color-encore-bg)' }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {options.map(({ id, label }) => {
          const isActive = activeId === id
          const [bg, primary, accent] = SCHEME_PREVIEWS[id] ?? ['#FAF8F4', '#1A3A2D', '#C08A4A']
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              style={{
                flex: 1,
                borderRadius: 10, padding: '9px 8px 8px',
                border: isActive
                  ? '1.5px solid var(--color-encore-green)'
                  : '1.5px solid var(--color-encore-border-light)',
                background: isActive ? 'var(--color-grape-tint-06)' : 'transparent',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 12, fontWeight: isActive ? 700 : 400,
                color: isActive ? 'var(--color-encore-green)' : 'var(--color-encore-text-sub)',
                WebkitTapHighlightColor: 'transparent', transition: 'all 0.15s',
              }}
            >
              {/* 3色プレビュードット */}
              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {[bg, primary, accent].map((c, i) => (
                  <div key={i} style={{
                    width: 9, height: 9, borderRadius: '50%',
                    background: c,
                    border: '1px solid rgba(0,0,0,0.1)',
                    flexShrink: 0,
                  }} />
                ))}
              </div>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── BackupNote ───────────────────────────────────────────────────────────────

function BackupNote() {
  return (
    <div style={{
      margin: '8px 16px 4px',
      padding: '10px 14px',
      borderRadius: 10,
      background: 'var(--color-info-bg)',
    }}>
      <span style={{
        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
        fontSize: 12,
        fontWeight: 400,
        color: 'var(--color-info-text)',
        lineHeight: 1.6,
      }}>
        iCloudで自動的にバックアップされ、お使いのiPhone/iPadで大切な記録を引き継げます。
      </span>
    </div>
  )
}

// ─── PremiumInfoCard ──────────────────────────────────────────────────────────

function PremiumInfoCard({
  isPremium, onShowPremium,
}: {
  isPremium: boolean
  onShowPremium: () => void
}) {
  const GOLD = '#F5C850'
  return (
    <button
      onClick={onShowPremium}
      style={{
        margin: '0 16px', borderRadius: 10,
        background: '#1C0F42',
        padding: '16px 18px',
        display: 'flex', gap: 14, alignItems: 'center',
        width: 'calc(100% - 32px)',
        border: 'none', cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        textAlign: 'left',
      }}
    >
      {/* クラウンアイコン（Premium 時は ACTIVE 小バッジ付き）*/}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: 'rgba(245,200,80,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <Crown size={19} weight="fill" color={GOLD} />
      </div>

      {/* テキスト */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 18, fontWeight: 700,
          color: '#FFFFFF',
          marginBottom: 4,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          Grape Premium
          {isPremium && (
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 10, fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#1C0F42',
              background: GOLD,
              padding: '2px 7px',
              borderRadius: 999,
            }}>
              ACTIVE
            </span>
          )}
        </div>
        <div style={{
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 12, fontWeight: 400,
          color: 'rgba(255,255,255,0.55)',
          lineHeight: 1.6,
        }}>
          {isPremium
            ? 'すべての特典をご利用中'
            : 'アーティスト無制限・詳細なレポートにアップグレード'
          }
        </div>
      </div>

      {/* シェブロン */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        <CaretRight size={16} weight="bold" color={GOLD} />
      </div>
    </button>
  )
}

// ─── AppSummaryCard ───────────────────────────────────────────────────────────

function AppSummaryCard({
  livesCount, artistsCount, isPremium, onShowPlanInfo,
}: {
  livesCount: number
  artistsCount: number
  isPremium: boolean
  onShowPlanInfo: () => void
}) {
  const stats = [
    { icon: <MusicNote size={15} weight="regular" />, value: `${livesCount}本`, label: 'イベント', info: false },
    { icon: <UserCircle size={15} weight="regular" />, value: `${artistsCount}`, label: 'アーティスト', info: false },
    // プラン欄: Premium 時は Crown アイコン、ラベル色・値色は Free と統一（サブ的な表示）
    {
      icon: isPremium
        ? <Crown size={15} weight="regular" />
        : <Star size={15} weight="regular" />,
      value: isPremium ? 'Premium' : 'Free',
      label: 'プラン',
      info: true,
    },
  ]
  return (
    <div style={{
      margin: '0 16px 28px',
      borderRadius: 8,
      background: 'var(--color-encore-bg-section)',
      display: 'flex',
    }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{
          flex: 1, padding: '14px 0 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
          borderRight: i < stats.length - 1 ? '1px solid var(--color-encore-border-light)' : 'none',
          position: 'relative',
        }}>
          <div style={{ color: 'var(--color-encore-green)', display: 'flex', alignItems: 'center' }}>
            {s.icon}
          </div>
          <span style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 18, fontWeight: 700, lineHeight: 1,
            color: 'var(--color-encore-green)',
          }}>{s.value}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ ...ty.captionMuted, lineHeight: 1 }}>{s.label}</span>
            {s.info && (
              <button
                onClick={onShowPlanInfo}
                aria-label="プランの詳細"
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Question
                  size={13}
                  weight="regular"
                  color="var(--color-encore-text-muted)"
                />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── PlanInfoModal ────────────────────────────────────────────────────────────
// Free ユーザ向けのコンパクトな「プランとは？」説明モーダル。
// Premium ユーザは同じ情報を PremiumUpgradeSheet で見れるため、このモーダルは出さず
// 直接 PremiumUpgradeSheet を開く（Settings 側で分岐）。
function PlanInfoModal({ onClose, onUpgrade }: { onClose: () => void; onUpgrade: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0,
        background: 'rgba(26, 58, 45, 0.48)',
        zIndex: 250,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 28,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 320,
          background: 'var(--color-encore-bg)',
          borderRadius: 14,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 6px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(192, 138, 74, 0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={20} weight="fill" color="var(--color-encore-amber)" />
          </div>
          <div style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 16, fontWeight: 700,
            color: 'var(--color-encore-green)',
          }}>
            Freeプランについて
          </div>
        </div>

        {/* Body */}
        <div style={{
          padding: '8px 20px 18px',
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 14, lineHeight: 1.6,
          color: 'var(--color-encore-green)',
          textAlign: 'center',
        }}>
          Freeプランでは、<b>アーティスト5組</b>まで登録できます。<br/>
          6組以上を登録するには、Premiumプランへのアップグレードが必要です。
        </div>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          borderTop: '1px solid var(--color-encore-border-light)',
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '13px 0',
              background: 'none',
              border: 'none',
              borderRight: '1px solid var(--color-encore-border-light)',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 14, fontWeight: 400,
              color: 'var(--color-encore-text-sub)',
              cursor: 'pointer',
            }}
          >
            閉じる
          </button>
          <button
            onClick={() => { onClose(); onUpgrade() }}
            style={{
              flex: 1,
              padding: '13px 0',
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 14, fontWeight: 700,
              color: 'var(--color-encore-amber)',
              cursor: 'pointer',
            }}
          >
            Premiumを見る
          </button>
        </div>
      </div>
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
        <img
          src={image} alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        <UserCircle size={size * 0.55} weight="light" color="var(--color-encore-text-muted)" />
      )}
    </div>
  )
}

// ─── ArtistEditSheet ──────────────────────────────────────────────────────────

function ArtistEditSheet({
  artist,
  isNew = false,
  onSave,
  onClose,
}: {
  artist: GrapeArtist
  isNew?: boolean
  onSave: (updated: GrapeArtist) => void
  onClose: () => void
}) {
  const [name,         setName]         = useState(artist.name)
  const [image,        setImage]        = useState(artist.image ?? '')
  const [birthday,     setBirthday]     = useState(artist.birthday ?? '')
  const [members,      setMembers]      = useState<ArtistMember[]>(artist.members ?? [])
  const [alwaysColor,  setAlwaysColor]  = useState(artist.alwaysColor ?? false)
  const [defaultColor, setDefaultColor] = useState<string | null>(artist.defaultColor ?? null)
  const [showOverlay,  setShowOverlay]  = useState(false)
  const [showBdPicker, setShowBdPicker] = useState(false)
  // メンバー誕生日ピッカー（同時に1つだけ開く）
  const [openMemberPicker,    setOpenMemberPicker]    = useState<number | null>(null)
  const [memberPickerMonth,   setMemberPickerMonth]   = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // カレンダーの表示月（初期値: 選択済み誕生日の月 or 現在月）
  const initMonth = birthday ? parseInt(birthday.split('-')[1]) - 1 : new Date().getMonth()
  const [pickerMonth, setPickerMonth] = useState(initMonth)

  // 月ナビ: 1月〜12月でクランプ（年をまたがない）
  const goMonth = (delta: number) => {
    setPickerMonth(m => Math.max(0, Math.min(11, m + delta)))
  }

  // 選択された birthday を YYYY-MM-DD から分解（年は無視）
  const bdParts  = birthday ? birthday.split('-').map(Number) : null
  const bdMonth  = bdParts?.[1] ?? null  // 1-indexed
  const bdDay    = bdParts?.[2] ?? null

  // 誕生日表示: 年なし「M月D日」
  const formatBirthday = (val: string) => {
    if (!val) return ''
    const [, m, d] = val.split('-').map(Number)
    return `${m}月${d}日`
  }

  // カレンダーグリッド生成（年は固定 2000 で曜日計算）
  const firstDow    = new Date(2000, pickerMonth, 1).getDay() // 0=Sun
  const daysInMonth = new Date(2000, pickerMonth + 1, 0).getDate()
  const calCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // 7の倍数に揃える
  while (calCells.length % 7 !== 0) calCells.push(null)

  // メンバーピッカー用カレンダー計算
  const memberFirstDow    = new Date(2000, memberPickerMonth, 1).getDay()
  const memberDaysInMonth = new Date(2000, memberPickerMonth + 1, 0).getDate()
  const memberCalCells: (number | null)[] = [
    ...Array(memberFirstDow).fill(null),
    ...Array.from({ length: memberDaysInMonth }, (_, i) => i + 1),
  ]
  while (memberCalCells.length % 7 !== 0) memberCalCells.push(null)

  // 現在開いているメンバーの選択日
  const openMemberBd     = openMemberPicker !== null ? (members[openMemberPicker]?.birthday ?? '') : ''
  const openMemberBdParts = openMemberBd ? openMemberBd.split('-').map(Number) : null
  const openMemberBdMonth = openMemberBdParts?.[1] ?? null
  const openMemberBdDay   = openMemberBdParts?.[2] ?? null

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
    reader.onload = (ev) => {
      setImage(ev.target?.result as string)
      setShowOverlay(false)
    }
    reader.readAsDataURL(file)
    // reset input so same file can be picked again
    e.target.value = ''
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      zIndex: 60,
    }}>
      {/* オーバーレイ */}
      <div
        onClick={() => { setShowOverlay(false); onClose() }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
      />

      {/* パネル */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'relative', zIndex: 1,
          background: 'var(--color-encore-bg)',
          borderRadius: '24px 24px 0 0',
          padding: '0 0 36px',
          maxHeight: '85vh', overflowY: 'auto',
        }}
      >
        {/* ドラッグハンドル */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: 'var(--color-encore-border)' }} />
        </div>

        {/* ヘッダー */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 20px 16px',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: 'var(--color-encore-text-muted)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <X size={20} weight="bold" />
          </button>
          <span style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 16, fontWeight: 700, color: 'var(--color-encore-green)',
          }}>
            {isNew ? 'アーティストを追加' : 'アーティストを編集'}
          </span>
          <button
            onClick={() => canSave && onSave({
              ...artist,
              name: name.trim(),
              image: image || undefined,
              birthday: birthday || undefined,
              members: members.length > 0 ? members : undefined,
              alwaysColor: alwaysColor || undefined,
              defaultColor: (alwaysColor && defaultColor) ? defaultColor : undefined,
            })}
            style={{
              background: canSave ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
              border: 'none', borderRadius: 999,
              padding: '6px 16px', cursor: canSave ? 'pointer' : 'default',
              transition: 'background 0.15s', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 14, fontWeight: 700,
              color: canSave ? '#fff' : 'var(--color-encore-text-muted)',
            }}>保存</span>
          </button>
        </div>

        {/* アバター（タップで画像アップロード） */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <div
            onClick={() => setShowOverlay(v => !v)}
            style={{ position: 'relative', width: 72, height: 72, cursor: 'pointer' }}
          >
            <ArtistAvatar image={image || undefined} name={name} size={72} />
            {/* 選択オーバーレイ */}
            {showOverlay && (
              <div
                onClick={e => { e.stopPropagation(); fileInputRef.current?.click() }}
                style={{
                  position: 'absolute', inset: 0, borderRadius: '50%',
                  background: 'rgba(26,58,45,0.65)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <UploadSimple size={22} weight="regular" color="#fff" />
              </div>
            )}
          </div>
          <span style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 12, fontWeight: 400,
            color: 'var(--color-encore-text-muted)',
          }}>
            {showOverlay ? 'タップして写真を選択' : 'タップして変更'}
          </span>
          {/* hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>

        {/* フォーム */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 名前フィールド */}
          <div>
            <div style={{ ...ty.captionMuted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              アーティスト名
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              borderBottom: `1.5px solid var(--color-encore-border-light)`,
              padding: '8px 0',
            }}>
              <UserCirclePlus size={16} weight="regular" color="var(--color-encore-text-muted)" />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="アーティスト名"
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 16, fontWeight: 400, color: 'var(--color-encore-green)',
                }}
              />
              {name.length > 0 && (
                <button onClick={() => setName('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                  <X size={14} weight="bold" color="var(--color-encore-text-muted)" />
                </button>
              )}
            </div>
          </div>

          {/* 誕生日フィールド */}
          <div>
            <div style={{ ...ty.captionMuted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              誕生日（任意）
            </div>
            {/* トリガー行 */}
            <button
              onClick={() => setShowBdPicker(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: `1.5px solid ${showBdPicker ? 'var(--color-encore-green)' : 'var(--color-encore-border-light)'}`,
                padding: '8px 0',
                background: 'transparent',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                transition: 'border-color 0.15s',
              }}
            >
              <Cake size={16} weight="regular" color="var(--color-encore-text-muted)" />
              <span style={{
                flex: 1, textAlign: 'left',
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 16, fontWeight: birthday ? 400 : 400,
                color: birthday ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
              }}>
                {birthday ? formatBirthday(birthday) : '誕生日を選択'}
              </span>
              {birthday && (
                <div
                  onClick={e => { e.stopPropagation(); setBirthday(''); setShowBdPicker(false) }}
                  style={{ lineHeight: 1, padding: 2 }}
                >
                  <X size={14} weight="bold" color="var(--color-encore-text-muted)" />
                </div>
              )}
            </button>

            {/* インラインカレンダー（BirthdayCalendar 共通コンポーネント使用） */}
            {showBdPicker && (
              <div style={{ marginTop: 8 }}>
                <BirthdayCalendar
                  value={birthday}
                  onSelect={(v) => { setBirthday(v); setShowBdPicker(false) }}
                />
              </div>
            )}
          </div>

          {/* メンバー誕生日 */}
          <div>
            <div style={{ ...ty.captionMuted, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              メンバー誕生日（任意）
            </div>

            {members.map((member, idx) => (
              <div key={idx}>
                {/* メンバー行 */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  borderBottom: `1.5px solid ${openMemberPicker === idx ? 'var(--color-encore-green)' : 'var(--color-encore-border-light)'}`,
                  padding: '8px 0',
                  transition: 'border-color 0.15s',
                }}>
                  <input
                    value={member.name}
                    onChange={e => {
                      const updated = [...members]
                      updated[idx] = { ...updated[idx], name: e.target.value }
                      setMembers(updated)
                    }}
                    placeholder="名前"
                    style={{
                      flex: 1, border: 'none', outline: 'none', background: 'transparent',
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 16, fontWeight: 400, color: 'var(--color-encore-green)',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (openMemberPicker === idx) {
                        setOpenMemberPicker(null)
                      } else {
                        const m = member.birthday ? parseInt(member.birthday.split('-')[1]) - 1 : new Date().getMonth()
                        setMemberPickerMonth(m)
                        setOpenMemberPicker(idx)
                        setShowBdPicker(false)
                      }
                    }}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                      fontSize: 14, fontWeight: 400, flexShrink: 0,
                      color: member.birthday ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
                      padding: '2px 0',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <Cake size={14} weight="regular" color="var(--color-encore-text-muted)" style={{ marginRight: 4, verticalAlign: 'middle' }} />
                    <span style={{ verticalAlign: 'middle' }}>
                      {member.birthday ? formatBirthday(member.birthday) : '誕生日'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setMembers(members.filter((_, i) => i !== idx))
                      if (openMemberPicker === idx) setOpenMemberPicker(null)
                      else if (openMemberPicker !== null && openMemberPicker > idx) setOpenMemberPicker(openMemberPicker - 1)
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, lineHeight: 1, flexShrink: 0, WebkitTapHighlightColor: 'transparent' }}
                  >
                    <X size={14} weight="bold" color="var(--color-encore-text-muted)" />
                  </button>
                </div>

                {/* メンバー誕生日ピッカー（BirthdayCalendar 共通コンポーネント使用） */}
                {openMemberPicker === idx && (
                  <div style={{ marginTop: 8, marginBottom: 4 }}>
                    <BirthdayCalendar
                      value={member.birthday ?? ''}
                      onSelect={(v) => {
                        const updated = [...members]
                        updated[idx] = { ...updated[idx], birthday: v }
                        setMembers(updated)
                        setOpenMemberPicker(null)
                      }}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* メンバー追加ボタン */}
            <button
              onClick={() => setMembers(prev => [...prev, { name: '' }])}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '10px 0', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Plus size={13} weight="bold" color="var(--color-encore-green)" />
              <span style={{ fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif', fontSize: 14, fontWeight: 700, color: 'var(--color-encore-green)' }}>
                メンバーを追加
              </span>
            </button>
          </div>

          {/* イベントカラー設定 */}
          <div>
            <button
              onClick={() => setAlwaysColor(v => !v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '10px 0', WebkitTapHighlightColor: 'transparent',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 16, fontWeight: 400, color: 'var(--color-encore-green)', flex: 1, textAlign: 'left',
              }}>
                イベントを常に色指定する
              </span>
              <div style={{
                width: 44, height: 26, borderRadius: 999, flexShrink: 0,
                background: alwaysColor ? 'var(--color-encore-green)' : 'var(--color-encore-border)',
                position: 'relative', transition: 'background 0.2s',
              }}>
                <div style={{
                  position: 'absolute', top: 3, borderRadius: '50%',
                  width: 20, height: 20, background: '#fff',
                  left: alwaysColor ? 21 : 3,
                  transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </button>
            {alwaysColor && (
              <div style={{ paddingTop: 4, paddingBottom: 4 }}>
                <ColorPicker
                  value={defaultColor}
                  onChange={c => setDefaultColor(c)}
                  showDefault={false}
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── ArtistManageSection ──────────────────────────────────────────────────────

const ARTIST_VISIBLE_COUNT = 5
const FREE_ARTIST_LIMIT    = 5

function ArtistManageSection({
  artists,
  onEdit,
  onDelete,
  onAdd,
  atLimit,
  isPremium,
}: {
  artists: GrapeArtist[]
  onEdit: (artist: GrapeArtist) => void
  onDelete: (artist: GrapeArtist) => void
  onAdd: () => void
  atLimit: boolean
  isPremium: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const hiddenCount = Math.max(0, artists.length - ARTIST_VISIBLE_COUNT)
  const visibleArtists = expanded ? artists : artists.slice(0, ARTIST_VISIBLE_COUNT)
  return (
    <SettingsSection
      label="アーティスト"
      action={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* カウンター: Premium 時は「N 組」、Free 時は「N / 5」*/}
          <span style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 12, fontWeight: 400,
            color: atLimit ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
          }}>
            {isPremium
              ? `${artists.length} 組`
              : `${artists.length} / ${FREE_ARTIST_LIMIT}`
            }
          </span>
          {/* 追加ボタン（Premium は常に有効、Free は atLimit で Lock）*/}
          <button
            onClick={onAdd}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '2px 0',
              color: atLimit ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 14, fontWeight: 700,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {atLimit
              ? <Lock size={14} weight="regular" />
              : <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span>
            }
            追加
          </button>
        </div>
      }
    >
      {artists.length === 0 ? (
        <div style={{
          padding: '24px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        }}>
          <UserCircle size={32} weight="light" color="var(--color-encore-text-muted)" />
          <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-muted)' }}>
            アーティストが登録されていません
          </span>
        </div>
      ) : (
        <>
          {visibleArtists.map((artist, i) => (
            <React.Fragment key={artist.id}>
              {i > 0 && <SettingsDivider indent={74} />}
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 20px', gap: 14,
                background: 'var(--color-encore-bg)',
              }}>
                {/* アバター */}
                <ArtistAvatar image={artist.image} name={artist.name} size={44} />

                {/* 名前 */}
                <span style={{
                  ...ty.body, fontSize: 16, flex: 1, fontWeight: 700,
                  color: 'var(--color-encore-green)',
                }}>
                  {artist.name}
                </span>

                {/* 編集ボタン */}
                <button
                  onClick={() => onEdit(artist)}
                  style={{
                    width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                    border: 'none',
                    background: 'var(--color-encore-bg-section)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <PencilSimple size={15} weight="regular" color="var(--color-encore-green)" />
                </button>

                {/* 削除ボタン */}
                <button
                  onClick={() => onDelete(artist)}
                  style={{
                    width: 34, height: 34, borderRadius: 999, flexShrink: 0,
                    border: 'none',
                    background: 'rgba(255,59,48,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <Trash size={15} weight="regular" color="#FF3B30" />
                </button>
              </div>
            </React.Fragment>
          ))}

          {/* 折りたたみトグル */}
          {(hiddenCount > 0 || expanded) && (
            <>
              <SettingsDivider indent={0} />
              <button
                onClick={() => setExpanded(v => !v)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 4, padding: '12px 20px',
                  background: 'var(--color-encore-bg)',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--color-encore-green)',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 14, fontWeight: 700,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {expanded
                  ? <><CaretUp size={13} weight="bold" /> 折りたたむ</>
                  : <><CaretDown size={13} weight="bold" /> 他{hiddenCount}組を表示</>
                }
              </button>
            </>
          )}
        </>
      )}
    </SettingsSection>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [notifPrev,    setNotifPrev]    = useState(true)
  const [notifDay,     setNotifDay]     = useState(true)
  const [notifRaffle,  setNotifRaffle]  = useState(true)
  const [notifPayment, setNotifPayment] = useState(false)
  const router = useRouter()

  // ── アーティスト管理 ──────────────────────────────────────────────────────
  const { lives, artists, addArtist, updateArtist, deleteArtist, updateLives } = useGrapeStore()
  const isPremium = useIsPremium()
  const { show: showToast } = useGrapeToast()
  const showHolidaysEnabled = useShowHolidays()
  const [editingArtist,    setEditingArtist]    = useState<GrapeArtist | null>(null)
  const [isAdding,         setIsAdding]         = useState(false)
  const [deletingArtist,   setDeletingArtist]   = useState<GrapeArtist | null>(null)
  const [showPremiumSheet, setShowPremiumSheet] = useState(false)
  const [showPlanInfo,     setShowPlanInfo]     = useState(false)

  // 保存済みトースト
  const [savedToast, setSavedToast] = useState(false)
  function showSavedToast() {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  function handleSaveEdit(updated: GrapeArtist) {
    updateArtist(updated)
    setEditingArtist(null)
    showSavedToast()
  }

  function handleSaveNew(artist: GrapeArtist) {
    addArtist(artist)
    setIsAdding(false)
    showSavedToast()
  }

  function handleDeleteWithEvents() {
    if (!deletingArtist) return
    const name = deletingArtist.name
    const eventCount = lives.filter(l => l.artist === name).length
    updateLives(prev => prev.filter(l => l.artist !== name))
    deleteArtist(deletingArtist.id)
    setDeletingArtist(null)
    showToast(
      eventCount > 0
        ? `「${name}」とイベント ${eventCount} 件を削除しました`
        : `「${name}」を削除しました`,
    )
  }

  function handleDeleteKeepEvents() {
    if (!deletingArtist) return
    const name = deletingArtist.name
    // artistImage をクリアして Person アイコン fallback へ
    updateLives(prev => prev.map(l =>
      l.artist === name
        ? { ...l, artistImage: undefined, artistImages: undefined }
        : l
    ))
    deleteArtist(deletingArtist.id)
    setDeletingArtist(null)
    showToast(`「${name}」を削除しました（イベントは残しました）`)
  }

  return (
    <PhoneFrame>
        <StatusBar />

        {/* ── ヘッダー ── */}
        <div style={{
          padding: '8px 20px 12px',
          background: 'var(--color-encore-bg)',
          flexShrink: 0,
        }}>
          <div className="grape-page-title" style={{ ...ty.display, lineHeight: 1 }}>Settings</div>
        </div>

        {/* ── スクロールコンテンツ ── */}
        <div style={{ flex: 1, overflowY: 'auto', paddingTop: 28 }}>

          {/* サマリー（「?」タップ: Premium は直接 PremiumUpgradeSheet、Free は PlanInfoModal）*/}
          <AppSummaryCard
            livesCount={lives.length}
            artistsCount={artists.length}
            isPremium={isPremium}
            onShowPlanInfo={() => {
              if (isPremium) {
                setShowPremiumSheet(true)
              } else {
                setShowPlanInfo(true)
              }
            }}
          />

          {/* アーティスト管理（Premium は無制限・atLimit 常に false）*/}
          <ArtistManageSection
            artists={artists}
            onEdit={setEditingArtist}
            onDelete={setDeletingArtist}
            isPremium={isPremium}
            atLimit={!isPremium && artists.length >= FREE_ARTIST_LIMIT}
            onAdd={() => {
              if (!isPremium && artists.length >= FREE_ARTIST_LIMIT) {
                setShowPremiumSheet(true)
              } else {
                setIsAdding(true)
              }
            }}
          />

          {/* 表示 */}
          <SettingsSection label="表示">
            <StyleSelector />
            <SettingsDivider indent={0} />
            <SettingsToggleRow
              icon={<SettingsIconWrap bg="rgba(219,96,80,0.12)" color="var(--color-encore-error)"><Flag size={15} weight="regular" /></SettingsIconWrap>}
              label="国民の休日を表示"
              description="カレンダーの祝日を赤色で表示します"
              value={showHolidaysEnabled}
              onChange={(v) => {
                setShowHolidays(v)
                showToast(v ? '祝日表示をオンにしました' : '祝日表示をオフにしました')
              }}
            />
          </SettingsSection>

          {/* 通知 */}
          <SettingsSection label="通知">
            <SettingsToggleRow
              icon={<SettingsIconWrap><Bell size={15} weight="regular" /></SettingsIconWrap>}
              label="公演前日通知"
              description="公演の前日にリマインドを送ります"
              value={notifPrev}
              onChange={setNotifPrev}
            />
            <SettingsDivider />
            <SettingsToggleRow
              icon={<SettingsIconWrap><Bell size={15} weight="regular" /></SettingsIconWrap>}
              label="公演当日通知"
              description="当日の朝にリマインドを送ります"
              value={notifDay}
              onChange={setNotifDay}
            />
            <SettingsDivider />
            <SettingsToggleRow
              icon={<SettingsIconWrap><Bell size={15} weight="regular" /></SettingsIconWrap>}
              label="抽選結果通知"
              description="抽選結果が出たらお知らせします"
              value={notifRaffle}
              onChange={setNotifRaffle}
            />
            <SettingsDivider />
            <SettingsToggleRow
              icon={<SettingsIconWrap><Bell size={15} weight="regular" /></SettingsIconWrap>}
              label="入金期限通知"
              description="チケット代金の支払い期限をお知らせします"
              value={notifPayment}
              onChange={setNotifPayment}
            />
          </SettingsSection>

          {/* バックアップ */}
          <SettingsSection label="バックアップ">
            <SettingsRow
              icon={<SettingsIconWrap bg="rgba(175,82,222,0.15)" color="#AF52DE"><CloudArrowDown size={15} weight="regular" /></SettingsIconWrap>}
              label="iCloudにバックアップ"
              description="データをiCloudに保存"
              onClick={() => showToast('iCloud バックアップは App Store 版で利用可能になります')}
            />
            <SettingsDivider />
            <SettingsRow
              icon={<SettingsIconWrap bg="rgba(175,82,222,0.15)" color="#AF52DE"><CloudArrowUp size={15} weight="regular" /></SettingsIconWrap>}
              label="iCloudから復元"
              description="iCloudからデータを取得"
              onClick={() => showToast('iCloud 復元は App Store 版で利用可能になります')}
            />
            <BackupNote />
          </SettingsSection>

          {/* データ管理（Premium 限定・エクスポート） */}
          {isPremium && (
            <SettingsSection label="データ管理">
              <SettingsRow
                icon={<SettingsIconWrap bg="rgba(26,58,45,0.10)" color="var(--color-encore-green)"><UploadSimple size={15} weight="regular" /></SettingsIconWrap>}
                label="すべてのデータをエクスポート"
                description=".json でライブ・アーティスト・セットリストを書き出し"
                onClick={() => {
                  const payload = buildExportPayload({
                    lives,
                    artists,
                    setlists: getAllSetlists(),
                  })
                  const filename = buildExportFilename()
                  downloadExportBlob(payload, filename)
                  showToast(`バックアップを保存しました（${formatExportSummary(payload.stats)}）`)
                }}
              />
            </SettingsSection>
          )}

          {/* サポート */}
          <SettingsSection label="サポート">
            <SettingsRow
              icon={<SettingsIconWrap><Envelope size={15} weight="regular" /></SettingsIconWrap>}
              label="お問い合わせ"
              onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdZ9wyVHTzeiWjt2nxXk_FMZhQ_MxeIStcXDSwWPBuyHTILLw/viewform', '_blank')}
            />
            <SettingsDivider />
            <SettingsRow
              icon={<SettingsIconWrap><FileText size={15} weight="regular" /></SettingsIconWrap>}
              label="利用規約"
              onClick={() => router.push('/grape/settings/terms/')}
            />
            <SettingsDivider />
            <SettingsRow
              icon={<SettingsIconWrap><ShieldCheck size={15} weight="regular" /></SettingsIconWrap>}
              label="プライバシーポリシー"
              onClick={() => router.push('/grape/settings/privacy/')}
            />
            <SettingsDivider />
            <SettingsRow
              icon={<SettingsIconWrap><Info size={15} weight="regular" /></SettingsIconWrap>}
              label="バージョン情報"
              value={APP_VERSION}
              showChevron={false}
            />
          </SettingsSection>

          {/* Premium */}
          <div style={{ marginBottom: 32 }}>
            <div style={{
              padding: '0 20px 8px',
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 12, fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: 'var(--color-encore-text-muted)',
            }}>
              Premium
            </div>
            <PremiumInfoCard isPremium={isPremium} onShowPremium={() => setShowPremiumSheet(true)} />
          </div>

          {/* 開発者メニュー（Dev only。RevenueCat 統合時に削除） */}
          <SettingsSection label="開発者メニュー（DEV）">
            <SettingsToggleRow
              icon={<SettingsIconWrap bg="rgba(192,138,74,0.14)" color="var(--color-encore-amber)"><Crown size={15} weight="regular" /></SettingsIconWrap>}
              label="Premium 切替（Dev）"
              description="実機・各ブラウザごとに localStorage に保存"
              value={isPremium}
              onChange={(v) => {
                setIsPremium(v)
                showToast(v ? 'Premium 化しました（Dev）' : 'Free へ戻しました（Dev）')
              }}
            />
            <SettingsDivider />
            <SettingsRow
              icon={<SettingsIconWrap bg="rgba(219,96,80,0.12)" color="var(--color-encore-error)"><Trash size={15} weight="regular" /></SettingsIconWrap>}
              label="空の状態で起動（Dev）"
              description="全データを消去して「インストール直後」の状態を再現"
              onClick={() => {
                if (!confirm('全イベント・アーティスト・セットリスト・キャッシュを削除して、空の状態でリロードします。よろしいですか？')) return
                // localStorage: grape-* と encore-* をすべて消去
                Object.keys(localStorage).forEach(k => {
                  if (k.startsWith('grape') || k.startsWith('encore')) localStorage.removeItem(k)
                })
                // 空起動フラグを立ててリロード
                localStorage.setItem('grape-no-seed', 'true')
                // IndexedDB（artwork キャッシュ）も削除
                try { indexedDB.deleteDatabase('grape-artwork') } catch {}
                location.reload()
              }}
            />
            <SettingsDivider />
            <SettingsRow
              icon={<SettingsIconWrap bg="rgba(26,58,45,0.10)" color="var(--color-encore-green)"><ArrowSquareOut size={15} weight="regular" /></SettingsIconWrap>}
              label="デモデータで再起動（Dev）"
              description="空起動フラグを解除して、シードデータでリロード"
              onClick={() => {
                if (!confirm('現在のデータを消去して、シード（デモ）データでリロードします。よろしいですか？')) return
                Object.keys(localStorage).forEach(k => {
                  if (k.startsWith('grape') || k.startsWith('encore')) localStorage.removeItem(k)
                })
                try { indexedDB.deleteDatabase('grape-artwork') } catch {}
                location.reload()
              }}
            />
          </SettingsSection>

        </div>

        {/* ── タブバー ── */}
        <div style={{
          height: 68, background: 'var(--color-encore-bg)',
          borderTop: '1px solid var(--color-encore-border-light)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-around', padding: '8px 4px 0', flexShrink: 0,
        }}>
          {TAB_ITEMS.map(({ key, label, Icon, href }) => {
            const isActive = key === 'settings'
            const color = isActive ? 'var(--color-encore-amber)' : 'var(--color-encore-green)'
            return (
              <Link key={key} href={href} style={{
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
              </Link>
            )
          })}
        </div>

        {/* ── アーティスト編集シート ── */}
        {editingArtist && (
          <ArtistEditSheet
            artist={editingArtist}
            onSave={handleSaveEdit}
            onClose={() => setEditingArtist(null)}
          />
        )}

        {/* ── アーティスト追加シート ── */}
        {isAdding && (
          <ArtistEditSheet
            artist={{ id: `artist-${Date.now()}`, name: '' }}
            isNew
            onSave={handleSaveNew}
            onClose={() => setIsAdding(false)}
          />
        )}

        {/* ── 削除確認ダイアログ（共通 ArtistDeleteConfirmDialog 使用）── */}
        {deletingArtist && (
          <ArtistDeleteConfirmDialog
            artistName={deletingArtist.name}
            linkedEventCount={lives.filter(l => l.artist === deletingArtist.name).length}
            onConfirmWithEvents={handleDeleteWithEvents}
            onConfirmKeepEvents={handleDeleteKeepEvents}
            onCancel={() => setDeletingArtist(null)}
          />
        )}

        {/* ── Premium アップグレードシート ── */}
        {showPremiumSheet && (
          <PremiumUpgradeSheet onClose={() => setShowPremiumSheet(false)} />
        )}

        {/* ── プラン情報モーダル（Free のみ。Premium は直接 PremiumUpgradeSheet へ）── */}
        {showPlanInfo && !isPremium && (
          <PlanInfoModal
            onClose={() => setShowPlanInfo(false)}
            onUpgrade={() => setShowPremiumSheet(true)}
          />
        )}

        {/* ── 保存完了トースト ── */}
        {savedToast && (
          <div style={{
            position: 'absolute', top: 72, left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-encore-green)',
            borderRadius: 999, padding: '8px 18px',
            display: 'flex', alignItems: 'center', gap: 7,
            zIndex: 80,
            boxShadow: '0 4px 16px rgba(26,58,45,0.25)',
          }}>
            <Check size={14} weight="bold" color="#fff" />
            <span style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}>
              保存しました
            </span>
          </div>
        )}

    </PhoneFrame>
  )
}
