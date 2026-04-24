'use client'

/**
 * BirthdayCalendar — アーティスト / メンバー誕生日ピッカー用のカレンダー
 *
 * BrandedCalendar（QuickEventSheet 内）と同じ操作感を共有しつつ、
 * 誕生日ピッカー特有の扱い:
 *   - 年は固定（2000 年、表示しない）
 *   - 1 月 ↔ 12 月をラップアラウンドで循環（無限スクロール）
 *   - 左右スワイプで月切替 + スライドアニメーション
 *
 * 外側 state:
 *   - value   : 'YYYY-MM-DD' 形式。年は表示に使わず、月/日だけ反映
 *   - onSelect: 日付タップ時に親へ通知
 */

import React, { useEffect, useRef, useState } from 'react'
import { DOW_SUN_COLOR, DOW_SAT_COLOR } from '@/lib/grape/constants'

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土']

interface BirthdayCalendarProps {
  /** 'YYYY-MM-DD' or '' */
  value: string
  /** 日付選択時 */
  onSelect: (dateStr: string) => void
}

export default function BirthdayCalendar({ value, onSelect }: BirthdayCalendarProps) {
  // 選択済みの月を起点に初期化
  const initMonth = value ? parseInt(value.split('-')[1]) - 1 : new Date().getMonth()
  const [pickerMonth, setPickerMonth] = useState(initMonth)

  // 月切替のスライドアニメーション phase
  type NavPhase = 'exit-left' | 'exit-right' | 'enter-from-right' | 'enter-from-left' | null
  const [navPhase, setNavPhase] = useState<NavPhase>(null)
  // useEffect listener の closure が古い navPhase を捕まえるのを回避し、
  // 二重起動ガードは ref ベースで常に最新を参照する
  const animatingRef = useRef(false)

  const stepMonth = (dir: 'next' | 'prev') => {
    setPickerMonth(m => {
      if (dir === 'next') return (m + 1) % 12
      return (m + 11) % 12
    })
  }

  const animateMonthChange = (dir: 'next' | 'prev') => {
    if (animatingRef.current) return
    animatingRef.current = true
    setNavPhase(dir === 'next' ? 'exit-left' : 'exit-right')
    setTimeout(() => {
      stepMonth(dir)
      setNavPhase(dir === 'next' ? 'enter-from-right' : 'enter-from-left')
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setNavPhase(null)
        animatingRef.current = false
      }))
    }, 180)
  }

  // 選択日を分解
  const bdParts = value ? value.split('-').map(Number) : null
  const bdMonth = bdParts?.[1] ?? null
  const bdDay   = bdParts?.[2] ?? null

  // カレンダーグリッド生成（年は固定 2000 で曜日計算）
  const firstDow = new Date(2000, pickerMonth, 1).getDay()
  const daysInMonth = new Date(2000, pickerMonth + 1, 0).getDate()
  const calCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (calCells.length % 7 !== 0) calCells.push(null)

  const navBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    width: 44, height: 44, borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-google-sans), sans-serif',
    fontSize: 22, fontWeight: 700, lineHeight: 1,
    color: 'var(--color-encore-green)',
    WebkitTapHighlightColor: 'transparent',
  }

  // ── 左右スワイプで月切替（native touch events、passive:false で preventDefault）──
  const gridRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    let startX = 0, startY = 0
    let mode: 'h' | 'v' | null = null
    const GESTURE_DECIDE = 10
    const SWIPE_THRESHOLD = 50

    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      mode = null
    }
    const onMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (mode === null) {
        if (Math.abs(dx) > GESTURE_DECIDE && Math.abs(dx) > Math.abs(dy)) mode = 'h'
        else if (Math.abs(dy) > GESTURE_DECIDE) mode = 'v'
      }
      if (mode === 'h') e.preventDefault()
    }
    const onEnd = (e: TouchEvent) => {
      if (mode !== 'h') return
      const dx = e.changedTouches[0].clientX - startX
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        if (dx < 0) animateMonthChange('next')
        else animateMonthChange('prev')
      }
      mode = null
    }
    el.addEventListener('touchstart', onStart, { passive: true })
    el.addEventListener('touchmove', onMove, { passive: false })
    el.addEventListener('touchend', onEnd, { passive: true })
    return () => {
      el.removeEventListener('touchstart', onStart)
      el.removeEventListener('touchmove', onMove)
      el.removeEventListener('touchend', onEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerMonth, navPhase])

  return (
    <div style={{
      borderRadius: 10,
      border: '1px solid var(--color-encore-border-light)',
      background: 'var(--color-encore-bg)',
      padding: '12px 10px 14px',
    }}>
      {/* ナビゲーション: 「◯月」の数字を大きく強調 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
        <button onClick={() => animateMonthChange('prev')} style={navBtnStyle}>‹</button>
        <span style={{
          flex: 1, textAlign: 'center',
          display: 'inline-flex', alignItems: 'baseline', justifyContent: 'center', gap: 2,
          fontFamily: 'var(--font-google-sans), sans-serif',
          color: 'var(--color-encore-green)',
        }}>
          <span style={{ fontSize: 22, fontWeight: 700 }}>
            {pickerMonth + 1}
          </span>
          <span style={{ fontSize: 16, fontWeight: 700 }}>月</span>
        </span>
        <button onClick={() => animateMonthChange('next')} style={navBtnStyle}>›</button>
      </div>

      {/* 曜日ヘッダー */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 4 }}>
        {DOW_LABELS.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', padding: '2px 0',
            fontFamily: 'var(--font-google-sans), sans-serif',
            fontSize: 12, fontWeight: 700,
            color: i === 0 ? DOW_SUN_COLOR : i === 6 ? DOW_SAT_COLOR : 'var(--color-encore-text-muted)',
          }}>{d}</div>
        ))}
      </div>

      {/* 日グリッド（スワイプ + スライドアニメ） */}
      <div
        ref={gridRef}
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
          rowGap: 4,
          touchAction: 'pan-y',
          transform: (() => {
            if (navPhase === 'exit-left')        return 'translateX(-100%)'
            if (navPhase === 'exit-right')       return 'translateX(100%)'
            if (navPhase === 'enter-from-right') return 'translateX(100%)'
            if (navPhase === 'enter-from-left')  return 'translateX(-100%)'
            return 'translate(0,0)'
          })(),
          transition: (navPhase === 'enter-from-right' || navPhase === 'enter-from-left')
            ? 'none'
            : 'transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {calCells.map((day, idx) => {
          if (!day) return <div key={`e-${idx}`} style={{ height: 42 }} />
          const isSelected = day === bdDay && pickerMonth + 1 === bdMonth
          const dow = (firstDow + (day - 1)) % 7
          return (
            <button
              key={day}
              onClick={() => {
                const mm = String(pickerMonth + 1).padStart(2, '0')
                const dd = String(day).padStart(2, '0')
                onSelect(`2000-${mm}-${dd}`)
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 42, border: 'none', cursor: 'pointer', padding: 0,
                background: 'transparent',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? 'var(--color-encore-green)' : 'transparent',
                transition: 'background 0.12s',
              }}>
                <span style={{
                  fontFamily: 'var(--font-google-sans), sans-serif',
                  fontSize: 16, fontWeight: isSelected ? 700 : 400,
                  color: isSelected
                    ? '#fff'
                    : dow === 0 ? DOW_SUN_COLOR
                    : dow === 6 ? DOW_SAT_COLOR
                    : 'var(--color-encore-green)',
                }}>
                  {day}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
