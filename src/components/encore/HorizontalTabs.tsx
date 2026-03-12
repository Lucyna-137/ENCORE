'use client'

import React, { useState } from 'react'

interface HorizontalTabsProps {
  tabs: string[]
  defaultActive?: number
  onChange?: (index: number) => void
  children?: React.ReactNode
}

export default function HorizontalTabs({
  tabs,
  defaultActive = 0,
  onChange,
  children,
}: HorizontalTabsProps) {
  const [active, setActive] = useState(defaultActive)

  const handleClick = (i: number) => {
    setActive(i)
    onChange?.(i)
  }

  return (
    <div>
      <div
        className="flex encore-tab-strip"
        style={{
          borderBottom: '1px solid #D8D4CD',
          background: '#F2F0EB',
        }}
      >
        {tabs.map((tab, i) => (
          <div
            key={i}
            onClick={() => handleClick(i)}
            className="relative cursor-pointer select-none"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '13px 8px',
              fontSize: 14,
              color: active === i ? '#1B3C2D' : '#AEAAA3',
              fontWeight: active === i ? 600 : 400,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
              minWidth: 64,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {tab}
            {active === i && (
              <span
                className="encore-tab-active"
                style={{
                  position: 'absolute',
                  bottom: -1,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: '#1B3C2D',
                  animation: 'tab-slide-in 0.2s ease',
                  display: 'block',
                }}
              />
            )}
          </div>
        ))}
      </div>
      {children}
    </div>
  )
}
