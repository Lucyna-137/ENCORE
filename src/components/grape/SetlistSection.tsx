'use client'

/**
 * SetlistSection — EventPreviewScreen に差し込むセトリセクション
 *
 * Phase 1 Day 1: 空状態のみ対応。
 *
 * 表示ロジック（4 パターン）:
 *   ┌─────────────┬──────────────┬──────────────────────────────────┐
 *   │ Premium 状態 │ データ有無    │ 表示                              │
 *   ├─────────────┼──────────────┼──────────────────────────────────┤
 *   │ Premium      │ なし          │ 空状態 + 「セットリストを記録する」CTA │
 *   │ Premium      │ あり          │ TODO Day 2+: プレビュー + 「全 N 曲を見る ›」│
 *   │ Free         │ attended      │ ロックカード + Premium 訴求            │
 *   │ Free         │ attended 以外 │ セクション非表示（return null）        │
 *   └─────────────┴──────────────┴──────────────────────────────────┘
 *
 * 次フェーズへの導線:
 *   - onEditSetlist: SetlistEditorSheet を開く（Day 2 で実装）
 *   - onUpgradePremium: PremiumUpgradeSheet を開く（既存 Sheet を再利用）
 */

import React from 'react'
import { MusicNotes, Lock, Plus, CaretRight, PencilSimple } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, SetlistItem } from '@/lib/grape/types'
import { useIsPremium } from '@/lib/grape/premium'
import { useSetlistStore } from '@/lib/grape/useSetlistStore'
import { TODAY } from '@/lib/grape/constants'

interface SetlistSectionProps {
  live: GrapeLive
  /** 「セットリストを記録する」押下（Premium 時） */
  onEditSetlist?: (live: GrapeLive) => void
  /** Free ユーザ向け Premium 訴求 */
  onUpgradePremium?: () => void
}

export default function SetlistSection({
  live,
  onEditSetlist,
  onUpgradePremium,
}: SetlistSectionProps) {
  const isPremium = useIsPremium()
  const { getSetlist, ready } = useSetlistStore()

  // ストア初期化中は何も表示しない（ハイドレーション後に描画）
  if (!ready) return null

  const setlist = getSetlist(live.id)
  const hasData = !!setlist && setlist.items.length > 0

  // ─── Free: 非表示条件 ──────────────────────────────────────────────
  // 複数推しユーザーは「行けなかったライブのセトリも記録したい」ニーズあり
  // （配信・友人レポ・X セトリ速報で入手可能）。
  // → 過去日の公演はステータス不問で表示。未来日とスキップのみ非表示。
  if (!isPremium) {
    const isPast = live.date < TODAY
    const isSkipped = live.attendanceStatus === 'skipped'
    if (!isPast || isSkipped) return null
  }

  // ─── Free × 参戦済み: ロックカード ──────────────────────────────────
  if (!isPremium) {
    return (
      <div style={sectionWrapStyle}>
        <SectionHeader />
        <button
          onClick={onUpgradePremium}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', padding: '14px 12px',
            borderRadius: 8,
            background: 'var(--color-encore-white)',
            border: '1px solid var(--color-encore-border-light)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            textAlign: 'left',
          }}
        >
          <div style={{
            flexShrink: 0,
            width: 36, height: 36, borderRadius: 999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--color-encore-amber)',
          }}>
            <Lock size={18} weight="regular" color="white" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...ty.body, fontWeight: 700, marginBottom: 2 }}>
              あのライブで聴いた曲、覚えてる？
            </div>
            <div style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)' }}>
              Premium でセットリストを記録できます
            </div>
          </div>
          <CaretRight size={14} weight="regular" color="var(--color-encore-green)" />
        </button>
      </div>
    )
  }

  // ─── Premium × データなし: 空状態 CTA ───────────────────────────────
  if (!hasData) {
    return (
      <div style={sectionWrapStyle}>
        <SectionHeader />
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '24px 20px 20px',
          borderRadius: 8,
          background: 'var(--color-encore-white)',
          border: '1px dashed var(--color-encore-border)',
        }}>
          <MusicNotes size={28} weight="regular" color="var(--color-encore-text-muted)" />
          <div style={{
            ...ty.bodySM,
            color: 'var(--color-encore-text-sub)',
            textAlign: 'center',
          }}>
            セットリストはまだ空です
          </div>
          <button
            onClick={() => onEditSetlist?.(live)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 4, padding: '10px 18px',
              borderRadius: 999,
              background: 'var(--color-encore-green)',
              border: 'none',
              color: 'white',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 13, fontWeight: 700,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Plus size={14} weight="bold" />
            セットリストを記録する
          </button>
        </div>
      </div>
    )
  }

  // ─── Premium × データあり: プレビュー + 編集導線 ───────────────────
  const songItems = setlist!.items.filter(i => i.kind === 'song') as Extract<SetlistItem, { kind: 'song' }>[]
  const totalSongs = songItems.length
  const PREVIEW_COUNT = 5
  const previewSongs = songItems.slice(0, PREVIEW_COUNT)
  const hasMore = totalSongs > PREVIEW_COUNT
  const approximate = !!setlist!.approximate

  return (
    <div style={sectionWrapStyle}>
      <SectionHeader count={totalSongs} approximate={approximate} />

      {/* ── プレビュー行（スパインガイド付き）───────────────────────── */}
      <div style={{ position: 'relative', padding: '2px 0 8px' }}>
        {/* 左端の縦スパイン */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: 2,
            top: 4,
            bottom: 8,
            width: 1,
            background: 'var(--color-encore-border)',
          }}
        />
        {previewSongs.length === 0 ? (
          // song が 0 件だが items に MC/divider だけあるケース
          <div style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', padding: '8px 12px' }}>
            曲の記録がありません
          </div>
        ) : (
          previewSongs.map((song, i) => (
            <PreviewRow key={i} index={i + 1} title={song.title} originalArtist={song.originalArtist} />
          ))
        )}
      </div>

      {/* ── 開く / 編集する ボタン（セカンダリー・罫線囲み）────── */}
      <button
        onClick={() => onEditSetlist?.(live)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '8px 16px',
          borderRadius: 999,
          background: 'transparent',
          border: '1px solid var(--color-encore-green)',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          color: 'var(--color-encore-green)',
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 12,
          fontWeight: 700,
        }}
      >
        {hasMore ? (
          <>全 {totalSongs} 曲を見る</>
        ) : (
          <><PencilSimple size={12} weight="regular" />編集する</>
        )}
        <CaretRight size={11} weight="bold" />
      </button>
    </div>
  )
}

