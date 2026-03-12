import React from 'react'

interface EmptyStateProps {
  message?: string
  subMessage?: string
}

export default function EmptyState({
  message = 'まだ参加予定のライブはありません',
  subMessage = 'お気に入りのアーティストを\nフォローしてみましょう',
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
          background: 'var(--shadow-card)',
          borderRadius: 999,
        }}
      />
      <div style={{ fontSize: 15, color: 'var(--color-encore-text-sub)', textAlign: 'center', lineHeight: 1.7 }}>
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
