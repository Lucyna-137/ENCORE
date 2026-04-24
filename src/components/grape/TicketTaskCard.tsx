'use client'

import React from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, TicketStatus } from '@/lib/grape/types'
import { TICKET_STATUS_CONFIG as STATUS_CONFIG, TODAY } from '@/lib/grape/constants'

interface TicketTaskCardProps {
  live: GrapeLive
  onCardTap?: (live: GrapeLive) => void
  onQuickAction?: (live: GrapeLive, action: QuickActionType) => void
}

export type QuickActionType = 'apply' | 'update-result' | 'mark-paid' | 'register-seat' | 'detail'


// ─── Priority marker ──────────────────────────────────────────────────────────
const PRIORITY_COLOR: Record<string, string> = {
  high:   'var(--color-encore-error)',
  medium: 'var(--color-encore-amber)',
  low:    'var(--color-encore-border)',
}

// ─── Quick actions by status ──────────────────────────────────────────────────
function getQuickActions(status: TicketStatus | undefined): QuickActionType[] {
  switch (status) {
    case 'before-sale':
      return ['apply', 'detail']
    case 'waiting':
      return ['update-result', 'detail']
    case 'payment-due':
      return ['mark-paid', 'detail']
    case 'pay-at-door':
    case 'paid':
      return ['register-seat', 'detail']
    case 'issued':
      return ['register-seat', 'detail']
    case 'done':
    default:
      return ['detail']
  }
}

const ACTION_LABEL: Record<QuickActionType, string> = {
  'apply':           '申し込む',
  'update-result':   '結果を更新',
  'mark-paid':       '入金済みにする',
  'register-seat':   '座席を登録',
  'detail':          '詳細 →',
}

function isUrgentAction(action: QuickActionType): boolean {
  return action === 'mark-paid' || action === 'apply'
}

