'use client'

/**
 * GRAPE · Setlist Feature · Visual Mocks
 *
 * 実装前のデザインリファレンス専用ページ。本体コンポーネントとは独立。
 * URL: /setlist-mocks
 *
 * 盛り込んだ内容:
 *   P0  SetlistEditorSheet (4 バリエーション)
 *   P1  EventPreviewScreen の Setlist セクション (4 バリエーション)
 *   P1  SetlistImportSheet / OCR 5 ステージ
 *   P2  Report · Songs セクション (5 カード + Free ティーザー)
 *   P2  Settings · データ管理
 *
 * デザイン方向性:
 *   "Concert Program × Editorial Journal"
 *   - 大きなタビュラー数字（ライブプログラム風）
 *   - ドットリーダー区切り線（目次風 dividers）
 *   - 和英併記の見出し（Setlist · セットリスト）
 *   - アンバーは「金箔」のように特別な瞬間のみに使う
 *   - 一期一会カードは漢字自体がビジュアルセンターピース
 */

import React from 'react'
import {
  X, Plus, List as ListIcon, DotsSixVertical, Image as ImageIcon,
  CaretRight, Sparkle, Lock, Note, Export, ArrowsClockwise, Check, Camera,
  MagnifyingGlass, WarningCircle, MusicNotes, Microphone, Gear,
} from '@phosphor-icons/react'

// ─── Shared tokens ────────────────────────────────────────────────────────

const EN = 'var(--font-google-sans), sans-serif'
const JA = 'var(--font-google-sans), var(--font-noto-jp), sans-serif'

const t = {
  display:   { fontFamily: EN, fontSize: 32, fontWeight: 700, color: 'var(--color-encore-green)', letterSpacing: '-0.01em' } as React.CSSProperties,
  title:     { fontFamily: EN, fontSize: 24, fontWeight: 700, color: 'var(--color-encore-green)' } as React.CSSProperties,
  heading:   { fontFamily: JA, fontSize: 18, fontWeight: 700, color: 'var(--color-encore-green)' } as React.CSSProperties,
  section:   { fontFamily: JA, fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)' } as React.CSSProperties,
  sectionSM: { fontFamily: JA, fontSize: 14, fontWeight: 700, color: 'var(--color-encore-green)' } as React.CSSProperties,
  body:      { fontFamily: JA, fontSize: 13, fontWeight: 400, color: 'var(--color-encore-green)' } as React.CSSProperties,
  bodySM:    { fontFamily: JA, fontSize: 12, fontWeight: 400, color: 'var(--color-encore-green)' } as React.CSSProperties,
  caption:   { fontFamily: EN, fontSize: 11, fontWeight: 400, color: 'var(--color-encore-green)' } as React.CSSProperties,
  captionMuted: { fontFamily: EN, fontSize: 11, fontWeight: 400, color: 'var(--color-encore-text-muted)' } as React.CSSProperties,
  sub:       { fontFamily: JA, fontSize: 12, fontWeight: 400, color: 'var(--color-encore-text-sub)' } as React.CSSProperties,
}

// squircle (iOS-like rounded) path for 'clipPath' use
function squirclePath(s: number) {
  const r = s / 2
  const k = r * 0.65
  return `M ${s} ${r} C ${s} ${r + k} ${r + k} ${s} ${r} ${s} C ${r - k} ${s} 0 ${r + k} 0 ${r} C 0 ${r - k} ${r - k} 0 ${r} 0 C ${r + k} 0 ${s} ${r - k} ${s} ${r} Z`
}

// ─── Demo data ────────────────────────────────────────────────────────────

const ART = {
  somei:   '/grape/artist/soloA_ssw.png',
  shiyui:  '/grape/artist/soloB_RB.png',
  yurika:  '/grape/artist/soloC.png',
  koharu:  '/grape/artist/soloD.png',
  covers: {
    acoustic: '/grape/cover/cover-acoustic.png',
    indie:    '/grape/cover/cover-indie.png',
    ssw:      '/grape/cover/cover-ssw.png',
    group:    '/grape/cover/cover-group.png',
  },
}

type Row =
  | { kind: 'song'; title: string; artist?: string; art?: string; debut?: boolean; lowConf?: boolean; cover?: string; unknown?: boolean; dragging?: boolean }
  | { kind: 'mc'; note?: string }
  | { kind: 'divider'; label: string }

const SETLIST_SOLO: Row[] = [
  { kind: 'song', title: '雨宿りサイダー', art: ART.covers.indie },
  { kind: 'song', title: '朝凪ボイス', art: ART.covers.ssw },
  { kind: 'song', title: 'Eclipse Bay' },
  { kind: 'mc', note: '久しぶりのここに帰ってきました…' },
  { kind: 'song', title: '影絵の森' },
  { kind: 'song', title: '十八時の特等席', art: ART.covers.acoustic },
  { kind: 'song', title: '三拍子のラブレター', art: ART.covers.ssw },
  { kind: 'divider', label: 'ENCORE' },
  { kind: 'song', title: 'Satellite Diary', art: ART.covers.indie, debut: true },
]

const SETLIST_TAIBAN: Row[] = [
  { kind: 'divider', label: '〜 somei 〜' },
  { kind: 'song', title: '朝凪ボイス', artist: 'somei', art: ART.somei },
  { kind: 'song', title: '十八時の特等席', artist: 'somei', art: ART.somei },
  { kind: 'song', title: '三拍子のラブレター', artist: 'somei', art: ART.somei },
  { kind: 'divider', label: '〜 シユイ 〜' },
  { kind: 'song', title: 'Neon Drive', artist: 'シユイ', art: ART.shiyui },
  { kind: 'song', title: '薄明ガーデン', artist: 'シユイ', art: ART.shiyui },
  { kind: 'song', title: 'Eclipse Bay', artist: 'シユイ', cover: 'FRAGMENTS' },
  { kind: 'divider', label: '〜 優利香 〜' },
  { kind: 'song', title: '雨宿りサイダー', artist: '優利香', art: ART.yurika },
  { kind: 'song', title: '—', artist: '不明', unknown: true },
]

// ─── Tiny primitives ──────────────────────────────────────────────────────

function MockPhone({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, flexShrink: 0 }}>
      <div style={{
        width: 393, height: 852,
        background: 'var(--color-encore-bg)',
        borderRadius: 44,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 28px 80px rgba(0,0,0,0.28), 0 0 0 2px #1a1a1a',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {children}
      </div>
      <div style={{
        fontFamily: EN,
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--color-encore-text-sub)',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        textAlign: 'center',
        maxWidth: 393,
      }}>
        {label}
      </div>
    </div>
  )
}

function StatusBar() {
  return (
    <div style={{
      height: 44,
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: EN,
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--color-encore-green)',
      flexShrink: 0,
    }}>
      <span>19:17</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', color: 'var(--color-encore-green)' }}>
        <svg width="16" height="10" viewBox="0 0 16 10"><path d="M0 8 L2 8 L2 10 L0 10 Z M4 6 L6 6 L6 10 L4 10 Z M8 3 L10 3 L10 10 L8 10 Z M12 0 L14 0 L14 10 L12 10 Z" fill="currentColor"/></svg>
        <svg width="22" height="11" viewBox="0 0 22 11"><rect x="0.5" y="0.5" width="18" height="10" rx="2" fill="none" stroke="currentColor"/><rect x="2" y="2" width="15" height="7" rx="1" fill="currentColor"/><rect x="19.5" y="3.5" width="1.5" height="4" rx="0.3" fill="currentColor"/></svg>
      </div>
    </div>
  )
}

/** ドットリーダー — 目次風の divider */
function DotLeader({ color = 'var(--color-encore-border)', flex = 1 }: { color?: string; flex?: number }) {
  return (
    <span
      aria-hidden
      style={{
        flex,
        height: 6,
        backgroundImage: `radial-gradient(circle, ${color} 0.7px, transparent 1px)`,
        backgroundSize: '6px 6px',
        backgroundRepeat: 'repeat-x',
        backgroundPosition: 'center',
      }}
    />
  )
}

function PremiumStamp({ small }: { small?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      padding: small ? '1px 5px 1px 4px' : '2px 7px 2px 5px',
      background: 'rgba(192,138,74,0.12)',
      border: '1px solid rgba(192,138,74,0.32)',
      borderRadius: 999,
      color: 'var(--color-encore-amber)',
      fontFamily: EN,
      fontSize: small ? 8.5 : 9,
      fontWeight: 700,
      letterSpacing: '0.14em',
      lineHeight: 1,
    }}>
      <Sparkle size={small ? 8 : 9} weight="fill" />
      PREMIUM
    </span>
  )
}

