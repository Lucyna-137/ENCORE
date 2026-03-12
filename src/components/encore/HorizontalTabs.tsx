'use client'

import React, { useState, useRef, useEffect } from 'react'

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
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<(HTMLDivElement | null)[]>([])
  const stripRef = useRef<HTMLDivElement>(null)

  const updateIndicator = (index: number) => {
    const tab = tabRefs.current[index]
    const strip = stripRef.current
    if (tab && strip) {
      setIndicator({
        left: tab.offsetLeft - strip.scrollLeft,
        width: tab.offsetWidth,
      })
    }
  }

  useEffect(() => { updateIndicator(active) }, [])
  useEffect(() => { updateIndicator(active) }, [active])

  const handleClick = (i: number) => {
    setActive(i)
    onChange?.(i)
  }

  return (
    <div>
      <div
        ref={stripRef}
        className="flex encore-tab-strip"
        style={{
          background: 'var(--color-encore-bg)',
          boxShadow: 'inset 0 -1px 0 var(--color-encore-border-light)',
          position: 'relative',
        }}
      >
        {tabs.map((tab, i) => (
          <div
            key={i}
            ref={el => { tabRefs.current[i] = el }}
            onClick={() => handleClick(i)}
            className="cursor-pointer select-none"
            style={{
              flex: 1,
              textAlign: 'center',
              padding: '13px 8px 12px',
              fontSize: 14,
              color: active === i ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
              fontWeight: 400,
              transition: 'color 0.2s',
              whiteSpace: 'nowrap',
              minWidth: 64,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {tab}
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            height: 2,
            background: 'var(--color-encore-green)',
            left: indicator.left,
            width: indicator.width,
            transition: 'left 0.25s cubic-bezier(0.4,0,0.2,1), width 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}
        />
      </div>
      {children}
    </div>
  )
}
