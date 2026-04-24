'use client'

/**
 * ArtistDeleteConfirmDialog — アーティスト削除 2 択確認ダイアログ
 *
 * Settings と Artist Detail の両画面で共有される共通ダイアログ。
 *
 * 挙動:
 *   - 紐づくイベントが 0 件: 「削除する」「キャンセル」の 2 ボタン
 *   - 紐づくイベントが 1 件以上:
 *     1. イベントも削除（赤・destructive）
 *     2. イベントは残す（緑ボーダー）
 *     3. キャンセル
 *
 * 「イベントは残す」の挙動:
 *   - GrapeLive.artistImage / artistImages をクリアして Person アイコン fallback へ
 *   - 呼び出し側（親コンポーネント）で実装する
 */

import React from 'react'
import { Trash, Warning } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'

interface ArtistDeleteConfirmDialogProps {
  /** 削除対象アーティスト名（表示用）*/
  artistName: string
  /** このアーティストに紐づくイベント数 */
  linkedEventCount: number
  /** 「イベントも削除」押下 */
  onConfirmWithEvents: () => void
  /** 「イベントは残す」押下（イベント 0 件時は呼ばれない）*/
  onConfirmKeepEvents: () => void
  /** キャンセル / 外側タップ */
  onCancel: () => void
}

export default function ArtistDeleteConfirmDialog({
  artistName,
  linkedEventCount,
  onConfirmWithEvents,
  onConfirmKeepEvents,
  onCancel,
}: ArtistDeleteConfirmDialogProps) {
  const btnBase: React.CSSProperties = {
    width: '100%', height: 46, borderRadius: 999,
    border: 'none', cursor: 'pointer',
    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
    fontSize: 14, fontWeight: 700,
    WebkitTapHighlightColor: 'transparent',
  }
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 80,
    }}>
      <div
        onClick={onCancel}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.50)' }}
      />
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'var(--color-encore-bg)',
        borderRadius: 16, padding: '24px 20px 20px',
        width: 300,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999,
          background: 'rgba(255,59,48,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 4,
        }}>
          <Trash size={20} weight="regular" color="#FF3B30" />
        </div>
        <span style={{
          fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
          fontSize: 15, fontWeight: 700, color: 'var(--color-encore-green)',
          textAlign: 'center',
        }}>
          {artistName}を削除しますか？
        </span>

        {linkedEventCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 6,
            background: 'rgba(255,149,0,0.10)',
            borderRadius: 10, padding: '10px 12px',
            marginTop: 2, marginBottom: 4, width: '100%',
          }}>
            <Warning size={14} weight="regular" color="var(--color-encore-amber)" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{
              ...ty.bodySM, color: 'var(--color-encore-amber)', lineHeight: 1.5,
            }}>
              {linkedEventCount}件のイベントが紐づいています。どう扱いますか？
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginTop: 4 }}>
          <button
            onClick={onConfirmWithEvents}
            style={{ ...btnBase, background: '#FF3B30', color: '#fff' }}
          >
            {linkedEventCount > 0 ? `イベントも削除（${linkedEventCount}件）` : '削除する'}
          </button>
          {linkedEventCount > 0 && (
            <button
              onClick={onConfirmKeepEvents}
              style={{
                ...btnBase,
                background: 'transparent',
                border: '1.5px solid var(--color-encore-green)',
                color: 'var(--color-encore-green)',
              }}
            >
              イベントは残す
            </button>
          )}
          <button
            onClick={onCancel}
            style={{
              ...btnBase,
              background: 'transparent',
              color: 'var(--color-encore-text-muted)',
              fontSize: 13, fontWeight: 400,
            }}
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