// ─── P0 · SetlistEditorSheet ──────────────────────────────────────────────

function EditorHeader() {
  return (
    <div style={{
      padding: '10px 16px 14px',
      borderBottom: '1px solid var(--color-encore-border-light)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <button style={{
          width: 32, height: 32, borderRadius: 999,
          background: 'var(--color-encore-bg-section)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={15} weight="bold" color="var(--color-encore-green)" />
        </button>
        <button style={{
          padding: '8px 18px',
          borderRadius: 999,
          background: 'var(--color-encore-green)',
          color: 'var(--color-encore-white)',
          border: 'none', cursor: 'pointer',
          fontFamily: JA, fontSize: 13, fontWeight: 700,
        }}>保存</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
        <span style={{ ...t.title, fontSize: 22, letterSpacing: '-0.01em' }}>Setlist</span>
        <span style={{ ...t.sub, fontSize: 12, letterSpacing: '0.04em' }}>セットリスト</span>
      </div>
      <div style={{ ...t.captionMuted, marginTop: 2, letterSpacing: '0.02em' }}>
        4月21日（火）· LIVE STUDIO LODGE
      </div>
    </div>
  )
}

function ArtistSegment({ active }: { active: string }) {
  const segs = [
    { key: 'all', label: 'すべて', count: 9 },
    { key: 'somei', label: 'somei', count: 3 },
    { key: 'shiyui', label: 'シユイ', count: 3 },
    { key: 'yurika', label: '優利香', count: 2 },
    { key: 'unknown', label: '不明', count: 1 },
  ]
  return (
    <div style={{
      display: 'flex',
      gap: 6,
      padding: '10px 16px',
      overflowX: 'auto',
      borderBottom: '1px solid var(--color-encore-border-light)',
      flexShrink: 0,
    }}>
      {segs.map(s => {
        const isOn = s.key === active
        return (
          <span key={s.key} style={{
            padding: '6px 12px',
            borderRadius: 999,
            background: isOn ? 'var(--color-encore-green)' : 'transparent',
            color: isOn ? 'var(--color-encore-white)' : 'var(--color-encore-green)',
            border: isOn ? 'none' : '1px solid var(--color-encore-border)',
            fontFamily: JA, fontSize: 12, fontWeight: 700,
            whiteSpace: 'nowrap',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            {s.label}
            <span style={{
              fontFamily: EN,
              fontSize: 10,
              opacity: isOn ? 0.85 : 0.5,
              fontVariantNumeric: 'tabular-nums',
            }}>{s.count}</span>
          </span>
        )
      })}
    </div>
  )
}

/** 曲行。Number + Art + Title + Handle のエディタ風。ライン guide 付き */
function SongRow({
  index, art, title, artist, cover, unknown, lowConf, debut, dragging, preview, taiban,
}: {
  index: number | string
  art?: string
  title: string
  artist?: string
  cover?: string
  unknown?: boolean
  lowConf?: boolean
  debut?: boolean
  dragging?: boolean
  preview?: boolean        // true: preview (no drag handle), false: editor
  taiban?: boolean         // show performer chip
}) {
  const muted = unknown || lowConf
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 16px',
      background: dragging
        ? 'var(--color-encore-white)'
        : lowConf
          ? 'rgba(192,138,74,0.06)'
          : 'transparent',
      borderLeft: lowConf ? '2px solid var(--color-encore-amber)' : '2px solid transparent',
      borderRadius: dragging ? 10 : 0,
      boxShadow: dragging
        ? '0 10px 28px rgba(26,58,45,0.18), 0 0 0 1px rgba(26,58,45,0.05)'
        : 'none',
      transform: dragging ? 'translateY(-2px) rotate(-0.8deg)' : 'none',
      position: 'relative',
      opacity: muted ? 0.78 : 1,
    }}>
      {/* position number */}
      <div style={{
        width: 28,
        flexShrink: 0,
        textAlign: 'right',
        fontFamily: EN,
        fontSize: 19,
        fontWeight: 700,
        color: muted ? 'var(--color-encore-text-muted)' : 'var(--color-encore-green)',
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        {index}
      </div>

      {/* artwork */}
      <div style={{
        width: 46, height: 46,
        clipPath: `path("${squirclePath(46)}")`,
        background: art
          ? `url(${art}) center/cover`
          : unknown
            ? 'repeating-linear-gradient(45deg, rgba(26,58,45,0.04), rgba(26,58,45,0.04) 4px, rgba(26,58,45,0.08) 4px, rgba(26,58,45,0.08) 8px)'
            : 'var(--color-encore-bg-section)',
        flexShrink: 0,
        position: 'relative',
        boxShadow: art ? 'inset 0 0 0 1px rgba(0,0,0,0.06)' : 'none',
      }}>
        {!art && !unknown && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-encore-text-muted)',
          }}>
            <MusicNotes size={18} weight="regular" />
          </div>
        )}
        {unknown && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-encore-text-muted)',
            fontFamily: EN, fontSize: 20, fontWeight: 700,
          }}>
            ?
          </div>
        )}
      </div>

      {/* title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: JA,
          fontSize: 14.5,
          fontWeight: 700,
          color: muted ? 'var(--color-encore-text-sub)' : 'var(--color-encore-green)',
          letterSpacing: '-0.005em',
          lineHeight: 1.25,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {unknown ? '（聴き逃し / 不明）' : title}
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 3, flexWrap: 'wrap' }}>
          {taiban && artist && !unknown && (
            <span style={{
              fontFamily: JA,
              fontSize: 10.5,
              fontWeight: 700,
              color: 'var(--color-encore-green-muted)',
              padding: '1px 6px',
              borderRadius: 4,
              background: 'var(--color-encore-bg-section)',
            }}>
              {artist}
            </span>
          )}
          {cover && (
            <span style={{
              fontFamily: JA,
              fontSize: 10.5,
              color: 'var(--color-encore-text-sub)',
            }}>
              cover · <span style={{ fontWeight: 700, color: 'var(--color-encore-green)' }}>{cover}</span>
            </span>
          )}
          {debut && (
            <span style={{
              fontFamily: JA,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--color-encore-amber)',
              letterSpacing: '0.08em',
            }}>
              ◆ 初披露
            </span>
          )}
          {lowConf && (
            <span style={{
              fontFamily: JA,
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--color-encore-amber)',
              padding: '0.5px 5px',
              borderRadius: 4,
              border: '1px solid rgba(192,138,74,0.35)',
              background: 'rgba(192,138,74,0.08)',
            }}>
              要確認
            </span>
          )}
        </div>
      </div>

      {/* drag handle or chevron */}
      {!preview && (
        <div style={{
          color: dragging ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
          flexShrink: 0,
          padding: 4,
        }}>
          <DotsSixVertical size={18} weight="bold" />
        </div>
      )}
    </div>
  )
}

function DividerRow({ label, tone = 'default', small }: { label: string; tone?: 'default' | 'encore' | 'mc' | 'artist'; small?: boolean }) {
  const isEncore = tone === 'encore'
  const isMC     = tone === 'mc'
  const color    = isEncore ? 'var(--color-encore-amber)' : 'var(--color-encore-green-muted)'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: small ? '10px 16px 8px' : '16px 16px 12px',
    }}>
      <DotLeader color={isEncore ? 'rgba(192,138,74,0.55)' : 'var(--color-encore-border)'} />
      <span style={{
        fontFamily: EN,
        fontSize: isEncore ? 12 : 11,
        fontWeight: 700,
        color,
        letterSpacing: isEncore ? '0.26em' : '0.18em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        padding: '2px 4px',
      }}>
        {isMC ? 'MC' : label}
      </span>
      <DotLeader color={isEncore ? 'rgba(192,138,74,0.55)' : 'var(--color-encore-border)'} />
    </div>
  )
}

function MCRow({ note }: { note?: string }) {
  return (
    <div style={{ padding: '4px 16px 12px 56px' }}>
      <div style={{
        padding: '8px 12px',
        background: 'var(--color-encore-bg-section)',
        borderRadius: 8,
        border: '1px dashed var(--color-encore-border)',
        display: 'flex', gap: 8, alignItems: 'flex-start',
      }}>
        <Microphone size={13} weight="regular" color="var(--color-encore-text-sub)" style={{ marginTop: 1, flexShrink: 0 }} />
        <span style={{
          ...t.body, fontSize: 12, color: 'var(--color-encore-text-sub)',
          fontStyle: note ? 'normal' : 'italic',
          lineHeight: 1.45,
          flex: 1,
        }}>
          {note ?? 'MC のメモを追加…'}
        </span>
      </div>
    </div>
  )
}

