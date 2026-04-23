'use client'

import React, { useRef, useState } from 'react'
import * as ty from './typographyStyles'

/** 1セグメント */
interface StackSlice {
  label: string
  value: number
  color: string
  /** サムネイル画像URL */
  image?: string
}

interface ArtistStackChartProps {
  data: StackSlice[]
  /** 中央バナーの左ラベル（例: "TOTAL EVENTS"） */
  totalLabel?: string
  /** 凡例の最大表示数（それ以上は +N として省略） */
  legendMax?: number
  /** この%以下のセグメントはポップアップ対象外（デフォルト 4%） */
  tapSkipPctBelow?: number
}

const BAR_HEIGHT = 18
const GAP = 2
const AUTO_DISMISS_MS = 300

export default function ArtistStackChart({
  data,
  totalLabel = 'TOTAL EVENTS',
  legendMax = 4,
  tapSkipPctBelow = 4,
}: ArtistStackChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const visible = data.slice(0, legendMax)
  const hiddenCount = data.length - visible.length
  const hiddenValue = data.slice(legendMax).reduce((s, d) => s + d.value, 0)

  // ポップアップ用 state
  const [activeIdx, setActiveIdx] = useState<number | null>(null)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearDismiss = () => {
    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current)
      dismissTimerRef.current = null
    }
  }
  const scheduleDismiss = (ms: number = AUTO_DISMISS_MS) => {
    clearDismiss()
    dismissTimerRef.current = setTimeout(() => setActiveIdx(null), ms)
  }

  // 累積値（セグメント中央位置の計算用）
  const cumulative: number[] = []
  data.reduce((acc, d, i) => {
    cumulative[i] = acc
    return acc + d.value
  }, 0)
  const centerPct = (i: number) => {
    if (total === 0) return 50
    const start = cumulative[i]
    const end   = cumulative[i] + data[i].value
    return ((start + end) / 2 / total) * 100
  }

  const activeSlice = activeIdx != null ? data[activeIdx] : null
  const activePct = activeSlice ? ((activeSlice.value / total) * 100) : 0

  return (
    <div
      style={{
        margin: '0 16px',
        borderRadius: 8,
        background: 'var(--color-encore-bg-section)',
        padding: '18px 18px 16px',
      }}
    >
      {/* ── ヒーロー：TOTAL EVENTS + 件数 + ARTISTS数 ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...ty.captionMuted,
              fontSize: 10,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {totalLabel}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 34,
              fontWeight: 700,
              color: 'var(--color-encore-green)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {total}
          </div>
        </div>
        <div
          style={{
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            color: 'var(--color-encore-amber)',
            paddingBottom: 3,
          }}
        >
          {data.length} ARTISTS
        </div>
      </div>

      {/* ── 水平スタックバー + ポップアップ ── */}
      <div style={{ position: 'relative', marginBottom: 18 }}>
        {/* ポップアップ（サムネイル吹き出し） */}
        {activeSlice && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: `${centerPct(activeIdx!)}%`,
              transform: 'translateX(-50%) translateY(-10px)',
              pointerEvents: 'none',
              zIndex: 10,
              animation: 'stackTooltipIn 0.16s ease-out both',
            }}
          >
            <div
              style={{
                background: 'var(--color-encore-bg)',
                borderRadius: 12,
                padding: '8px 12px 8px 8px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 6px 20px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.05)',
                whiteSpace: 'nowrap',
              }}
            >
              {/* サムネイル（画像 or カラーサークル） */}
              {activeSlice.image ? (
                <img
                  src={activeSlice.image}
                  alt={activeSlice.label}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    objectFit: 'cover',
                    boxShadow: `0 0 0 2px ${activeSlice.color}`,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: activeSlice.color, flexShrink: 0,
                }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 13, fontWeight: 700,
                  color: 'var(--color-encore-green)',
                  lineHeight: 1.2,
                }}>
                  {activeSlice.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 11, fontWeight: 400,
                  color: 'var(--color-encore-text-sub)',
                  marginTop: 2,
                  letterSpacing: '0.02em',
                }}>
                  {activeSlice.value} イベント · {Math.round(activePct)}%
                </div>
              </div>
            </div>
            {/* 下向き矢印 */}
            <div
              style={{
                position: 'absolute',
                top: '100%', left: '50%',
                transform: 'translateX(-50%)',
                width: 0, height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid var(--color-encore-bg)',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.08))',
              }}
            />
          </div>
        )}

        {/* バー本体 */}
        <div
          style={{
            display: 'flex',
            height: BAR_HEIGHT,
            borderRadius: BAR_HEIGHT / 2,
            overflow: 'hidden',
            gap: GAP,
            background: 'var(--color-encore-border-light)',
          }}
          onPointerLeave={() => scheduleDismiss()}
        >
          {data.map((slice, i) => {
            const pct = total > 0 ? (slice.value / total) * 100 : 0
            const tappable = pct >= tapSkipPctBelow
            return (
              <div
                key={`${slice.label}-${i}`}
                title={tappable ? '' : `${slice.label} · ${slice.value}`}
                role={tappable ? 'button' : undefined}
                tabIndex={tappable ? 0 : -1}
                onPointerDown={(e) => {
                  if (!tappable) return
                  clearDismiss()
                  setActiveIdx(i)
                  try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch {}
                }}
                onPointerUp={(e) => {
                  if (!tappable) return
                  try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch {}
                  scheduleDismiss()
                }}
                onPointerCancel={() => scheduleDismiss()}
                style={{
                  flex: slice.value,
                  background: slice.color,
                  borderRadius: 3,
                  minWidth: slice.value > 0 ? 4 : 0,
                  transition: 'flex 0.4s ease, filter 0.18s ease, transform 0.18s ease',
                  cursor: tappable ? 'pointer' : 'default',
                  transform: activeIdx === i ? 'scaleY(1.15)' : 'scaleY(1)',
                  filter: activeIdx !== null && activeIdx !== i ? 'opacity(0.45)' : 'none',
                  WebkitTapHighlightColor: 'transparent',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ── 凡例（色チップ + 名前 + %） ── */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px 14px',
          rowGap: 8,
        }}
      >
        {visible.map((slice, i) => {
          const pct = total > 0 ? Math.round((slice.value / total) * 100) : 0
          return (
            <div key={`${slice.label}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <span
                style={{
                  width: 8, height: 8,
                  borderRadius: 2,
                  background: slice.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12,
                  fontWeight: 400,
                  color: 'var(--color-encore-green)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: 120,
                }}
              >
                {slice.label}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  color: 'var(--color-encore-text-sub)',
                  flexShrink: 0,
                }}
              >
                {pct}%
              </span>
            </div>
          )
        })}
        {hiddenCount > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span
              style={{
                width: 8, height: 8,
                borderRadius: 2,
                background: 'var(--color-encore-border)',
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                fontSize: 12,
                fontWeight: 400,
                color: 'var(--color-encore-text-sub)',
              }}
            >
              他 {hiddenCount} 組
            </span>
            <span
              style={{
                fontFamily: 'var(--font-google-sans), sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--color-encore-text-muted)',
              }}
            >
              {total > 0 ? Math.round((hiddenValue / total) * 100) : 0}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
