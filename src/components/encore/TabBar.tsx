'use client'

import React, { useState } from 'react'
import { House, Medal, Heart, Clock, User } from '@phosphor-icons/react'

interface TabItem {
  label: string
  icon: React.ReactNode
}

interface TabBarProps {
  items?: TabItem[]
  defaultActive?: number
}

const defaultItems: TabItem[] = [
  { label: 'HOME',    icon: <House    size={24} weight="light" /> },
  { label: 'REWARDS', icon: <Medal    size={24} weight="light" /> },
  { label: 'LIKE',    icon: <Heart    size={24} weight="light" /> },
  { label: 'HISTORY', icon: <Clock    size={24} weight="light" /> },
  { label: 'ME',      icon: <User     size={24} weight="light" /> },
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
          className="flex flex-col items-center gap-1 cursor-pointer transition-opacity duration-150 active:opacity-60 select-none"
          style={{ minWidth: 52, padding: '7px 12px 0', WebkitTapHighlightColor: 'transparent',
            color: active === i ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
            transition: 'color 0.2s',
          }}
        >
          {React.cloneElement(item.icon as React.ReactElement<{ color?: string }>, {
            color: active === i ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
          })}
          <span
            style={{
              fontFamily: 'var(--font-google-sans), sans-serif',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase' as const,
              color: active === i ? 'var(--color-encore-amber)' : 'var(--color-encore-text-muted)',
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
