import React from 'react'
import * as ty from '@/components/encore/typographyStyles'
import type { GrapeLive, AttendanceStatus } from '@/lib/grape/types'
import { ATTENDANCE_LABEL as STATUS_LABEL } from '@/lib/grape/constants'
import AttendanceStatusMarker from './AttendanceStatusMarker'

interface LiveCompareCardProps {
  live: GrapeLive
  onStatusChange?: (id: string, status: AttendanceStatus) => void
}

export default function LiveCompareCard({ live, onStatusChange }: LiveCompareCardProps) {
  const timeLabel = live.openingTime
    ? `開場 ${live.openingTime}／開演 ${live.startTime}〜`
    : live.endTime
    ? `開演 ${live.startTime}〜${live.endTime}`
    : `開演 ${live.startTime}〜`

  return (
    <div
      style={{
        background: 'var(--color-encore-bg)',
        padding: 12,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Main row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Cover image */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            overflow: 'hidden',
            flexShrink: 0,
            background: 'var(--color-encore-bg-section)',
          }}
        >
          {live.coverImage && (
            <img
              src={live.coverImage}
              alt={live.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          )}
        </div>

        {/* Text content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...ty.section,
              fontSize: 13,
              lineHeight: 1.35,
              marginBottom: 2,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}
          >
            {live.title}
          </div>
          <div
            style={{
              ...ty.sub,
              fontSize: 11,
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {live.artists ? live.artists.join(' , ') : live.artist}
          </div>
          <div
            style={{
              ...ty.captionMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {live.venue}
          </div>
          <div style={{ ...ty.captionMuted, marginTop: 2 }}>{timeLabel}</div>
        </div>
      </div>

      {/* Bottom row: status + liveType */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <AttendanceStatusMarker status={live.attendanceStatus} />
          <span style={{ ...ty.captionMuted, fontSize: 11 }}>
            {STATUS_LABEL[live.attendanceStatus]}
          </span>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              fontFamily: 'var(--font-google-sans), var(--font-noto-jp), sans-serif',
              padding: '1px 6px',
              borderRadius: 999,
              background: 'var(--color-encore-bg-section)',
              color: 'var(--color-encore-text-sub)',
            }}
          >
            {live.liveType}
          </span>
        </div>

        {onStatusChange && (
          <button
            onClick={() => {
              const next: AttendanceStatus =
                live.attendanceStatus === 'candidate' ? 'planned' :
                live.attendanceStatus === 'planned' ? 'attended' :
                'candidate'
              onStatusChange(live.id, next)
            }}
            style={{
              background: 'var(--color-encore-bg-section)',
              border: 'none',
              borderRadius: 999,
              padding: '3px 10px',
              cursor: 'pointer',
              ...ty.caption,
              fontWeight: 700,
              fontSize: 10,
              color: 'var(--color-encore-green)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            変更
          </button>
        )}
      </div>
    </div>
  )
}
