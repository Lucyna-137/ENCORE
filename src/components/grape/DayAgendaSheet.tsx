'use client'

import React, { useEffect, useMemo, useState } from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, AttendanceStatus } from '@/lib/grape/types'
import LiveCompareCard from './LiveCompareCard'
import { Plus } from '@phosphor-icons/react'

type SortKey = 'time' | 'status'

const STATUS_ORDER: Record<AttendanceStatus, number> = {
  planned: 0, candidate: 1, attended: 2, skipped: 3,
}

interface DayAgendaSheetProps {
  date: string | null
  lives: GrapeLive[]
  onClose: () => void
  onAddLive?: () => void
  onStatusChange?: (id: string, status: AttendanceStatus) => void
  onEventTap?: (live: GrapeLive) => void
}

function formatDateJa(dateStr: string): string {
  const d = new Date(dateStr)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const dows = ['日', '月', '火', '水', '木', '金', '土']
  const dow = dows[d.getDay()]
  return `${month}月${day}日（${dow}）`
}

function getSummaryCounts(lives: GrapeLive[]) {
  const attended = lives.filter(l => l.attendanceStatus === 'attended').length
  const planned = lives.filter(l => l.attendanceStatus === 'planned').length
  const candidate = lives.filter(l => l.attendanceStatus === 'candidate').length
  return { attended, planned, candidate }
}

export default function DayAgendaSheet({ date, lives, onClose, onAddLive, onStatusChange, onEventTap }: DayAgendaSheetProps) {
  const [mounted, setMounted] = useState(false)
  const [sort, setSort] = useState<SortKey>('time')
  const [activeFilter, setActiveFilter] = useState<AttendanceStatus | null>(null)
  const isOpen = date !== null

  const sortedLives = useMemo(() => {
    const arr = activeFilter ? lives.filter(l => l.attendanceStatus === activeFilter) : [...lives]
    if (sort === 'time') arr.sort((a, b) => a.startTime.localeCompare(b.startTime))
    else arr.sort((a, b) => STATUS_ORDER[a.attendanceStatus] - STATUS_ORDER[b.attendanceStatus])
    return arr
  }, [lives, sort, activeFilter])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setMounted(true))
    } else {
      setMounted(false)
      setActiveFilter(null)
    }
  }, [isOpen])

  const counts = date ? getSummaryCounts(lives) : { attended: 0, planned: 0, candidate: 0 }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 200,
          background: isOpen && mounted ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'background 0.3s',
        }}
      />

      {/* Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 201,
          background: 'var(--color-encore-bg)',
          borderRadius: '24px 24px 0 0',
          transform: isOpen && mounted ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)',
          maxHeight: '75%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div
            style={{
              width: 36,
              height: 4,
              borderRadius: 999,
              background: 'var(--color-encore-border)',
            }}
          />
        </div>

        {/* Header */}
        <div style={{ padding: '0 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ ...ty.heading, fontSize: 18 }}>
              {date ? formatDateJa(date) : ''}
            </span>
            <span style={{ ...ty.captionMuted }}>
              {lives.length}件
            </span>
          </div>

          {/* Summary pills（タップでフィルター） */}
          {lives.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {counts.attended > 0 && (
                <button
                  onClick={() => setActiveFilter(f => f === 'attended' ? null : 'attended')}
                  style={{
                    ...ty.caption,
                    fontWeight: 700,
                    fontSize: 10,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: activeFilter === 'attended' ? 'var(--color-encore-green)' : 'var(--color-encore-bg-section)',
                    color: activeFilter === 'attended' ? 'var(--color-encore-white)' : 'var(--color-encore-green)',
                    border: activeFilter === 'attended' ? 'none' : '1px solid var(--color-encore-green)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  参戦済み {counts.attended}
                </button>
              )}
              {counts.planned > 0 && (
                <button
                  onClick={() => setActiveFilter(f => f === 'planned' ? null : 'planned')}
                  style={{
                    ...ty.caption,
                    fontWeight: 700,
                    fontSize: 10,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: activeFilter === 'planned' ? 'var(--color-grape-tint-08)' : 'var(--color-encore-bg-section)',
                    color: 'var(--color-encore-green)',
                    border: activeFilter === 'planned' ? 'none' : '1px solid var(--color-encore-border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  行く {counts.planned}
                </button>
              )}
              {counts.candidate > 0 && (
                <button
                  onClick={() => setActiveFilter(f => f === 'candidate' ? null : 'candidate')}
                  style={{
                    ...ty.caption,
                    fontWeight: 700,
                    fontSize: 10,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: activeFilter === 'candidate' ? 'var(--color-encore-amber)' : 'var(--color-encore-bg-section)',
                    color: activeFilter === 'candidate' ? 'var(--color-encore-white)' : 'var(--color-encore-text-muted)',
                    border: activeFilter === 'candidate' ? 'none' : '1px solid var(--color-encore-border-light)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  気になる {counts.candidate}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--color-encore-border-light)' }} />

        {/* Sort row */}
        <div style={{ display: 'flex', gap: 6, padding: '8px 20px 0', flexShrink: 0 }}>
          {(['time', 'status'] as SortKey[]).map((key) => {
            const label = key === 'time' ? '時間順' : 'ステータス順'
            const active = sort === key
            return (
              <button
                key={key}
                onClick={() => setSort(key)}
                style={{
                  padding: '3px 10px',
                  borderRadius: 999,
                  border: active ? 'none' : '1px solid var(--color-encore-border-light)',
                  background: active ? 'var(--color-encore-green)' : 'transparent',
                  color: active ? 'var(--color-encore-white)' : 'var(--color-encore-text-sub)',
                  fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Scrollable list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}
        >
          {sortedLives.map((live, idx) => (
            <div key={live.id}>
              <div
                onClick={() => onEventTap?.(live)}
                style={{ cursor: onEventTap ? 'pointer' : 'default' }}
              >
                <LiveCompareCard live={live} onStatusChange={onStatusChange} />
              </div>
              {idx < lives.length - 1 && (
                <div
                  style={{
                    height: 1,
                    background: 'var(--color-encore-border-light)',
                    margin: '4px 0',
                  }}
                />
              )}
            </div>
          ))}

          {sortedLives.length === 0 && (
            <div
              style={{
                ...ty.captionMuted,
                textAlign: 'center',
                padding: '32px 0',
              }}
            >
              この日のライブはありません
            </div>
          )}
        </div>

        {/* Footer: add button + close */}
        <div
          style={{
            padding: '12px 20px 32px',
            borderTop: '1px solid var(--color-encore-border-light)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <button
            onClick={onAddLive}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              width: '100%',
              height: 46,
              borderRadius: 999,
              background: 'var(--color-encore-bg-section)',
              border: 'none',
              cursor: 'pointer',
              ...ty.bodySM,
              color: 'var(--color-encore-green)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Plus size={14} weight="light" color="var(--color-encore-green)" />
            ライブを追加
          </button>
          <button
            onClick={onClose}
            style={{
              width: '100%',
              height: 40,
              borderRadius: 999,
              background: 'transparent',
              border: '1px solid var(--color-encore-border-light)',
              cursor: 'pointer',
              ...ty.bodySM,
              color: 'var(--color-encore-text-sub)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            一覧を閉じる
          </button>
        </div>
      </div>
    </>
  )
}
