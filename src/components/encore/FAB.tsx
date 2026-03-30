'use client'

import React, { useRef } from 'react'
import { Plus } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

interface FABProps {
  label?: string
  onClick?: () => void
  variant?: 'default' | 'extended'
}

export default function FAB({ label, onClick, variant = 'default' }: FABProps) {
  const isExtended = variant === 'extended' && label
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const ripple = document.createElement('span')
      ripple.className = 'encore-ripple'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      btn.appendChild(ripple)
      setTimeout(() => ripple.remove(), 600)
    }
    onClick?.()
  }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isExtended ? 8 : 0,
        height: 46,
        width: isExtended ? 'auto' : 46,
        padding: isExtended ? '0 20px' : 0,
        borderRadius: 999,
        background: 'var(--color-encore-green)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'none',
        ...ty.bodySM,
        fontWeight: 700,
        color: 'var(--color-encore-white)',
        letterSpacing: '0.02em',
        transition: 'transform 0.1s',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <Plus size={20} weight="light" />
      {isExtended && <span>{label}</span>}
    </button>
  )
}