function AddButtonsRow() {
  const btns = [
    { icon: <Plus size={13} weight="bold" />, label: '曲を追加', primary: true },
    { icon: <Microphone size={12} weight="regular" />, label: 'MC' },
    { icon: <Sparkle size={12} weight="regular" />, label: 'ENCORE' },
  ]
  return (
    <div style={{ padding: '8px 16px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {btns.map((b, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '8px 14px',
          borderRadius: 999,
          fontFamily: JA, fontSize: 12, fontWeight: 700,
          background: b.primary ? 'var(--color-encore-green)' : 'transparent',
          color: b.primary ? 'var(--color-encore-white)' : 'var(--color-encore-green)',
          border: b.primary ? 'none' : '1px solid var(--color-encore-border)',
        }}>
          {b.icon}
          {b.label}
        </span>
      ))}
    </div>
  )
}

function MemoryModeToggle({ on }: { on?: boolean }) {
  return (
    <div style={{
      margin: '0 16px 12px',
      padding: '12px 14px',
      background: on ? 'rgba(192,138,74,0.08)' : 'var(--color-encore-bg-section)',
      border: on ? '1px solid rgba(192,138,74,0.3)' : '1px solid transparent',
      borderRadius: 10,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <div style={{
        fontFamily: JA, fontSize: 13, fontWeight: 700,
        color: on ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
      }}>
        うろ覚えで記録
      </div>
      <span style={{ ...t.sub, fontSize: 11, flex: 1, minWidth: 0 }}>
        記憶モードの曲は集計で薄く表示
      </span>
      <span style={{
        width: 34, height: 20, borderRadius: 999,
        background: on ? 'var(--color-encore-amber)' : 'var(--color-encore-border)',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}>
        <span style={{
          position: 'absolute',
          top: 2,
          left: on ? 16 : 2,
          width: 16, height: 16, borderRadius: '50%',
          background: 'var(--color-encore-white)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
          transition: 'left 0.2s',
        }} />
      </span>
    </div>
  )
}

function EditorFooter() {
  return (
    <div style={{
      padding: '10px 16px 22px',
      borderTop: '1px solid var(--color-encore-border-light)',
      background: 'var(--color-encore-bg)',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '13px 16px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, rgba(192,138,74,0.14), rgba(192,138,74,0.05))',
        border: '1px solid rgba(192,138,74,0.28)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle pattern */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: `repeating-linear-gradient(135deg, rgba(192,138,74,0.04) 0 1px, transparent 1px 12px)`,
          pointerEvents: 'none',
        }} />
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--color-encore-white)',
          border: '1px solid rgba(192,138,74,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
        }}>
          <Camera size={18} weight="regular" color="var(--color-encore-amber)" />
        </div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ ...t.sectionSM, fontSize: 13, color: 'var(--color-encore-green)' }}>画像から取り込む</span>
            <PremiumStamp small />
          </div>
          <div style={{ ...t.sub, fontSize: 11 }}>写真1枚で AI が自動抽出</div>
        </div>
        <CaretRight size={14} weight="bold" color="var(--color-encore-amber)" style={{ flexShrink: 0, position: 'relative' }} />
      </div>
    </div>
  )
}

function SetlistEditorSheet({ variant }: { variant: 'solo' | 'taiban' | 'dragging' | 'uncertain' }) {
  const rows = variant === 'taiban' ? SETLIST_TAIBAN : SETLIST_SOLO
  const draggingIdx = variant === 'dragging' ? 4 : -1

  // OCR の lowConf バリアント: 一部の行に信頼度低いマークを付ける
  const markLowConf = (i: number) => variant === 'uncertain' && (i === 2 || i === 6)

  let posCounter = 0

  return (
    <>
      <StatusBar />
      <EditorHeader />
      {variant === 'taiban' && <ArtistSegment active="all" />}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {/* spine guide */}
        <div aria-hidden style={{
          position: 'absolute',
          left: 49, top: 0, bottom: 0,
          width: 1,
          background: 'var(--color-encore-border-light)',
        }} />
        <div style={{ position: 'relative', paddingTop: 2 }}>
          {rows.map((r, i) => {
            if (r.kind === 'divider') {
              const isEncore = r.label === 'ENCORE' || r.label.includes('W-ENCORE')
              return (
                <DividerRow
                  key={i}
                  label={r.label}
                  tone={isEncore ? 'encore' : 'artist'}
                />
              )
            }
            if (r.kind === 'mc') {
              return (
                <React.Fragment key={i}>
                  <DividerRow label="MC" tone="mc" small />
                  <MCRow note={r.note} />
                </React.Fragment>
              )
            }
            posCounter++
            return (
              <SongRow
                key={i}
                index={posCounter < 10 ? `0${posCounter}` : String(posCounter)}
                art={r.art}
                title={r.title}
                artist={r.artist}
                cover={r.cover}
                unknown={r.unknown}
                lowConf={markLowConf(i)}
                debut={r.debut}
                dragging={i === draggingIdx}
                taiban={variant === 'taiban'}
              />
            )
          })}
        </div>
        <AddButtonsRow />
      </div>
      <MemoryModeToggle on={variant === 'uncertain'} />
      <EditorFooter />
    </>
  )
}

// ─── P1 · EventPreviewScreen · Setlist セクション ─────────────────────────

function EventPreviewHeader() {
  // abbreviated faux EventPreviewScreen header
  return (
    <>
      <StatusBar />
      <div style={{
        height: 200,
        background: `linear-gradient(140deg, rgba(192,138,74,0.35), rgba(26,58,45,0.7)), url(${ART.covers.ssw}) center/cover`,
        position: 'relative',
        flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 14, left: 14,
          width: 32, height: 32, borderRadius: 999,
          background: 'rgba(0,0,0,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={15} weight="bold" color="#fff" />
        </div>
        <div style={{
          position: 'absolute', bottom: 12, left: 16,
          display: 'flex', gap: 6,
        }}>
          <span style={{
            background: 'rgba(0,0,0,0.38)', color: '#fff',
            fontFamily: JA, fontSize: 12, fontWeight: 700,
            padding: '5px 13px', borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.15)',
          }}>ワンマン</span>
          <span style={{
            background: 'var(--color-encore-green)', color: '#fff',
            fontFamily: JA, fontSize: 12, fontWeight: 700,
            padding: '5px 13px', borderRadius: 999,
          }}>参戦済み</span>
        </div>
      </div>
      <div style={{ padding: '18px 20px 6px' }}>
        <div style={{ ...t.heading, fontSize: 20, letterSpacing: '-0.005em' }}>
          somei 1st ONE MAN LIVE
        </div>
        <div style={{ ...t.sub, fontSize: 12, marginTop: 2 }}>
          2026年4月21日（火）· LIVE STUDIO LODGE
        </div>
      </div>
    </>
  )
}

function PreviewSetlistSectionHeader({ count }: { count?: number }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      padding: '0 20px',
      marginBottom: 12,
      marginTop: 18,
    }}>
      <MusicNotes size={15} weight="regular" color="var(--color-encore-green)" style={{ transform: 'translateY(2px)', marginRight: 8 }} />
      <span style={{ ...t.section, fontSize: 15, marginRight: 8 }}>Setlist</span>
      <span style={{ ...t.sub, fontSize: 11, letterSpacing: '0.04em' }}>セットリスト</span>
      {typeof count === 'number' && (
        <span style={{
          marginLeft: 'auto',
          fontFamily: EN, fontSize: 11, fontWeight: 700,
          color: 'var(--color-encore-text-sub)',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count}曲
        </span>
      )}
    </div>
  )
}

function SetlistSectionPremiumWith() {
  return (
    <>
      <EventPreviewHeader />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <PreviewSetlistSectionHeader count={9} />
        <div style={{ position: 'relative' }}>
          <div aria-hidden style={{
            position: 'absolute', left: 49, top: 0, bottom: 0,
            width: 1, background: 'var(--color-encore-border-light)',
          }} />
          {SETLIST_SOLO.slice(0, 5).map((r, i) => {
            if (r.kind !== 'song') return null
            return <SongRow key={i} index={`0${i + 1}`} title={r.title} art={r.art} preview />
          })}
        </div>
        <div style={{ padding: '6px 20px 0' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '8px 14px',
            borderRadius: 999,
            background: 'var(--color-encore-bg-section)',
            fontFamily: JA, fontSize: 12, fontWeight: 700,
            color: 'var(--color-encore-green)',
          }}>
            全 9 曲を見る
            <CaretRight size={12} weight="bold" />
          </div>
        </div>
      </div>
    </>
  )
}

