'use client'

import React from 'react'
import { PencilSimple, Sparkle } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'

/**
 * +ボタン（FAB）タップ時の選択シート（Premium時のみ表示）
 *
 *   新しく作成 → QuickEventSheet を開く
 *   URLから取り込む → URLImportSheet を開く
 *
 * Free ユーザには表示せず、+ボタン直押下で QuickEventSheet を開く。
 */
interface AddActionSheetProps {
  onClose: () => void
  onNewEvent: () => void
  onImportFromUrl: () => void
}

export default function AddActionSheet({ onClose, onNewEvent, onImportFromUrl }: AddActionSheetProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26, 58, 45, 0.42)',
        zIndex: 180,
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
          padding: '16px 0 24px',
          animation: 'grape-slide-up 280ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* ドラッグハンドル */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 4,
        }}>
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
          イベントを追加
        </div>

        {/* 選択肢 */}
        <button
          onClick={onNewEvent}
          style={{
            width: '100%', padding: '16px 20px',
            background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--color-encore-bg-section)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <PencilSimple size={16} weight="regular" color="var(--color-encore-green)" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ ...ty.section }}>新しく作成</div>
            <div style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', marginTop: 2 }}>
              手動でイベント情報を入力
            </div>
          </div>
        </button>

        <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 20px' }} />

        <button
          onClick={onImportFromUrl}
          style={{
            width: '100%', padding: '16px 20px',
            background: 'none', border: 'none',
            display: 'flex', alignItems: 'center', gap: 14,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(192, 138, 74, 0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Sparkle size={16} weight="fill" color="var(--color-encore-amber)" />
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ ...ty.section, display: 'flex', alignItems: 'center', gap: 6 }}>
              URLから取り込む
              <span style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 10, fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--color-encore-amber)',
                background: 'rgba(192, 138, 74, 0.14)',
                padding: '2px 6px',
                borderRadius: 4,
              }}>PREMIUM</span>
            </div>
            <div style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)', marginTop: 2 }}>
              公式ページやチケット販売URLから自動入力
            </div>
          </div>
        </button>

        {/* キャンセル */}
        <div style={{ height: 8, background: 'var(--color-encore-bg-section)' }} />
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '14px 20px',
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
