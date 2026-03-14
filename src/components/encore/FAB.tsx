'use client'

import React from 'react'
import { Plus } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

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
        height: 46,
        width: isExtended ? 'auto' : 46,
        padding: isExtended ? '0 20px' : 0,
        borderRadius: 999,
        background: 'var(--color-encore-green)',
        border: 'none',
        cursor: 'pointer',
        boxShadow: 'none',
        ...ty.bodySM,
        color: 'var(--color-encore-white)',
        letterSpacing: '0.02em',
        transition: 'opacity 0.15s, transform 0.15s',
        WebkitTapHighlightColor: 'transparent',
      }}
      onMouseDown={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseUp={e => (e.currentTarget.style.opacity = '1')}
    >
      <Plus size={20} weight="light" />
      {isExtended && <span>{label}</span>}
    </button>
  )
}
