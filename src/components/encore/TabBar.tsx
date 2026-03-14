'use client'

import React, { useState } from 'react'
import { House, MicrophoneStage, Ticket, ChartBar, GearSix } from '@phosphor-icons/react'

interface TabItem {
  label: string
  icon: React.ReactNode
}

interface TabBarProps {
  items?: TabItem[]
  defaultActive?: number
}

const defaultItems: TabItem[] = [
  { label: 'HOME',    icon: <House           size={24} weight="regular" /> },
  { label: 'ARTISTS', icon: <MicrophoneStage size={24} weight="regular" /> },
  { label: 'LOTTERY', icon: <Ticket          size={24} weight="regular" /> },
  { label: 'REPORT',  icon: <ChartBar        size={24} weight="regular" /> },
  { label: 'SETTINGS',icon: <GearSix         size={24} weight="regular" /> },
]

export default function TabBar({ items = defaultItems, defaultActive = 2 }: TabBarProps) {
  const [active, setActive] = useState(defaultActive)

  return (
    <div
      className="flex items-center justify-around"
      style={{
        height: 68,
        background: 'var(--color-encore-bg)',
        borderTop: '1px solid var(--color-encore-border-light)',
        padding: '0 4px 10px',
      }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          onClick={() => setActive(i)}
          className="flex flex-col items-center gap-1 cursor-pointer select-none"
          style={{ minWidth: 52, padding: '8px 12px 0', WebkitTapHighlightColor: 'transparent',
            color: active === i ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
            transition: 'color 0.2s',
          }}
        >
          {React.cloneElement(item.icon as React.ReactElement<{ color?: string }>, {
            color: active === i ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
          })}
          <span
            style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: active === i ? 'var(--color-encore-amber)' : 'var(--color-encore-green)',
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
