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
import { MusicNotes, Lock, Plus, CaretRight } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive } from '@/lib/grape/types'
import { useIsPremium } from '@/lib/grape/premium'
import { useSetlistStore } from '@/lib/grape/useSetlistStore'

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

  // ─── Free × 未参戦: セクション非表示 ─────────────────────────────────
  if (!isPremium && live.attendanceStatus !== 'attended') {
    return null
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
            width: '100%', padding: '16px 14px',
            borderRadius: 8,
            background: 'var(--color-encore-bg-section)',
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
          padding: '28px 20px',
          borderRadius: 8,
          background: 'var(--color-encore-bg-section)',
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

  // ─── Premium × データあり: Day 2 以降で実装 ─────────────────────────
  // TODO: プレビュー5行 + 「全N曲を見る ›」
  return null
}

// ─── 見出し ──────────────────────────────────────────────────────────────
function SectionHeader() {
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
    </div>
  )
}

// ─── 共通スタイル ───────────────────────────────────────────────────────
const sectionWrapStyle: React.CSSProperties = {
  marginTop: 24,
}
