'use client'

import React, { useState, useRef, useEffect } from 'react'
import * as ty from './typographyStyles'

interface HorizontalTabsProps {
  tabs: (string | React.ReactNode)[]
  defaultActive?: number
  active?: number
  onChange?: (index: number) => void
  children?: React.ReactNode
}

export default function HorizontalTabs({
  tabs,
  defaultActive = 0,
  active: controlledActive,
  onChange,
  children,
}: HorizontalTabsProps) {
  const [internalActive, setInternalActive] = useState(defaultActive)
  const active = controlledActive ?? internalActive
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
    if (controlledActive === undefined) setInternalActive(i)
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
              ...ty.bodySM,
              fontSize: 14,
              flex: 1,
              textAlign: 'center',
              padding: '14px 8px 13px',
              color: active === i ? 'var(--color-encore-green)' : 'var(--color-encore-text-muted)',
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
