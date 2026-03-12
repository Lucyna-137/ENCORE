'use client'

import React from 'react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

export default function BottomSheet({ isOpen, onClose, title, subtitle, children }: BottomSheetProps) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 500,
        background: isOpen ? 'rgba(0,0,0,0.52)' : 'rgba(0,0,0,0)',
        pointerEvents: isOpen ? 'auto' : 'none',
        transition: 'background 0.3s',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="encore-bottom-sheet-panel"
        style={{
          background: '#F2F0EB',
          borderRadius: '24px 24px 0 0',
          padding: '0 20px 40px',
          maxWidth: 540,
          margin: '0 auto',
          width: '100%',
          transform: isOpen ? 'translateY(0)' : 'translateY(110%)',
          transition: 'transform 0.36s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0 24px' }}>
          <div style={{ width: 36, height: 4, background: '#D8D4CD', borderRadius: 999 }} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, textAlign: 'center', marginBottom: 4, color: '#1B3C2D' }}>
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 13, color: '#6B6B6B', textAlign: 'center', marginBottom: 24 }}>
            {subtitle}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
