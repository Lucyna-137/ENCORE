'use client'

import React, { useState, useEffect } from 'react'
import { Warning } from '@phosphor-icons/react'
import * as ty from '@/components/encore/typographyStyles'
import { DOW_SUN_FIRST } from '@/lib/grape/constants'
import type { GrapeLive } from '@/lib/grape/types'

interface MiniEventSheetProps {
  date: string
  /** 開始時刻（分） */
  startMin: number
  /** 終了時刻（分）。指定あれば範囲、なければ +60 */
  endMin?: number
  /** 同日の既存イベント一覧（プレビュー表示用） */
  sameDayLives?: GrapeLive[]
  onCancel: () => void
  onExpand: () => void
}

function fmtMin(m: number): string {
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

function formatSlotLabel(date: string, startMin: number, endMin?: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const dow = DOW_SUN_FIRST[dateObj.getDay()]
  const effectiveEnd = endMin != null ? endMin : Math.min(startMin + 60, 24 * 60 - 1)
  return `${month}月${day}日（${dow}）· ${fmtMin(startMin)} – ${fmtMin(effectiveEnd)}`
}

function parseTimeMin(t: string | undefined): number | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return null
  return h * 60 + m
}

/** 新規作成の時間帯と重複するか */
function isOverlap(live: GrapeLive, newStartMin: number, newEndMin: number): boolean {
  const s = parseTimeMin(live.startTime) ?? 0
  const e = parseTimeMin(live.endTime) ?? s + 60
  return s < newEndMin && e > newStartMin
}

export default function MiniEventSheet({ date, startMin, endMin, sameDayLives, onCancel, onExpand }: MiniEventSheetProps) {
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
              fontSize: 14,
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
            {formatSlotLabel(date, startMin, endMin)}
          </span>
        </div>

        {/* 同日の既存イベントプレビュー */}
        {sameDayLives && sameDayLives.length > 0 && (() => {
          const effectiveEnd = endMin != null ? endMin : startMin + 60
          const conflicts = sameDayLives.filter(l => isOverlap(l, startMin, effectiveEnd))
          const sorted = [...sameDayLives].sort((a, b) => {
            const sa = parseTimeMin(a.startTime) ?? 0
            const sb = parseTimeMin(b.startTime) ?? 0
            return sa - sb
          })
          return (
            <div style={{
              margin: '12px 20px 0',
              padding: '10px 12px',
              background: conflicts.length > 0 ? 'rgba(219, 96, 80, 0.08)' : 'var(--color-encore-bg-section)',
              borderRadius: 10,
              border: conflicts.length > 0 ? '1px solid rgba(219, 96, 80, 0.24)' : '1px solid var(--color-encore-border-light)',
            }}>
              {/* ヘッダー */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {conflicts.length > 0 && (
                  <Warning size={13} weight="fill" color="var(--color-encore-error)" />
                )}
                <span style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12, fontWeight: 700,
                  color: conflicts.length > 0 ? 'var(--color-encore-error)' : 'var(--color-encore-text-muted)',
                  letterSpacing: '0.02em',
                }}>
                  {conflicts.length > 0
                    ? `同じ時間帯に ${conflicts.length} 件のイベント`
                    : `同日の予定 · ${sameDayLives.length} 件`}
                </span>
              </div>
              {/* イベントリスト（最大3件表示） */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sorted.slice(0, 3).map(live => {
                  const overlap = isOverlap(live, startMin, effectiveEnd)
                  return (
                    <div key={live.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {live.coverImage && (
                        <img
                          src={live.coverImage}
                          alt=""
                          style={{ width: 18, height: 18, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
                        />
                      )}
                      <span style={{
                        fontFamily: 'var(--font-google-sans), sans-serif',
                        fontSize: 12, fontWeight: 700,
                        color: overlap ? 'var(--color-encore-error)' : 'var(--color-encore-text-sub)',
                        flexShrink: 0,
                        fontVariantNumeric: 'tabular-nums',
                      }}>
                        {live.startTime}{live.endTime ? `〜${live.endTime}` : ''}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                        fontSize: 12, fontWeight: 400,
                        color: 'var(--color-encore-green)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1, minWidth: 0,
                      }}>
                        {live.title}
                      </span>
                    </div>
                  )
                })}
                {sorted.length > 3 && (
                  <div style={{
                    fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                    fontSize: 12, fontWeight: 400,
                    color: 'var(--color-encore-text-muted)',
                    paddingLeft: 2,
                  }}>
                    ...他 {sorted.length - 3} 件
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
