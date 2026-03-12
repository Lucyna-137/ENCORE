'use client'

import React from 'react'
import { Plus } from '@phosphor-icons/react'

interface FABProps {
  label?: string
  onClick?: () => void
  variant?: 'default' | 'extended'
}

export default function FAB({ label, onClick, variant = 'default' }: FABProps) {
  const isExtended = variant === 'extended' && label

  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isExtended ? 8 : 0,
        height: 56,
        width: isExtended ? 'auto' : 56,
        padding: isExtended ? '0 24px' : 0,
        borderRadius: 999,
        background: 'var(--color-encore-green)',
        color: 'var(--color-encore-white)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'none',
        fontFamily: 'var(--font-google-sans), sans-serif',
        fontSize: 15,
        fontWeight: 400,
        letterSpacing: '0.02em',
        transition: 'opacity 0.15s, transform 0.15s',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseDown={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseUp={e => (e.currentTarget.style.opacity = '1')}
    >
      <Plus size={24} weight="light" />
      {isExtended && <span>{label}</span>}
    </button>
  )
}
