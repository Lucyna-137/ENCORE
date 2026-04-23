'use client'

/**
 * ToastHost — GRAPE 共通トースト表示ホスト
 *
 * PhoneFrame 内に自動設置されるため、全ページで共通して利用可能。
 * トースト内容は `useGrapeToast` 経由でグローバル管理。
 *
 * 表示位置・スタイルは既存 Calendar UNDO トーストに準拠:
 *   - position: absolute, bottom: 80（TabBar 68 + 余白を避ける）
 *   - 背景 green、角丸 14、影 0 6px 24px rgba(0,0,0,0.22)
 *   - テキスト 13px/400 白、アクションボタン amber 13px/700
 *   - スライドアップアニメ cubic-bezier(0.32, 0.72, 0, 1) 0.32s
 *   - 2.4s 後に自動消失（useGrapeToast 側で管理）
 */

import React, { useEffect, useState } from 'react'
import { useGrapeToast } from '@/lib/grape/useGrapeToast'

export default function ToastHost() {
  const { toast, dismiss } = useGrapeToast()
  const [visible, setVisible] = useState(false)

  // トーストが新規 or 切替された際のエンターアニメーション制御
  useEffect(() => {
    if (toast) {
      // RAF で確実に次フレームで visible=true にして transition を発火
      const raf = requestAnimationFrame(() => setVisible(true))
      return () => cancelAnimationFrame(raf)
    } else {
      setVisible(false)
    }
  }, [toast?.id])

  if (!toast) return null

  return (
    <div
      style={{
        position: 'absolute',
        left: 12,
        right: 12,
        bottom: 80,
        zIndex: 900,
        transform: visible ? 'translateY(0)' : 'translateY(120%)',
        transition: 'transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)',
        // アクションボタン無しならイベント透過（下のコンテンツ操作を邪魔しない）
        pointerEvents: toast.action ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          background: 'var(--color-encore-green)',
          borderRadius: 14,
          padding: '13px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          boxShadow: '0 6px 24px rgba(0,0,0,0.22)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
            fontSize: 13,
            fontWeight: 400,
            color: 'var(--color-encore-white)',
            flex: 1,
          }}
        >
          {toast.message}
        </span>
        {toast.action && (
          <button
            onClick={() => {
              toast.action!.onClick()
              dismiss()
            }}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-encore-amber)',
              padding: '0 2px',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {toast.action.label}
          </button>
        )}
      </div>
    </div>
  )
}
