'use client'

import React from 'react'
import { CaretRight } from '@phosphor-icons/react'
import * as ty from './typographyStyles'

interface ListRowProps {
  icon?: React.ReactNode
  label: string
  value?: string
  showChevron?: boolean
  onClick?: () => void
}

const ChevronRight = () => (
  <CaretRight size={14} weight="light" color="var(--color-encore-green)" />
)

export default function ListRow({ icon, label, value, showChevron = true, onClick }: ListRowProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center cursor-pointer transition-colors duration-100 active:bg-encore-bg-section"
      style={{
        padding: '15px 20px',
        background: 'var(--color-encore-bg)',
        gap: 14,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon && (
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ fontSize: 17, width: 24, textAlign: 'center', color: 'var(--color-encore-green)' }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1" style={ty.body}>
        {label}
      </div>
      {value && (
        <div style={{ ...ty.body, color: 'var(--color-encore-text-muted)' }}>{value}</div>
      )}
      {showChevron && (
        <div className="flex-shrink-0 flex items-center">
          <ChevronRight />
        </div>
      )}
    </div>
  )
}