// ─── プレビュー行（番号 + 曲名、コンパクト）─────────────────────────
function PreviewRow({
  index,
  title,
  originalArtist,
}: {
  index: number
  title: string
  originalArtist?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '6px 0 6px 0',
        minHeight: 28,
      }}
    >
      <div
        style={{
          width: 22,
          flexShrink: 0,
          textAlign: 'right',
          fontFamily: 'var(--font-google-sans), sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--color-encore-green)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {index}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...ty.body,
            fontSize: 13,
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title || <span style={{ color: 'var(--color-encore-text-muted)', fontWeight: 400 }}>（無題）</span>}
        </div>
        {originalArtist && (
          <div
            style={{
              ...ty.caption,
              color: 'var(--color-encore-text-sub)',
              marginTop: 1,
            }}
          >
            cover · {originalArtist}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 見出し ──────────────────────────────────────────────────────────────
function SectionHeader({ count, approximate }: { count?: number; approximate?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 10,
    }}>
      <MusicNotes size={15} weight="regular" color="var(--color-encore-green)" />
      <span style={{ ...ty.section }}>セットリスト</span>
      <span style={{
        ...ty.caption,
        color: 'var(--color-encore-text-muted)',
        letterSpacing: '0.08em',
      }}>
        SETLIST
      </span>
      {typeof count === 'number' && count > 0 && (
        <span style={{
          ...ty.caption,
          color: 'var(--color-encore-text-sub)',
          marginLeft: 'auto',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {count} 曲
        </span>
      )}
      {approximate && (
        <span style={{
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 10,
          fontWeight: 700,
          color: 'var(--color-encore-amber)',
          padding: '1px 6px',
          borderRadius: 999,
          border: '1px solid rgba(192,138,74,0.35)',
          background: 'rgba(192,138,74,0.08)',
          marginLeft: typeof count === 'number' ? 0 : 'auto',
          letterSpacing: '0.04em',
        }}>
          うろ覚え
        </span>
      )}
    </div>
  )
}

// ─── 共通スタイル ───────────────────────────────────────────────────────
/**
 * セクション全体のラップ:
 *   - 薄い地色（bg-section）で EventPreviewScreen の他の InfoRow 群と視覚差別化
 *   - 角丸 10 で Premium 機能らしい上品な囲い
 */
const sectionWrapStyle: React.CSSProperties = {
  marginTop: 24,
  padding: '14px 14px 12px',
  borderRadius: 10,
  background: 'var(--color-encore-bg-section)',
  position: 'relative',
}
