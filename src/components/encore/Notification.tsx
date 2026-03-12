'use client'

import React, { useState } from 'react'

interface NotificationProps {
  message: string
  icon?: string
  onDismiss?: () => void
}

export default function Notification({ message, icon = '🌿', onDismiss }: NotificationProps) {
  const [dismissed, setDismissed] = useState(false)

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div
      className={`encore-notification flex items-start gap-3.5${dismissed ? ' dismissed' : ''}`}
      style={{
        background: '#1B3C2D',
        color: '#fff',
        padding: dismissed ? '0 16px' : '14px 16px',
        maxHeight: dismissed ? 0 : 200,
        opacity: dismissed ? 0 : 1,
      }}
    >
      <div style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{icon}</div>
      <div className="flex-1" style={{ lineHeight: 1.5, fontSize: 14 }}>{message}</div>
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 transition-opacity duration-150 hover:opacity-100"
        style={{
          fontSize: 15,
          opacity: 0.65,
          cursor: 'pointer',
          background: 'none',
          border: 'none',
          color: '#fff',
          padding: '2px 4px',
        }}
      >
        ×
      </button>
    </div>
  )
}
