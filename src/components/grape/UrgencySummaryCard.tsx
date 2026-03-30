'use client'

import React from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive } from '@/lib/grape/types'

interface UrgencySummaryCardProps {
  lives: GrapeLive[]
  today: string  // 'YYYY-MM-DD'
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function fmtDate(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${Number(m)}/${Number(d)}`
}

export default function UrgencySummaryCard({ lives, today }: UrgencySummaryCardProps) {
  const weekEnd = addDays(today, 7)

  // 今日中: 入金期限が今日
  const todayItems = lives.filter(l => l.ticketDeadline === today)

  // 今週締切: 入金期限が今日より後〜7日以内（payment-due or applied）
  const weekItems = lives.filter(
    l => l.ticketDeadline && l.ticketDeadline > today && l.ticketDeadline <= weekEnd
  )

  // 未登録: 発券済み or 当選なのに座席情報が「未登録」
  const unregisteredItems = lives.filter(
    l => (l.ticketStatus === 'issued' || l.ticketStatus === 'paid') && l.seatInfo === '未登録'
  )

  if (todayItems.length === 0 && weekItems.length === 0 && unregisteredItems.length === 0) {
    return null
  }

  const ROW_GAP = 10

  return (
    <div
      style={{
        margin: '12px 16px 0',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(192,138,74,0.22)',
        background: 'rgba(192,138,74,0.06)',
      }}
    >
      {/* Card header */}
      <div
        style={{
          padding: '10px 14px 8px',
          borderBottom: '1px solid rgba(192,138,74,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--color-encore-amber)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            ...ty.sectionSM,
            color: 'var(--color-encore-amber)',
          }}
        >
          要対応サマリー
        </span>
        <span
          style={{
            marginLeft: 'auto',
            ...ty.caption,
            fontWeight: 700,
            fontSize: 11,
            color: 'var(--color-encore-amber)',
            background: 'rgba(192,138,74,0.18)',
            padding: '2px 8px',
            borderRadius: 999,
          }}
        >
          {todayItems.length + weekItems.length + unregisteredItems.length}件
        </span>
      </div>

      {/* Rows */}
      <div style={{ padding: '10px 14px 12px', display: 'flex', flexDirection: 'column', gap: ROW_GAP }}>

        {/* 今日中 */}
        {todayItems.length > 0 && (
          <SummaryRow
            label="今日中"
            labelColor="var(--color-encore-error)"
            dot="var(--color-encore-error)"
            items={todayItems}
            renderSub={l => l.ticketDeadline ? `${fmtDate(l.ticketDeadline)}まで` : ''}
          />
        )}

        {/* 今週締切 */}
        {weekItems.length > 0 && (
          <SummaryRow
            label="今週締切"
            labelColor="var(--color-encore-amber)"
            dot="var(--color-encore-amber)"
            items={weekItems}
            renderSub={l => l.ticketDeadline ? `${fmtDate(l.ticketDeadline)}まで` : ''}
          />
        )}

        {/* 未登録 */}
        {unregisteredItems.length > 0 && (
          <SummaryRow
            label="座席未登録"
            labelColor="var(--color-encore-green)"
            dot="var(--color-encore-green)"
            items={unregisteredItems}
            renderSub={l => l.date.slice(5).replace('-', '/')}
          />
        )}
      </div>
    </div>
  )
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────
function SummaryRow({
  label,
  labelColor,
  dot,
  items,
  renderSub,
}: {
  label: string
  labelColor: string
  dot: string
  items: GrapeLive[]
  renderSub: (l: GrapeLive) => string
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: dot, flexShrink: 0 }} />
        <span style={{ ...ty.caption, fontWeight: 700, fontSize: 10, color: labelColor, letterSpacing: '0.06em' }}>
          {label}
        </span>
        <span
          style={{
            ...ty.caption,
            fontSize: 10,
            color: labelColor,
            background: `${dot}18`,
            padding: '1px 6px',
            borderRadius: 999,
            fontWeight: 700,
          }}
        >
          {items.length}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 10 }}>
        {items.map(l => (
          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                ...ty.bodySM,
                fontSize: 12,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                marginRight: 8,
              }}
            >
              {l.title}
            </span>
            <span
              style={{
                ...ty.caption,
                fontSize: 10,
                color: labelColor,
                whiteSpace: 'nowrap',
                fontWeight: 700,
              }}
            >
              {renderSub(l)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
