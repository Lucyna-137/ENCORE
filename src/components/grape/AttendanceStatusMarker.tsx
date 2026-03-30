'use client'

import React from 'react'
import { Circle, Check, Minus } from '@phosphor-icons/react'
import type { AttendanceStatus } from '@/lib/grape/types'

interface AttendanceStatusMarkerProps {
  status: AttendanceStatus
}

export default function AttendanceStatusMarker({ status }: AttendanceStatusMarkerProps) {
  switch (status) {
    case 'candidate':
      // 気になる: ○ 空洞円（アンバー）
      return (
        <Circle
          size={11}
          weight="regular"
          color="var(--color-encore-amber)"
        />
      )
    case 'planned':
      // 行く: ● 塗り円（グリーン）
      return (
        <Circle
          size={11}
          weight="fill"
          color="var(--color-encore-green)"
        />
      )
    case 'attended':
      // 参戦済み: ✓ チェック（グリーン、薄め）
      return (
        <Check
          size={11}
          weight="bold"
          color="var(--color-encore-green-muted)"
        />
      )
    case 'skipped':
      // スキップ: — ダッシュ（グレー）
      return (
        <Minus
          size={11}
          weight="bold"
          color="var(--color-encore-text-muted)"
        />
      )
    default:
      return null
  }
}
