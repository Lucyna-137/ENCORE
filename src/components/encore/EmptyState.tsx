import React from 'react'

interface EmptyStateProps {
  message?: string
  subMessage?: string
}

export default function EmptyState({
  message = 'まだ注文がありません',
  subMessage = 'お近くのENCOREで\nサラダを注文してみましょう',
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ padding: '56px 32px', gap: 14 }}
    >
      <div
        style={{
          width: 56,
          height: 20,
          background: 'rgba(0,0,0,0.07)',
          borderRadius: 999,
        }}
      />
      <div style={{ fontSize: 15, color: '#6B6B6B', textAlign: 'center', lineHeight: 1.7 }}>
        {message}
        {subMessage && (
          <>
            <br />
            <span style={{ whiteSpace: 'pre-line' }}>{subMessage}</span>
          </>
        )}
      </div>
    </div>
  )
}
