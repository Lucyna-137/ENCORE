'use client'

import React from 'react'

interface ListRowProps {
  icon?: React.ReactNode
  label: string
  value?: string
  showChevron?: boolean
  onClick?: () => void
}

const ChevronRight = () => (
  <svg width="7" height="12" viewBox="0 0 7 12" fill="none" stroke="#AEAAA3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1l5 5-5 5"/>
  </svg>
)

export default function ListRow({ icon, label, value, showChevron = true, onClick }: ListRowProps) {
  return (
    <div
      onClick={onClick}
      className="flex items-center cursor-pointer transition-colors duration-100 active:bg-[#E8E5DF]"
      style={{
        padding: '15px 20px',
        background: '#F2F0EB',
        gap: 14,
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {icon && (
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{ fontSize: 17, width: 24, textAlign: 'center', color: '#1B3C2D' }}
        >
          {icon}
        </div>
      )}
      <div className="flex-1" style={{ fontSize: 15, color: '#1B3C2D' }}>
        {label}
      </div>
      {value && (
        <div style={{ fontSize: 14, color: '#AEAAA3' }}>{value}</div>
      )}
      {showChevron && (
        <div className="flex-shrink-0 flex items-center">
          <ChevronRight />
        </div>
      )}
    </div>
  )
}