// ─── Deadline pill ────────────────────────────────────────────────────────────
function DeadlinePill({ deadline, today }: { deadline: string; today: string }) {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - new Date(today).getTime()) / 86400000
  )
  const isToday   = daysLeft === 0
  const isUrgent  = daysLeft <= 3
  const color = isToday
    ? 'var(--color-encore-error)'
    : isUrgent
      ? 'var(--color-encore-amber)'
      : 'var(--color-encore-text-sub)'
  const bg = isToday
    ? 'rgba(220,53,69,0.10)'
    : isUrgent
      ? 'rgba(192,138,74,0.12)'
      : 'var(--color-encore-bg-section)'

  const [, m, d] = deadline.split('-')
  const label = isToday
    ? `今日まで`
    : daysLeft < 0
      ? `${Number(m)}/${Number(d)} 期限切れ`
      : `${Number(m)}/${Number(d)}まで`

  return (
    <span
      style={{
        ...ty.caption,
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 7px',
        borderRadius: 999,
        background: bg,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function TicketTaskCard({ live, onCardTap, onQuickAction }: TicketTaskCardProps) {
  const statusInfo = live.ticketStatus ? STATUS_CONFIG[live.ticketStatus] : null
  const priorityColor = live.priority ? PRIORITY_COLOR[live.priority] : undefined
  const quickActions = getQuickActions(live.ticketStatus)
  const isUrgent = live.ticketStatus === 'payment-due'
  const isDone = live.ticketStatus === 'done'

  return (
    <div
      style={{
        background: 'var(--color-encore-bg)',
        borderLeft: priorityColor ? `3px solid ${priorityColor}` : '3px solid transparent',
        cursor: onCardTap ? 'pointer' : 'default',
        opacity: isDone ? 0.65 : 1,
        transition: 'opacity 0.15s',
      }}
      onClick={() => onCardTap?.(live)}
    >
      {/* Main content row */}
      <div
        style={{
          padding: '14px 16px 10px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        {/* Cover art */}
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--color-encore-bg-section)',
            position: 'relative',
          }}
        >
          {live.coverImage ? (
            <img
              src={live.coverImage}
              alt={live.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : live.artistImage ? (
            <img
              src={live.artistImage}
              alt={live.artist}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }}
            />
          ) : null}
        </div>

        {/* Center info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <div
            style={{
              ...ty.sectionSM,
              marginBottom: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {live.title}
          </div>

          {/* Artist · Venue */}
          <div
            style={{
              ...ty.captionMuted,
              fontSize: 12,
              marginBottom: 6,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {live.artists ? live.artists.join(' , ') : live.artist}{live.venue ? ` · ${live.venue}` : ''}
          </div>

          {/* Date row + Deadline + Announcement */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginBottom: 4 }}>
            <span style={{ ...ty.captionMuted, fontSize: 12 }}>
              {live.date.slice(5).replace('-', '/')}
            </span>

            {live.ticketDeadline && (
              <DeadlinePill deadline={live.ticketDeadline} today={TODAY} />
            )}

            {live.announcementDate && !live.ticketDeadline && (
              <span
                style={{
                  ...ty.caption,
                  fontSize: 10,
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: 'var(--color-encore-bg-section)',
                  color: 'var(--color-encore-text-sub)',
                  whiteSpace: 'nowrap',
                }}
              >
                発表 {live.announcementDate.slice(5).replace('-', '/')}
              </span>
            )}
          </div>

          {/* 発券状態 · 座席状態 */}
          {(live.ticketStatus === 'issued' || live.ticketStatus === 'paid' || live.ticketStatus === 'payment-due') && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {/* 発券状態 */}
              <span
                style={{
                  ...ty.caption,
                  fontSize: 10,
                  color: 'var(--color-encore-text-sub)',
                }}
              >
                発券: {live.ticketStatus === 'issued' ? '発券済み' : '未発券'}
              </span>

              {/* 座席状態 */}
              {live.seatInfo && (
                <>
                  <span style={{ ...ty.captionMuted, fontSize: 10 }}>·</span>
                  <span
                    style={{
                      ...ty.caption,
                      fontSize: 10,
                      color: live.seatInfo === '未登録'
                        ? 'var(--color-encore-amber)'
                        : 'var(--color-encore-text-sub)',
                      fontWeight: live.seatInfo === '未登録' ? 700 : 400,
                    }}
                  >
                    座席: {live.seatInfo}
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: status badge + priority */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 6,
            flexShrink: 0,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {statusInfo && (
            <span
              style={{
                ...ty.caption,
                fontWeight: 700,
                fontSize: 10,
                padding: '3px 9px',
                borderRadius: 999,
                background: isUrgent
                  ? 'var(--color-encore-amber)'
                  : statusInfo.bg,
                color: isUrgent
                  ? 'var(--color-encore-white)'
                  : statusInfo.color,
                whiteSpace: 'nowrap',
                boxShadow: isUrgent ? '0 0 0 2px rgba(192,138,74,0.2)' : 'none',
              }}
            >
              {statusInfo.label}
            </span>
          )}

          {/* Priority marker */}
          {live.priority && live.priority !== 'low' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: PRIORITY_COLOR[live.priority],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  ...ty.caption,
                  fontSize: 10,
                  color: PRIORITY_COLOR[live.priority],
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                {live.priority === 'high' ? 'HIGH' : 'MED'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick action row */}
      {quickActions.length > 0 && !isDone && (
        <div
          style={{
            paddingLeft: 88,
            paddingRight: 16,
            paddingBottom: 12,
            display: 'flex',
            gap: 6,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {quickActions.map(action => (
            <button
              key={action}
              onClick={() => onQuickAction?.(live, action)}
              style={{
                height: 28,
                padding: '0 11px',
                borderRadius: 999,
                border: isUrgentAction(action) && !isDone
                  ? 'none'
                  : '1px solid var(--color-encore-border)',
                background: isUrgentAction(action) && action !== 'detail'
                  ? 'var(--color-encore-green)'
                  : 'transparent',
                cursor: 'pointer',
                ...ty.caption,
                fontSize: 12,
                fontWeight: 700,
                color: isUrgentAction(action) && action !== 'detail'
                  ? 'var(--color-encore-white)'
                  : action === 'detail'
                    ? 'var(--color-encore-text-sub)'
                    : 'var(--color-encore-green)',
                whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {ACTION_LABEL[action]}
            </button>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-encore-border-light)', margin: '0 16px' }} />
    </div>
  )
}
