'use client'

import React, { useState } from 'react'

interface TabItem {
  label: string
  icon: React.ReactNode
}

interface TabBarProps {
  items?: TabItem[]
  defaultActive?: number
}

const defaultItems: TabItem[] = [
  {
    label: 'HOME',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H5a1 1 0 01-1-1V9.5z"/>
        <path d="M9 21V12h6v9"/>
      </svg>
    ),
  },
  {
    label: 'REWARDS',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C10 2 8 4 8 7c0 2 1 3.5 2.5 4.5L9 20h6l-1.5-8.5C15 10.5 16 9 16 7c0-3-2-5-4-5z"/>
      </svg>
    ),
  },
  {
    label: 'LIKE',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    ),
  },
  {
    label: 'HISTORY',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <polyline points="12 7 12 12 15 15"/>
      </svg>
    ),
  },
  {
    label: 'ME',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M6 20v-1a6 6 0 0112 0v1"/>
      </svg>
    ),
  },
]

export default function TabBar({ items = defaultItems, defaultActive = 2 }: TabBarProps) {
  const [active, setActive] = useState(defaultActive)

  return (
    <div
      className="flex items-center justify-around"
      style={{
        height: 68,
        background: '#F2F0EB',
        borderTop: '1px solid #D8D4CD',
        padding: '0 4px 10px',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setActive(i)}
          className="flex flex-col items-center gap-1 cursor-pointer pt-1.5 transition-opacity duration-150 active:opacity-60 select-none"
          style={{ minWidth: 52, padding: '6px 12px 0', WebkitTapHighlightColor: 'transparent' }}
        >
          <div
            className="w-6 h-6"
            style={{
              stroke: active === i ? '#C08A4A' : '#AEAAA3',
              fill: 'none',
              strokeWidth: 1.5,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              transition: 'stroke 0.2s',
            }}
          >
            {React.cloneElement(item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>, {
              width: 24,
              height: 24,
              stroke: active === i ? '#C08A4A' : '#AEAAA3',
              strokeWidth: 1.5,
            })}
          </div>
          <span
            style={{
              fontFamily: '"Helvetica Neue", Arial, sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: active === i ? '#C08A4A' : '#AEAAA3',
              transition: 'color 0.2s',
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}
