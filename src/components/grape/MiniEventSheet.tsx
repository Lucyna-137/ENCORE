'use client'

import React, { useState, useEffect } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import { DOW_SUN_FIRST } from '@/lib/grape/constants'

interface MiniEventSheetProps {
  date: string
  hour: number
  onCancel: () => void
  onExpand: () => void
}

function formatSlotLabel(date: string, hour: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const dow = DOW_SUN_FIRST[dateObj.getDay()]
  const startHH = String(hour).padStart(2, '0')
  const endHH = String(Math.min(hour + 1, 23)).padStart(2, '0')
  return `${month}月${day}日（${dow}）· ${startHH}:00 – ${endHH}:00`
}

export default function MiniEventSheet({ date, hour, onCancel, onExpand }: MiniEventSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const handleCancel = () => {
    setIsClosing(true)
    setTimeout(() => onCancel(), 340)
  }

  const isVisible = mounted && !isClosing

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 250,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      {/* Overlay */}
      <div
        onClick={handleCancel}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.28)',
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.3s',
          pointerEvents: 'auto',
        }}
      />

      {/* Mini panel */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          background: 'var(--color-encore-bg)',
          borderRadius: '20px 20px 0 0',
          padding: '0 0 20px',
          transform: isVisible ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)',
          pointerEvents: 'auto',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '10px 0 6px',
          }}
        >
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: 'var(--color-encore-border)',
            }}
          />
        </div>

        {/* Top row: キャンセル / 保存 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '4px 16px 0',
            gap: 8,
          }}
        >
          <button
            onClick={handleCancel}
            style={{
              ...ty.body,
              color: 'var(--color-encore-text-sub)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 4px',
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            キャンセル
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={onExpand}
            style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--color-encore-white)',
              background: 'var(--color-encore-green)',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 999,
              flexShrink: 0,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            保存
          </button>
        </div>

        {/* タイトル入力エリア（タップでフル展開） */}
        <div
          onClick={onExpand}
          style={{
            padding: '10px 20px 4px',
            cursor: 'text',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              fontSize: 16,
              fontWeight: 400,
              color: 'var(--color-encore-text-muted)',
            }}
          >
            イベント名を入力
          </span>
        </div>

        {/* 日時ラベル */}
        <div style={{ padding: '0 20px 0' }}>
          <span style={{ ...ty.bodySM, color: 'var(--color-encore-text-sub)' }}>
            {formatSlotLabel(date, hour)}
          </span>
        </div>
      </div>
    </div>
  )
}