function SetlistSectionPremiumEmpty() {
  return (
    <>
      <EventPreviewHeader />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <PreviewSetlistSectionHeader />
        <div style={{ padding: '0 20px' }}>
          <div style={{
            padding: '22px 18px 20px',
            background: 'var(--color-encore-bg)',
            border: '1px dashed var(--color-encore-border)',
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'var(--color-encore-bg-section)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <MusicNotes size={20} weight="regular" color="var(--color-encore-green)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...t.section, fontSize: 14, marginBottom: 3 }}>
                あの日、何を聴いたっけ？
              </div>
              <div style={{ ...t.sub, fontSize: 12, lineHeight: 1.5 }}>
                いまのうちに、残しておきませんか。
              </div>
            </div>
          </div>
          <div style={{
            marginTop: 10,
            padding: '12px 16px',
            borderRadius: 999,
            background: 'var(--color-encore-green)',
            color: 'var(--color-encore-white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            fontFamily: JA, fontSize: 14, fontWeight: 700,
          }}>
            <Plus size={14} weight="bold" />
            セットリストを記録する
          </div>
        </div>
      </div>
    </>
  )
}

function SetlistSectionFreeLock() {
  return (
    <>
      <EventPreviewHeader />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <PreviewSetlistSectionHeader />
        <div style={{ padding: '0 20px' }}>
          <div style={{
            padding: '24px 20px 22px',
            background: 'linear-gradient(180deg, rgba(192,138,74,0.12), rgba(192,138,74,0.04))',
            border: '1px solid rgba(192,138,74,0.3)',
            borderRadius: 14,
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* subtle diagonal pattern */}
            <div aria-hidden style={{
              position: 'absolute', inset: 0,
              backgroundImage: `repeating-linear-gradient(135deg, rgba(192,138,74,0.06) 0 1px, transparent 1px 14px)`,
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--color-encore-white)',
                border: '1px solid rgba(192,138,74,0.28)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Lock size={18} weight="regular" color="var(--color-encore-amber)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  ...t.section, fontSize: 15, marginBottom: 4,
                  letterSpacing: '-0.005em',
                }}>
                  あのライブで聴いた曲、覚えてる？
                </div>
                <div style={{ ...t.sub, fontSize: 12.5, lineHeight: 1.55 }}>
                  Premium で、思い出をセットリストに残せます。
                  画像1枚から自動抽出、アートワーク付きで保存。
                </div>
                <div style={{
                  marginTop: 14,
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px',
                  borderRadius: 999,
                  background: 'var(--color-encore-amber)',
                  color: 'var(--color-encore-white)',
                  fontFamily: JA, fontSize: 13, fontWeight: 700,
                }}>
                  <Sparkle size={12} weight="fill" />
                  Premium にアップグレード
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function SetlistSectionFreeFuture() {
  // 未来ライブ = セクション非表示 (空の状態として、上部のみ表示)
  return (
    <>
      <EventPreviewHeader />
      <div style={{ flex: 1, padding: '18px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ ...t.sub, fontSize: 12 }}>
          [未来ライブ — セットリストセクションは表示しない]
        </div>
        <div style={{
          padding: '14px 16px',
          background: 'var(--color-encore-bg-section)',
          borderRadius: 10,
          ...t.bodySM,
          color: 'var(--color-encore-text-sub)',
          lineHeight: 1.6,
        }}>
          未来のライブでは Setlist セクション自体を描画しない。<br/>
          記録対象は「過去に行ったライブ」だけなので、視覚ノイズを減らす。
        </div>
      </div>
    </>
  )
}

// ─── P1 · SetlistImportSheet (OCR) · 5 stages ─────────────────────────────

function OCRHeader({ title, sub, stage }: { title: string; sub?: string; stage: string }) {
  return (
    <div style={{
      padding: '12px 16px 14px',
      borderBottom: '1px solid var(--color-encore-border-light)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <button style={{
          width: 32, height: 32, borderRadius: 999,
          background: 'var(--color-encore-bg-section)',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <X size={15} weight="bold" color="var(--color-encore-green)" />
        </button>
        <span style={{
          fontFamily: EN, fontSize: 10, fontWeight: 700,
          color: 'var(--color-encore-text-sub)',
          letterSpacing: '0.18em',
        }}>
          {stage}
        </span>
        <span style={{ width: 32 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ ...t.title, fontSize: 20 }}>{title}</span>
        {sub && <span style={{ ...t.sub, fontSize: 12 }}>{sub}</span>}
      </div>
    </div>
  )
}

function OCRStage1Pick() {
  return (
    <>
      <StatusBar />
      <OCRHeader title="Import" sub="画像から取り込む" stage="01 / 05" />
      <div style={{ flex: 1, padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          padding: '28px 20px 26px',
          background: 'var(--color-encore-bg-section)',
          borderRadius: 16,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'var(--color-encore-white)',
            border: '1px solid var(--color-encore-border-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Camera size={28} weight="regular" color="var(--color-encore-green)" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ ...t.section, fontSize: 15, marginBottom: 4 }}>セトリ画像を選んでください</div>
            <div style={{ ...t.sub, fontSize: 12, lineHeight: 1.55 }}>
              SNS で共有されたセットリスト、<br/>会場で手書きしたメモの写真など
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <span style={{
            flex: 1, padding: '12px 14px', borderRadius: 10,
            background: 'var(--color-encore-green)', color: 'var(--color-encore-white)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: JA, fontSize: 13, fontWeight: 700,
          }}>
            <Camera size={14} weight="regular" /> 撮影
          </span>
          <span style={{
            flex: 1, padding: '12px 14px', borderRadius: 10,
            background: 'var(--color-encore-white)',
            border: '1px solid var(--color-encore-border)',
            color: 'var(--color-encore-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: JA, fontSize: 13, fontWeight: 700,
          }}>
            <ImageIcon size={14} weight="regular" /> フォト
          </span>
        </div>

        <div style={{
          marginTop: 8,
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(192,138,74,0.08)',
          border: '1px solid rgba(192,138,74,0.22)',
          display: 'flex', alignItems: 'flex-start', gap: 9,
        }}>
          <Sparkle size={13} weight="fill" color="var(--color-encore-amber)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ ...t.sectionSM, fontSize: 12, color: 'var(--color-encore-amber)' }}>AI が曲順・MC・ENCORE まで自動判定</div>
            <div style={{ ...t.sub, fontSize: 11, marginTop: 2 }}>読み取り後、内容を確認してから保存できます</div>
          </div>
        </div>
      </div>
    </>
  )
}

function OCRStage2Preview() {
  return (
    <>
      <StatusBar />
      <OCRHeader title="Preview" sub="この画像で合ってる？" stage="02 / 05" />
      <div style={{ flex: 1, padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{
          aspectRatio: '3/4',
          background: `linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4)), url(${ART.covers.indie}) center/cover`,
          borderRadius: 14,
          border: '1px solid rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* faux handwritten setlist on image */}
          <div style={{
            position: 'absolute', inset: 0,
            padding: '38px 30px',
            color: 'rgba(255,255,255,0.9)',
            fontFamily: JA, fontSize: 13, fontWeight: 700,
            letterSpacing: '0.04em',
            lineHeight: 1.95,
            textShadow: '0 2px 6px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.24em', opacity: 0.7, marginBottom: 6 }}>SETLIST</div>
            1. 憂う門には福来たる<br/>
            2. キミノネイロ<br/>
            3. IF<br/>
            4. シェルター<br/>
            5. 六畳夢想<br/>
            6. 繕い<br/>
            <span style={{ fontSize: 11, opacity: 0.7 }}>— ENCORE —</span><br/>
            7. Navy
          </div>
        </div>
        <div style={{ ...t.sub, fontSize: 12, textAlign: 'center' }}>
          タップで変更 · 長押しで削除
        </div>
      </div>
      <div style={{ padding: '16px 20px 22px' }}>
        <div style={{
          padding: '13px 18px',
          borderRadius: 999,
          background: 'var(--color-encore-green)',
          color: 'var(--color-encore-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: JA, fontSize: 14, fontWeight: 700,
        }}>
          <Sparkle size={13} weight="fill" /> この画像を解析する
        </div>
      </div>
    </>
  )
}

function OCRStage3Loading() {
  const stages = [
    { done: true,  label: '画像を読み込み中…' },
    { done: true,  label: '曲名を抽出中…' },
    { done: false, label: 'アートワーク照合中…', active: true },
    { done: false, label: 'セトリを整形中…' },
  ]
  return (
    <>
      <StatusBar />
      <OCRHeader title="Analyzing" sub="AI が解析しています" stage="03 / 05" />
      <div style={{ flex: 1, padding: '40px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'var(--color-encore-bg-section)',
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* spinning ring */}
          <div style={{
            position: 'absolute', inset: -2,
            borderRadius: '50%',
            border: '2.5px solid transparent',
            borderTopColor: 'var(--color-encore-amber)',
            borderRightColor: 'var(--color-encore-amber)',
            animation: 'spin 1.4s linear infinite',
          }} />
          <Sparkle size={40} weight="fill" color="var(--color-encore-amber)" />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {stages.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              background: s.active ? 'rgba(192,138,74,0.08)' : 'transparent',
              opacity: s.done ? 0.55 : 1,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: s.done ? 'var(--color-encore-green)' : s.active ? 'var(--color-encore-amber)' : 'var(--color-encore-bg-section)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                border: s.active ? '2px solid rgba(192,138,74,0.25)' : 'none',
              }}>
                {s.done && <Check size={10} weight="bold" color="#fff" />}
                {s.active && (
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: '#fff',
                    animation: 'pulse 1.2s ease-in-out infinite',
                  }} />
                )}
              </div>
              <span style={{
                ...t.body, fontSize: 13,
                fontWeight: s.active ? 700 : 400,
                color: s.active ? 'var(--color-encore-amber)' : s.done ? 'var(--color-encore-text-sub)' : 'var(--color-encore-text-muted)',
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
      </div>
    </>
  )
}

function OCRStage4Review() {
  const rows: Row[] = [
    { kind: 'song', title: '憂う門には福来たる', art: ART.covers.indie },
    { kind: 'song', title: 'キミノネイロ', art: ART.covers.ssw },
    { kind: 'song', title: 'IF' },
    { kind: 'song', title: 'シェルタ—' }, // low conf by position
    { kind: 'song', title: '六畳夢想', art: ART.covers.acoustic },
    { kind: 'song', title: '繕い', art: ART.covers.ssw },
    { kind: 'divider', label: 'ENCORE' },
    { kind: 'song', title: 'Navy', art: ART.covers.indie },
  ]

  let pos = 0
  return (
    <>
      <StatusBar />
      <OCRHeader title="Review" sub="確認して取り込む" stage="04 / 05" />

      <div style={{
        padding: '10px 16px',
        background: 'rgba(192,138,74,0.08)',
        borderBottom: '1px solid rgba(192,138,74,0.22)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        <WarningCircle size={14} weight="fill" color="var(--color-encore-amber)" />
        <span style={{ ...t.bodySM, fontWeight: 700, color: 'var(--color-encore-amber)' }}>
          読み取り精度：中 · 1曲が要確認
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 20, position: 'relative' }}>
        <div aria-hidden style={{
          position: 'absolute', left: 49, top: 0, bottom: 0,
          width: 1, background: 'var(--color-encore-border-light)',
        }} />
        {rows.map((r, i) => {
          if (r.kind === 'divider') return <DividerRow key={i} label={r.label} tone="encore" />
          if (r.kind !== 'song') return null
          pos++
          const lowConf = i === 3
          return (
            <SongRow
              key={i}
              index={pos < 10 ? `0${pos}` : String(pos)}
              art={r.art}
              title={r.title}
              lowConf={lowConf}
            />
          )
        })}
      </div>
      <div style={{ padding: '10px 16px 22px', borderTop: '1px solid var(--color-encore-border-light)' }}>
        <div style={{
          padding: '13px 18px', borderRadius: 999,
          background: 'var(--color-encore-green)', color: 'var(--color-encore-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontFamily: JA, fontSize: 14, fontWeight: 700,
        }}>
          <Check size={14} weight="bold" />
          このセトリを取り込む
        </div>
        <div style={{
          marginTop: 8, textAlign: 'center',
          ...t.sub, fontSize: 11,
        }}>
          取り込み後も編集できます
        </div>
      </div>
    </>
  )
}

function OCRStage5Merge() {
  return (
    <>
      <StatusBar />
      <OCRHeader title="Saved" sub="セトリに反映しました" stage="05 / 05" />
      <div style={{ flex: 1, padding: '60px 24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'rgba(26,58,45,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--color-encore-green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Check size={34} weight="bold" color="#fff" />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ ...t.heading, fontSize: 20, marginBottom: 6 }}>9曲を保存しました</div>
          <div style={{ ...t.sub, fontSize: 13, lineHeight: 1.55 }}>
            アートワークは順次読み込まれます。<br/>
            いつでも編集できます。
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 16px 22px' }}>
        <div style={{
          padding: '13px 18px', borderRadius: 999,
          background: 'var(--color-encore-green)', color: 'var(--color-encore-white)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: JA, fontSize: 14, fontWeight: 700,
        }}>
          セットリストを見る
        </div>
      </div>
    </>
  )
}

// ─── P2 · Report · Songs セクション ───────────────────────────────────────

function ReportHeader() {
  return (
    <>
      <StatusBar />
      <div style={{ padding: '6px 20px 10px' }}>
        <div style={{ ...t.display, fontSize: 30, lineHeight: 1.05 }}>Report</div>
      </div>
      <div style={{ padding: '6px 20px 16px', borderBottom: '1px solid var(--color-encore-border-light)' }}>
        <div style={{
          display: 'inline-flex',
          background: 'var(--color-encore-bg-section)',
          borderRadius: 999,
          padding: 3,
        }}>
          {['今月', '今年', '累計'].map((p, i) => (
            <span key={p} style={{
              padding: '6px 14px', borderRadius: 999,
              fontFamily: JA, fontSize: 13, fontWeight: 700,
              color: i === 1 ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
              background: i === 1 ? 'var(--color-encore-green)' : 'transparent',
            }}>{p}</span>
          ))}
        </div>
      </div>
      <div style={{
        padding: '18px 20px 8px',
        display: 'flex', alignItems: 'baseline', gap: 10,
      }}>
        <MusicNotes size={17} weight="regular" color="var(--color-encore-green)" style={{ transform: 'translateY(2px)' }} />
        <span style={{ ...t.section, fontSize: 16 }}>Songs</span>
        <span style={{ ...t.sub, fontSize: 11, letterSpacing: '0.04em' }}>曲の振り返り</span>
      </div>
    </>
  )
}

/** Card 1: Artists別よく聴いた曲 TOP5 */
function CardFrequentSongs() {
  const songs = [
    { title: 'Silent Bloom',  count: 4, art: ART.koharu },
    { title: 'Paper Plane',   count: 3, art: ART.koharu },
    { title: 'Neon Drive',    count: 2, art: ART.koharu },
    { title: 'Moonphase',     count: 2, art: ART.koharu },
    { title: 'Hourglass',     count: 1, art: ART.koharu },
  ]
  return (
    <div style={{
      margin: '0 16px',
      padding: '16px 16px 14px',
      background: 'var(--color-encore-white)',
      borderRadius: 14,
      border: '1px solid var(--color-encore-border-light)',
      boxShadow: '0 2px 14px rgba(26,58,45,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 3 }}>
        <span style={{ ...t.sectionSM, fontSize: 12.5, color: 'var(--color-encore-text-sub)', letterSpacing: '0.04em' }}>
          よく聴いた曲
        </span>
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        paddingBottom: 10, borderBottom: '1px solid var(--color-encore-border-light)',
      }}>
        <span style={{
          width: 22, height: 22,
          clipPath: `path("${squirclePath(22)}")`,
          background: `url(${ART.koharu}) center/cover`,
        }} />
        <span style={{ ...t.section, fontSize: 15 }}>koharu</span>
        <span style={{
          marginLeft: 'auto',
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 8px',
          borderRadius: 999,
          background: 'var(--color-encore-bg-section)',
          fontFamily: JA, fontSize: 10.5, fontWeight: 700,
          color: 'var(--color-encore-text-sub)',
        }}>
          <ArrowsClockwise size={10} weight="regular" />
          アーティスト切替
        </span>
      </div>
      <div style={{ marginTop: 10 }}>
        {songs.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 11,
            padding: '8px 0',
            borderBottom: i < 4 ? '1px solid var(--color-encore-border-light)' : 'none',
          }}>
            <span style={{
              width: 20, textAlign: 'center',
              fontFamily: EN, fontSize: 14, fontWeight: 700,
              color: i === 0 ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
              fontVariantNumeric: 'tabular-nums',
            }}>{String(i + 1).padStart(2, '0')}</span>
            <span style={{
              width: 30, height: 30,
              clipPath: `path("${squirclePath(30)}")`,
              background: `url(${s.art}) center/cover`,
              flexShrink: 0,
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
            }} />
            <span style={{ ...t.body, fontSize: 13.5, flex: 1, minWidth: 0, fontWeight: 700 }}>
              {s.title}
            </span>
            <span style={{
              fontFamily: EN, fontSize: 13, fontWeight: 700,
              color: 'var(--color-encore-green-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {s.count}<span style={{ fontSize: 10, marginLeft: 2, color: 'var(--color-encore-text-muted)' }}>回</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Card 2: 初披露曲 */
function CardDebutSongs() {
  const songs = [
    { title: 'Silent Bloom',    date: '4/3',  venue: 'NOCTURNE' },
    { title: '雨のち朝',        date: '4/12', venue: 'Blue Hour Sessions' },
    { title: 'Ocean Pillow',    date: '4/19', venue: '追加公演' },
    { title: 'Glass Refraction', date: '4/21', venue: 'LIVE STUDIO LODGE' },
  ]
  return (
    <div style={{
      margin: '0 16px',
      padding: '16px 18px 16px',
      background: 'var(--color-encore-white)',
      borderRadius: 14,
      border: '1px solid var(--color-encore-border-light)',
      boxShadow: '0 2px 14px rgba(26,58,45,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
        <span style={{ ...t.section, fontSize: 14 }}>初披露 ハイライト</span>
        <span style={{ ...t.sub, fontSize: 11 }}>Debut songs</span>
      </div>
      <div style={{
        fontFamily: JA,
        fontSize: 28, fontWeight: 700,
        color: 'var(--color-encore-green)',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>
        <span style={{ color: 'var(--color-encore-amber)' }}>4</span>
        <span style={{ fontSize: 14, marginLeft: 4, color: 'var(--color-encore-text-sub)' }}>曲の新曲に出会った</span>
      </div>
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {songs.map((s, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            paddingBottom: i < songs.length - 1 ? 9 : 0,
            borderBottom: i < songs.length - 1 ? '1px dashed var(--color-encore-border-light)' : 'none',
          }}>
            <span style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(192,138,74,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              fontFamily: EN, fontSize: 14, color: 'var(--color-encore-amber)',
            }}>◆</span>
            <span style={{ ...t.body, fontSize: 13, fontWeight: 700, flex: 1, minWidth: 0 }}>
              {s.title}
            </span>
            <span style={{
              fontFamily: EN, fontSize: 11, fontWeight: 700,
              color: 'var(--color-encore-text-sub)',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {s.date}
            </span>
            <span style={{ ...t.sub, fontSize: 10.5, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.venue}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Card 3: MC / ENCORE 分析 */
function CardMCEncore() {
  return (
    <div style={{
      margin: '0 16px',
      padding: '16px 18px 16px',
      background: 'var(--color-encore-white)',
      borderRadius: 14,
      border: '1px solid var(--color-encore-border-light)',
      boxShadow: '0 2px 14px rgba(26,58,45,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <span style={{ ...t.section, fontSize: 14 }}>MC · Encore</span>
        <span style={{ ...t.sub, fontSize: 11 }}>あなたのライブ傾向</span>
      </div>
      {[
        { label: 'MC 平均', val: '3.2', unit: '回 / ライブ', pct: 45 },
        { label: 'ENCORE 率', val: '78', unit: '%', pct: 78 },
        { label: 'ダブルアンコール率', val: '12', unit: '%', pct: 12 },
      ].map((m, i) => (
        <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline',
            marginBottom: 5,
          }}>
            <span style={{ ...t.bodySM, fontWeight: 700, fontSize: 12.5 }}>{m.label}</span>
            <span style={{
              marginLeft: 'auto',
              fontFamily: EN,
              fontSize: 17, fontWeight: 700,
              color: 'var(--color-encore-green)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em',
            }}>
              {m.val}
              <span style={{ fontSize: 10, marginLeft: 3, color: 'var(--color-encore-text-sub)' }}>{m.unit}</span>
            </span>
          </div>
          <div style={{
            height: 5, borderRadius: 3,
            background: 'var(--color-encore-bg-section)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <div style={{
              width: `${m.pct}%`, height: '100%',
              background: i === 0 ? 'var(--color-encore-green-muted)' : 'var(--color-encore-green)',
              borderRadius: 3,
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Card 4: 一期一会の曲 (★最強差別化) */
function CardIchigoIchie() {
  const songs = [
    { title: 'Secret Garden', artist: 'somei',  date: '4/6',  venue: 'Cross Roads' },
    { title: '深夜便',         artist: 'NANA',   date: '3/25', venue: 'CONTINUE' },
    { title: 'Frozen Kiss',    artist: 'MEI',    date: '4/9',  venue: 'Indies Night' },
  ]
  return (
    <div style={{
      margin: '0 16px',
      padding: '16px 16px 14px',
      background: 'linear-gradient(170deg, #F5ECD9 0%, #F9F2E0 50%, #F5ECD9 100%)',
      borderRadius: 14,
      border: '1px solid rgba(192,138,74,0.28)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 6px 24px rgba(192,138,74,0.14)',
    }}>
      {/* 背景の漢字 — 一文字ずつ、控えめサイズ */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -8, right: -4,
          fontFamily: JA,
          fontSize: 88, fontWeight: 700,
          color: 'rgba(192,138,74,0.10)',
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        一期
      </div>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -8, left: -4,
          fontFamily: JA,
          fontSize: 88, fontWeight: 700,
          color: 'rgba(192,138,74,0.08)',
          lineHeight: 0.9,
          letterSpacing: '-0.04em',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        一会
      </div>
      {/* subtle paper grain */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 30%, rgba(192,138,74,0.04) 0.5px, transparent 1px),
                          radial-gradient(circle at 70% 80%, rgba(192,138,74,0.03) 0.5px, transparent 1px)`,
        backgroundSize: '8px 8px, 11px 11px',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{
            fontFamily: EN, fontSize: 10, fontWeight: 700,
            letterSpacing: '0.24em',
            color: 'var(--color-encore-amber)',
          }}>ICHI-GO ICHI-E</span>
          <span style={{ flex: 1, height: 1, background: 'rgba(192,138,74,0.35)' }} />
        </div>

        <div style={{
          fontFamily: JA,
          fontSize: 18, fontWeight: 700,
          color: 'var(--color-encore-green)',
          letterSpacing: '-0.005em',
          lineHeight: 1.3,
          marginBottom: 3,
        }}>
          あの日、あのライブだけの1曲
        </div>
        <div style={{ ...t.sub, fontSize: 11.5, lineHeight: 1.5, marginBottom: 12 }}>
          全履歴で一度しか聴けなかった曲。
          <span style={{ color: 'var(--color-encore-amber)', fontWeight: 700 }}>5曲</span>
          見つかりました。
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.65)',
          borderRadius: 10,
          padding: '6px 10px',
          backdropFilter: 'blur(4px)',
        }}>
          {songs.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 9,
              padding: '6px 0',
              borderBottom: i < songs.length - 1 ? '1px dashed rgba(192,138,74,0.25)' : 'none',
            }}>
              <div style={{
                width: 30, height: 30,
                border: '1.5px solid rgba(192,138,74,0.5)',
                borderRadius: 5,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                background: 'rgba(255,255,255,0.6)',
              }}>
                <span style={{
                  fontFamily: EN, fontSize: 10.5, fontWeight: 700,
                  color: 'var(--color-encore-amber)',
                  fontVariantNumeric: 'tabular-nums',
                  lineHeight: 1,
                }}>{s.date}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...t.body, fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                  {s.title}
                </div>
                <div style={{ ...t.sub, fontSize: 10.5, lineHeight: 1.3, marginTop: 1 }}>
                  {s.artist} · {s.venue}
                </div>
              </div>
            </div>
          ))}
          <div style={{
            marginTop: 4, paddingTop: 8,
            borderTop: '1px solid rgba(192,138,74,0.2)',
            textAlign: 'center',
            fontFamily: JA, fontSize: 11.5, fontWeight: 700,
            color: 'var(--color-encore-amber)',
          }}>
            他 2曲 を見る ›
          </div>
        </div>
      </div>
    </div>
  )
}

/** Card 5: セトリ長ランキング */
function CardLongestSetlists() {
  const lives = [
    { rank: 1, title: 'NOCTURNE 追加公演', date: '4/19', n: 22 },
    { rank: 2, title: 'POP-UP!!',         date: '4/18', n: 19 },
    { rank: 3, title: 'Blue Hour Vol.11', date: '4/12', n: 17 },
    { rank: 4, title: 'Cross Roads 4th',  date: '4/6',  n: 16 },
    { rank: 5, title: 'STARLIGHT 2026',   date: '4/5',  n: 15 },
  ]
  const max = 22
  return (
    <div style={{
      margin: '0 16px',
      padding: '16px 18px 14px',
      background: 'var(--color-encore-white)',
      borderRadius: 14,
      border: '1px solid var(--color-encore-border-light)',
      boxShadow: '0 2px 14px rgba(26,58,45,0.04)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 14 }}>
        <span style={{ ...t.section, fontSize: 14 }}>濃かったライブ</span>
        <span style={{ ...t.sub, fontSize: 11 }}>Longest setlists</span>
      </div>
      {lives.map((l, i) => (
        <div key={i} style={{
          padding: '9px 0',
          borderBottom: i < 4 ? '1px solid var(--color-encore-border-light)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 5 }}>
            <span style={{
              fontFamily: EN, fontSize: 13, fontWeight: 700,
              color: i === 0 ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 18,
            }}>{String(l.rank).padStart(2, '0')}</span>
            <span style={{ ...t.body, fontSize: 13, fontWeight: 700, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {l.title}
            </span>
            <span style={{ ...t.captionMuted, fontSize: 10.5 }}>{l.date}</span>
            <span style={{
              fontFamily: EN, fontSize: 14, fontWeight: 700,
              color: 'var(--color-encore-green)',
              fontVariantNumeric: 'tabular-nums',
              minWidth: 28,
              textAlign: 'right',
            }}>{l.n}<span style={{ fontSize: 9, color: 'var(--color-encore-text-muted)' }}>曲</span></span>
          </div>
          <div style={{
            height: 3, borderRadius: 2,
            background: 'var(--color-encore-bg-section)',
            overflow: 'hidden',
            marginLeft: 27,
          }}>
            <div style={{
              width: `${(l.n / max) * 100}%`, height: '100%',
              background: i === 0 ? 'var(--color-encore-amber)' : 'var(--color-encore-green-muted)',
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function FreeSongsTeaser() {
  return (
    <div style={{
      margin: '0 16px',
      padding: '24px 20px 22px',
      background: `
        linear-gradient(180deg, rgba(192,138,74,0.14) 0%, rgba(192,138,74,0.04) 100%),
        var(--color-encore-white)
      `,
      border: '1px solid rgba(192,138,74,0.3)',
      borderRadius: 14,
      position: 'relative',
      overflow: 'hidden',
      textAlign: 'center',
    }}>
      {/* Deco sparkle grid */}
      <div aria-hidden style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(192,138,74,0.1) 1px, transparent 1.5px)`,
        backgroundSize: '18px 18px',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 48, height: 48, borderRadius: 14,
          background: 'var(--color-encore-white)',
          border: '1px solid rgba(192,138,74,0.3)',
          marginBottom: 14,
        }}>
          <Lock size={20} weight="regular" color="var(--color-encore-amber)" />
        </div>
        <div style={{ ...t.heading, fontSize: 17, marginBottom: 8 }}>
          あなたの「音楽史」を、<br/>ここで振り返る。
        </div>
        <div style={{ ...t.sub, fontSize: 12.5, lineHeight: 1.55, marginBottom: 18 }}>
          よく聴いた曲 · 初披露 · 一期一会の1曲 ·<br/>
          MC とアンコールの傾向まで。
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '11px 20px',
          borderRadius: 999,
          background: 'var(--color-encore-amber)',
          color: 'var(--color-encore-white)',
          fontFamily: JA, fontSize: 13, fontWeight: 700,
        }}>
          <Sparkle size={12} weight="fill" />
          Premium でロック解除
          <CaretRight size={12} weight="bold" style={{ marginLeft: 2 }} />
        </div>
      </div>
    </div>
  )
}

function ReportSongsSection({ free }: { free?: boolean }) {
  if (free) {
    return (
      <>
        <ReportHeader />
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
          <FreeSongsTeaser />
        </div>
      </>
    )
  }
  return (
    <>
      <ReportHeader />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <CardFrequentSongs />
          <CardDebutSongs />
          <CardMCEncore />
          <CardIchigoIchie />
          <CardLongestSetlists />
        </div>
      </div>
    </>
  )
}

// ─── P2 · Settings · データ管理 ────────────────────────────────────────────

function SettingsDataManagement() {
  return (
    <>
      <StatusBar />
      <div style={{ padding: '6px 20px 20px' }}>
        <div style={{ ...t.display, fontSize: 30 }}>Settings</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        <div style={{
          padding: '0 20px 6px',
          display: 'flex', alignItems: 'baseline', gap: 8,
        }}>
          <span style={{ ...t.caption, fontWeight: 700, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-encore-text-sub)' }}>
            DATA
          </span>
          <span style={{ ...t.sub, fontSize: 11 }}>データ管理</span>
        </div>

        <div style={{
          margin: '0 16px 16px',
          background: 'var(--color-encore-white)',
          borderRadius: 14,
          border: '1px solid var(--color-encore-border-light)',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            borderBottom: '1px solid var(--color-encore-border-light)',
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'var(--color-encore-bg-section)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Export size={17} weight="regular" color="var(--color-encore-green)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...t.section, fontSize: 14, marginBottom: 2 }}>すべてのデータをエクスポート</div>
              <div style={{ ...t.sub, fontSize: 11.5 }}>
                ライブ · アーティスト · セトリを1つの <span style={{ fontFamily: EN, fontWeight: 700 }}>.json</span> に書き出します
              </div>
            </div>
            <CaretRight size={14} weight="bold" color="var(--color-encore-text-muted)" />
          </div>

          <div style={{
            padding: '14px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            opacity: 0.55,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'var(--color-encore-bg-section)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ArrowsClockwise size={17} weight="regular" color="var(--color-encore-green)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...t.section, fontSize: 14, marginBottom: 2 }}>
                インポート
                <span style={{
                  marginLeft: 8,
                  fontFamily: EN, fontSize: 9, fontWeight: 700,
                  color: 'var(--color-encore-text-muted)',
                  letterSpacing: '0.16em',
                  padding: '1px 6px',
                  borderRadius: 999,
                  border: '1px solid var(--color-encore-border)',
                  verticalAlign: 'middle',
                }}>
                  COMING SOON
                </span>
              </div>
              <div style={{ ...t.sub, fontSize: 11.5 }}>バックアップからの復元（準備中）</div>
            </div>
          </div>
        </div>

        <div style={{
          margin: '0 16px',
          padding: '12px 14px',
          borderRadius: 10,
          background: 'rgba(26,58,45,0.04)',
          border: '1px solid var(--color-encore-border-light)',
          display: 'flex', alignItems: 'flex-start', gap: 9,
        }}>
          <Note size={13} weight="regular" color="var(--color-encore-text-sub)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ ...t.sub, fontSize: 11.5, lineHeight: 1.55 }}>
            データは常に自分の端末に保存されます。<br/>
            機種変更時は、このエクスポートでバックアップ推奨。
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Page layout helpers ──────────────────────────────────────────────────

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note?: string }) {
  return (
    <div style={{ padding: '48px 40px 18px' }}>
      <div style={{
        fontFamily: EN, fontSize: 11, fontWeight: 700,
        color: 'var(--color-encore-amber)',
        letterSpacing: '0.26em',
        marginBottom: 8,
      }}>
        {eyebrow}
      </div>
      <div style={{ ...t.title, fontSize: 32, lineHeight: 1.1, letterSpacing: '-0.015em', marginBottom: note ? 8 : 0 }}>
        {title}
      </div>
      {note && (
        <div style={{ ...t.sub, fontSize: 13.5, maxWidth: 720, lineHeight: 1.6 }}>
          {note}
        </div>
      )}
    </div>
  )
}

function MockRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '0 40px 32px',
      display: 'flex',
      gap: 36,
      overflowX: 'auto',
      alignItems: 'flex-start',
      flexWrap: 'nowrap',
    }}>
      {children}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

export default function SetlistMocksPage() {
  // モックはパレット設定に依存せず常に「Grape 本来の配色」で見せたい。
  // documentElement.style のインライン指定より優先させるため、ここで CSS 変数を再上書きする。
  const palette: React.CSSProperties = {
    // base tokens
    ['--color-encore-bg' as any]:           '#FAF8F4',
    ['--color-encore-bg-section' as any]:   '#E9E8E4',
    ['--color-encore-bg-card' as any]:      '#EDEAE4',
    ['--color-encore-green' as any]:        '#1A3A2D',
    ['--color-encore-green-muted' as any]:  '#8BA898',
    ['--color-encore-amber' as any]:        '#C08A4A',
    ['--color-encore-text-sub' as any]:     'rgba(26,58,45,0.55)',
    ['--color-encore-text-muted' as any]:   'rgba(26,58,45,0.35)',
    ['--color-encore-border' as any]:       '#BAC2BB',
    ['--color-encore-border-light' as any]: '#E4E2DD',
    ['--color-encore-white' as any]:        '#FFFFFF',
    ['--color-encore-error' as any]:        '#DB6050',
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #F5F2EB 0%, #EAE6DC 100%)',
      color: '#1A3A2D',
      ...palette,
    }}>
      {/* ── Hero ── */}
      <header style={{
        padding: '64px 40px 48px',
        borderBottom: '1px solid var(--color-encore-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* subtle paper grain */}
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: `radial-gradient(circle at 20% 40%, rgba(192,138,74,0.05) 0.8px, transparent 1.2px),
                            radial-gradient(circle at 70% 70%, rgba(26,58,45,0.04) 0.8px, transparent 1.2px)`,
          backgroundSize: '14px 14px, 17px 17px',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 1100 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '5px 11px',
            borderRadius: 999,
            background: 'rgba(26,58,45,0.06)',
            border: '1px solid var(--color-encore-border)',
            marginBottom: 22,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'var(--color-encore-amber)',
            }} />
            <span style={{
              fontFamily: EN, fontSize: 11, fontWeight: 700,
              letterSpacing: '0.2em',
              color: 'var(--color-encore-green)',
            }}>
              VISUAL MOCKS · NOT IMPLEMENTED
            </span>
          </div>

          <h1 style={{
            fontFamily: EN,
            fontSize: 76, fontWeight: 700,
            lineHeight: 0.98,
            letterSpacing: '-0.03em',
            color: 'var(--color-encore-green)',
            margin: 0,
            marginBottom: 18,
          }}>
            Setlist<br/>
            <span style={{ fontSize: 52, color: 'var(--color-encore-amber)' }}>for Premium.</span>
          </h1>

          <p style={{
            fontFamily: JA, fontSize: 17, fontWeight: 400,
            color: 'var(--color-encore-green)',
            lineHeight: 1.7,
            maxWidth: 640,
            margin: '0 0 10px',
          }}>
            推しのライブで聴いた曲を、あの日そのままに。
          </p>
          <p style={{
            fontFamily: JA, fontSize: 14, fontWeight: 400,
            color: 'var(--color-encore-text-sub)',
            lineHeight: 1.8,
            maxWidth: 720,
            margin: 0,
          }}>
            GRAPE Premium 向けセットリスト機能のビジュアルリファレンス。
            Editor / Preview / OCR / Report を網羅した静的モック。
            本実装と独立したプロトタイプページです。
          </p>

          <div style={{
            marginTop: 36,
            display: 'flex', flexWrap: 'wrap', gap: 24,
            fontFamily: EN, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.16em',
            color: 'var(--color-encore-text-sub)',
          }}>
            {[
              'SECTION 01 · EDITOR',
              'SECTION 02 · PREVIEW',
              'SECTION 03 · OCR IMPORT',
              'SECTION 04 · REPORT',
              'SECTION 05 · SETTINGS',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 1, background: 'var(--color-encore-border)' }} />
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── 01 · Editor ── */}
      <SectionTitle
        eyebrow="SECTION 01 — P0"
        title="Setlist Editor Sheet."
        note="曲を1行ずつ追加・並び替え・MC や ENCORE 区切りを挿入できるメインエディタ。下部に OCR ボタンを Premium 強調で配置。対バン時はアーティストセグメントで絞り込み可能。"
      />
      <MockRow>
        <MockPhone label="01A · SOLO (single artist)">
          <SetlistEditorSheet variant="solo" />
        </MockPhone>
        <MockPhone label="01B · TAIBAN (multi artist)">
          <SetlistEditorSheet variant="taiban" />
        </MockPhone>
        <MockPhone label="01C · DRAGGING STATE">
          <SetlistEditorSheet variant="dragging" />
        </MockPhone>
        <MockPhone label="01D · OCR UNCERTAINTY + MEMORY MODE">
          <SetlistEditorSheet variant="uncertain" />
        </MockPhone>
      </MockRow>

      {/* ── 02 · Preview ── */}
      <SectionTitle
        eyebrow="SECTION 02 — P1"
        title="EventPreviewScreen · Setlist Section."
        note="既存のライブ詳細画面（InfoRow 群の下、画像ストリップの上）に差し込むセクション。Premium/Free × データ有無で4パターン。"
      />
      <MockRow>
        <MockPhone label="02A · PREMIUM · WITH DATA">
          <SetlistSectionPremiumWith />
        </MockPhone>
        <MockPhone label="02B · PREMIUM · EMPTY CTA">
          <SetlistSectionPremiumEmpty />
        </MockPhone>
        <MockPhone label="02C · FREE · LOCK CARD (attended)">
          <SetlistSectionFreeLock />
        </MockPhone>
        <MockPhone label="02D · FREE · FUTURE LIVE (hidden)">
          <SetlistSectionFreeFuture />
        </MockPhone>
      </MockRow>

      {/* ── 03 · OCR Import ── */}
      <SectionTitle
        eyebrow="SECTION 03 — P1"
        title="Setlist Import · OCR Flow."
        note="画像1枚から AI がセットリストを自動抽出。5ステージで、ユーザーは必ず Review を挟んでから保存する設計。誤認による統計汚染を防ぐ。"
      />
      <MockRow>
        <MockPhone label="03A · STAGE 01 · PICK IMAGE">
          <OCRStage1Pick />
        </MockPhone>
        <MockPhone label="03B · STAGE 02 · CONFIRM PREVIEW">
          <OCRStage2Preview />
        </MockPhone>
        <MockPhone label="03C · STAGE 03 · ANALYZING">
          <OCRStage3Loading />
        </MockPhone>
        <MockPhone label="03D · STAGE 04 · REVIEW + LOW CONF">
          <OCRStage4Review />
        </MockPhone>
        <MockPhone label="03E · STAGE 05 · SAVED">
          <OCRStage5Merge />
        </MockPhone>
      </MockRow>

      {/* ── 04 · Report Songs ── */}
      <SectionTitle
        eyebrow="SECTION 04 — P2"
        title="Report · Songs Section."
        note="既存 Report（Hero / Activity / Artists / Live Type / Venues）の下に Premium 限定で追加。5カード構成、Free は 1 ティーザーのみ。Card 4「一期一会」は最強訴求。"
      />
      <MockRow>
        <MockPhone label="04A · PREMIUM · FULL (5 CARDS)">
          <ReportSongsSection />
        </MockPhone>
        <MockPhone label="04B · FREE · TEASER">
          <ReportSongsSection free />
        </MockPhone>
      </MockRow>

      {/* ── 05 · Settings ── */}
      <SectionTitle
        eyebrow="SECTION 05 — P2"
        title="Settings · Data Management."
        note="「Premium 解約」という概念はない（買い切り）ため、エクスポートは課金状態と無関係な Free/Premium 共通機能として配置。機種変更バックアップ用途。"
      />
      <MockRow>
        <MockPhone label="05 · DATA EXPORT">
          <SettingsDataManagement />
        </MockPhone>
      </MockRow>

      {/* ── Footer ── */}
      <footer style={{
        padding: '64px 40px 80px',
        borderTop: '1px solid var(--color-encore-border)',
        marginTop: 40,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
          <div>
            <div style={{
              fontFamily: EN, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.24em', color: 'var(--color-encore-amber)',
              marginBottom: 10,
            }}>
              AESTHETIC DIRECTION
            </div>
            <div style={{ ...t.body, fontSize: 13.5, lineHeight: 1.65 }}>
              Concert Program × Editorial Journal.
              大きなタビュラー数字、ドットリーダー区切り、
              和英併記の見出し、アンバーは「金箔」のように
              特別な瞬間のみに。
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: EN, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.24em', color: 'var(--color-encore-amber)',
              marginBottom: 10,
            }}>
              DIFFERENTIATION
            </div>
            <div style={{ ...t.body, fontSize: 13.5, lineHeight: 1.65 }}>
              「一期一会の曲」カードは全履歴で
              1度きりだった曲を検出。
              LiveRock にはない、推し活の希少性×ロマンを
              可視化する GRAPE だけの体験。
            </div>
          </div>
          <div>
            <div style={{
              fontFamily: EN, fontSize: 10, fontWeight: 700,
              letterSpacing: '0.24em', color: 'var(--color-encore-amber)',
              marginBottom: 10,
            }}>
              NEXT STEP
            </div>
            <div style={{ ...t.body, fontSize: 13.5, lineHeight: 1.65 }}>
              Phase 1（3日）から着手。
              types.ts に Setlist 型 → useSetlistStore
              → EventPreviewScreen 表示 → SetlistEditorSheet。
            </div>
          </div>
        </div>
        <div style={{
          marginTop: 48,
          fontFamily: EN, fontSize: 10, fontWeight: 700,
          letterSpacing: '0.28em',
          color: 'var(--color-encore-text-muted)',
          textAlign: 'center',
        }}>
          GRAPE · VISUAL MOCKS · 2026-04-22
        </div>
      </footer>
    </div>
  )
}
