'use client'

import React, { useState, useRef, useEffect } from 'react'
import Button from './Button'

// ===== Full Calendar =====

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

// Dates that have order history dots
const sampleOrderDates: Set<string> = new Set(['2026-03-03', '2026-03-10', '2026-03-17'])

export default function Calendar() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells: Array<{ day: number; thisMonth: boolean; dateStr: string }> = []
  const prevDays = getDaysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1)
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevDays - i
    const m = viewMonth - 1 < 0 ? 11 : viewMonth - 1
    const y = viewMonth - 1 < 0 ? viewYear - 1 : viewYear
    cells.push({ day: d, thisMonth: false, dateStr: `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, thisMonth: true, dateStr: `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth + 1 > 11 ? 0 : viewMonth + 1
    const y = viewMonth + 1 > 11 ? viewYear + 1 : viewYear
    cells.push({ day: d, thisMonth: false, dateStr: `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  return (
    <div style={{ background: '#F2F0EB' }}>
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '16px 20px 10px' }}>
        <button
          onClick={prevMonth}
          className="flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#E8E5DF] active:bg-[#D8D4CD]"
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: 36, height: 36, color: '#1B3C2D', WebkitTapHighlightColor: 'transparent' }}
        >
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 1L1 6.5L7 12"/>
          </svg>
        </button>
        <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 15, fontWeight: 800, color: '#1B3C2D', letterSpacing: '0.04em', textAlign: 'center' }}>
          {monthLabel}
        </div>
        <button
          onClick={nextMonth}
          className="flex items-center justify-center rounded-full transition-colors duration-150 hover:bg-[#E8E5DF] active:bg-[#D8D4CD]"
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: 36, height: 36, color: '#1B3C2D', WebkitTapHighlightColor: 'transparent' }}
        >
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 1L7 6.5L1 12"/>
          </svg>
        </button>
      </div>

      {/* DOW row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 14px', borderBottom: '1px solid #D8D4CD' }}>
        {DOW_LABELS.map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: 'center',
              padding: '6px 0 10px',
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              color: i === 0 ? '#C0392B' : i === 6 ? '#3080C8' : '#AEAAA3',
              letterSpacing: '0.04em',
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '6px 14px 16px', gap: '2px 0' }}>
        {cells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr && cell.thisMonth
          const isSelected = cell.dateStr === selected && cell.thisMonth
          const dow = idx % 7
          const isSun = dow === 0
          const isSat = dow === 6
          const hasOrder = sampleOrderDates.has(cell.dateStr)

          let dateColor = '#1B3C2D'
          if (!cell.thisMonth) dateColor = '#AEAAA3'
          else if (isSelected) dateColor = '#fff'
          else if (isToday) dateColor = '#1B3C2D'
          else if (isSun) dateColor = '#C0392B'
          else if (isSat) dateColor = '#3080C8'

          return (
            <div
              key={`${cell.dateStr}-${idx}`}
              onClick={() => cell.thisMonth && setSelected(cell.dateStr)}
              className="flex flex-col items-center"
              style={{
                padding: '4px 2px',
                cursor: cell.thisMonth ? 'pointer' : 'default',
                gap: 3,
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              <div
                className={isSelected ? 'encore-cal-pop' : ''}
                style={{
                  width: 34,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  fontSize: 14,
                  color: dateColor,
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontWeight: isToday || isSelected ? 700 : 500,
                  background: isSelected ? '#1B3C2D' : 'transparent',
                  border: isToday && !isSelected ? '2.5px solid #1B3C2D' : 'none',
                  opacity: !cell.thisMonth ? 0.35 : 1,
                  transition: 'background 0.18s, color 0.18s, transform 0.12s',
                }}
              >
                {cell.day}
              </div>
              {hasOrder && cell.thisMonth && (
                <div className="flex gap-[3px] items-center justify-center" style={{ minHeight: 5 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C08A4A' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===== Reservation Calendar =====

const TIMESLOTS = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30']
const UNAVAILABLE = new Set(['11:00', '11:30', '14:00', '16:30'])
const JA_DOW = ['日', '月', '火', '水', '木', '金', '土']

function formatJaDate(dateStr: string, suffix: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日（${JA_DOW[d.getDay()]}）${suffix}`
}

export function ReservationCalendar() {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState<string>(todayStr)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDow = getFirstDayOfWeek(viewYear, viewMonth)

  const isPast = (dateStr: string) => dateStr < todayStr

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const cells: Array<{ day: number; thisMonth: boolean; dateStr: string }> = []
  const prevDays = getDaysInMonth(viewYear, viewMonth - 1 < 0 ? 11 : viewMonth - 1)
  for (let i = firstDow - 1; i >= 0; i--) {
    const d = prevDays - i
    const m = viewMonth - 1 < 0 ? 11 : viewMonth - 1
    const y = viewMonth - 1 < 0 ? viewYear - 1 : viewYear
    cells.push({ day: d, thisMonth: false, dateStr: `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, thisMonth: true, dateStr: `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
  }
  const remaining = 42 - cells.length
  for (let d = 1; d <= remaining; d++) {
    const m = viewMonth + 1 > 11 ? 0 : viewMonth + 1
    const y = viewMonth + 1 > 11 ? viewYear + 1 : viewYear
    cells.push({ day: d, thisMonth: false, dateStr: `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}` })
  }

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

  return (
    <div style={{ background: '#F2F0EB' }}>
      {/* Nav Header (no border-bottom) */}
      <div className="flex items-center justify-center relative" style={{ height: 52, background: '#F2F0EB' }}>
        <button className="absolute flex items-center p-2 bg-transparent border-none cursor-pointer" style={{ left: 14, color: '#1B3C2D', WebkitTapHighlightColor: 'transparent' }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1.5 8.5L9 16"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1B3C2D', letterSpacing: '0.01em' }}>受け取り日時を選択</span>
      </div>
      {/* Month nav */}
      <div className="flex items-center justify-between" style={{ padding: '16px 20px 10px' }}>
        <button onClick={prevMonth} className="flex items-center justify-center rounded-full hover:bg-[#E8E5DF]" style={{ background: 'none', border: 'none', cursor: 'pointer', width: 36, height: 36, color: '#1B3C2D' }}>
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1L1 6.5L7 12"/></svg>
        </button>
        <div style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 15, fontWeight: 800, color: '#1B3C2D', letterSpacing: '0.04em' }}>{monthLabel}</div>
        <button onClick={nextMonth} className="flex items-center justify-center rounded-full hover:bg-[#E8E5DF]" style={{ background: 'none', border: 'none', cursor: 'pointer', width: 36, height: 36, color: '#1B3C2D' }}>
          <svg width="8" height="13" viewBox="0 0 8 13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 1L7 6.5L1 12"/></svg>
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 14px', borderBottom: '1px solid #D8D4CD' }}>
        {DOW_LABELS.map((d, i) => (
          <div key={d} style={{ textAlign: 'center', padding: '6px 0 10px', fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 10, fontWeight: 700, color: i === 0 ? '#C0392B' : i === 6 ? '#3080C8' : '#AEAAA3', letterSpacing: '0.04em' }}>{d}</div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '6px 14px 16px', gap: '2px 0' }}>
        {cells.map((cell, idx) => {
          const isToday = cell.dateStr === todayStr && cell.thisMonth
          const isSelected = cell.dateStr === selected && cell.thisMonth
          const past = cell.thisMonth && isPast(cell.dateStr) && !isToday
          const dow = idx % 7
          const isSun = dow === 0
          const isSat = dow === 6

          let dateColor = '#1B3C2D'
          if (!cell.thisMonth || past) dateColor = '#AEAAA3'
          else if (isSelected) dateColor = '#fff'
          else if (isSun) dateColor = '#C0392B'
          else if (isSat) dateColor = '#3080C8'

          return (
            <div
              key={`${cell.dateStr}-${idx}`}
              onClick={() => cell.thisMonth && !past && setSelected(cell.dateStr)}
              className="flex flex-col items-center"
              style={{ padding: '4px 2px', cursor: cell.thisMonth && !past ? 'pointer' : 'default', gap: 3, userSelect: 'none' }}
            >
              <div
                className={isSelected ? 'encore-cal-pop' : ''}
                style={{
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', fontSize: 14, color: dateColor,
                  fontFamily: '"Helvetica Neue", Arial, sans-serif', fontWeight: isToday || isSelected ? 700 : 500,
                  background: isSelected ? '#1B3C2D' : 'transparent',
                  border: isToday && !isSelected ? '2.5px solid #1B3C2D' : 'none',
                  opacity: !cell.thisMonth || past ? 0.35 : 1,
                  transition: 'background 0.18s, color 0.18s',
                }}
              >
                {cell.day}
              </div>
            </div>
          )
        })}
      </div>
      {/* Timeslot section */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid #D8D4CD' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#6B6B6B', marginBottom: 12 }}>
          {formatJaDate(selected, 'の受け取り時間')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {TIMESLOTS.map((slot) => {
            const unavailable = UNAVAILABLE.has(slot)
            const isSelTime = selectedTime === slot
            return (
              <div
                key={slot}
                onClick={() => !unavailable && setSelectedTime(slot)}
                className={isSelTime ? 'encore-cal-pop' : ''}
                style={{
                  height: 42, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 13, fontWeight: 600,
                  background: isSelTime ? '#1B3C2D' : '#E8E5DF',
                  color: isSelTime ? '#fff' : unavailable ? '#AEAAA3' : '#1B3C2D',
                  border: `1.5px solid ${isSelTime ? '#1B3C2D' : 'transparent'}`,
                  cursor: unavailable ? 'default' : 'pointer',
                  opacity: unavailable ? 0.4 : 1,
                  textDecoration: unavailable ? 'line-through' : 'none',
                  transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                }}
              >
                {slot}
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        <Button variant="primary">この日時で予約する</Button>
      </div>
    </div>
  )
}

// ===== Week Strip =====

export function WeekStrip() {
  const today = new Date()
  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`

  const days: Array<{ label: string; num: number; dateStr: string; dow: number }> = []
  for (let i = -3; i <= 10; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const ds = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    days.push({
      label: ['SUN','MON','TUE','WED','THU','FRI','SAT'][d.getDay()],
      num: d.getDate(),
      dateStr: ds,
      dow: d.getDay(),
    })
  }

  const [selected, setSelected] = useState(todayStr)
  const stripRef = useRef<HTMLDivElement>(null)
  const todayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (todayRef.current && stripRef.current) {
      const parent = stripRef.current
      const child = todayRef.current
      parent.scrollLeft = child.offsetLeft - parent.offsetWidth / 2 + child.offsetWidth / 2
    }
  }, [])

  const selectedLabel = selected
    ? formatJaDate(selected, 'の注文')
    : '日付を選んでください'

  return (
    <div style={{ background: '#F2F0EB' }}>
      {/* Nav Header */}
      <div className="flex items-center justify-center relative" style={{ height: 52, background: '#F2F0EB', borderBottom: '1px solid #D8D4CD' }}>
        <button className="absolute flex items-center p-2 bg-transparent border-none cursor-pointer" style={{ left: 14, color: '#1B3C2D', WebkitTapHighlightColor: 'transparent' }}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 1L1.5 8.5L9 16"/></svg>
        </button>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#1B3C2D', letterSpacing: '0.01em' }}>注文履歴</span>
      </div>
      {/* Week strip */}
      <div
        ref={stripRef}
        className="encore-week-strip flex"
        style={{ padding: '12px 14px 8px', gap: 4 }}
      >
        {days.map((day) => {
          const isToday = day.dateStr === todayStr
          const isSelected = day.dateStr === selected
          const isSun = day.dow === 0
          const isSat = day.dow === 6

          return (
            <div
              key={day.dateStr}
              ref={isToday ? todayRef : undefined}
              onClick={() => setSelected(day.dateStr)}
              className="flex flex-col items-center hover:bg-[#E8E5DF] transition-colors duration-150"
              style={{
                gap: 5,
                minWidth: 44,
                padding: '8px 4px',
                cursor: 'pointer',
                borderRadius: 12,
                flexShrink: 0,
                WebkitTapHighlightColor: 'transparent',
                userSelect: 'none',
              }}
            >
              <div
                style={{
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: 10,
                  fontWeight: 700,
                  color: isSun ? '#C0392B' : isSat ? '#3080C8' : '#AEAAA3',
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.04em',
                }}
              >
                {day.label}
              </div>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: '"Helvetica Neue", Arial, sans-serif',
                  fontSize: 15,
                  fontWeight: 600,
                  color: isSelected ? '#fff' : '#1B3C2D',
                  background: isSelected ? '#1B3C2D' : 'transparent',
                  border: isToday && !isSelected ? '2px solid #1B3C2D' : 'none',
                  transition: 'background 0.18s, color 0.18s',
                }}
              >
                {day.num}
              </div>
              {sampleOrderDates.has(day.dateStr) && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#C08A4A' }} />
              )}
            </div>
          )
        })}
      </div>
      {/* Selected date label */}
      <div style={{ padding: '16px 20px', fontSize: 13, color: selected ? '#1B3C2D' : '#AEAAA3', textAlign: 'center', borderTop: '1px solid #D8D4CD' }}>
        {selectedLabel}
      </div>
    </div>
  )
}
