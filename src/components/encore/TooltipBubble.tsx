import React from 'react'

interface TooltipBubbleProps {
  children: React.ReactNode
  variant?: 'tail-top' | 'tail-none' | 'tail-left' | 'tail-right' | 'chat-left' | 'chat-right'
}

export default function TooltipBubble({
  children,
  variant = 'tail-none',
}: TooltipBubbleProps) {
  const tailClass =
    variant === 'tail-top' || variant === 'tail-left' || variant === 'tail-right'
      ? `encore-tooltip-${variant}`
      : ''

  const variantStyle: React.CSSProperties =
    variant === 'chat-left'
      ? { borderRadius: '16px 16px 16px 4px', display: 'inline-block' }
      : variant === 'chat-right'
      ? { borderRadius: '16px 16px 4px 16px', display: 'inline-block' }
      : { borderRadius: 24, display: 'inline-block' }

  const wrapperStyle: React.CSSProperties =
    variant === 'chat-right' ? { textAlign: 'right' as const } : {}

  return (
    <div style={wrapperStyle}>
      <span
        className={tailClass}
        style={{
          background: 'var(--color-encore-green)',
          color: 'var(--color-encore-white)',
          padding: '12px 20px',
          fontSize: 14,
          lineHeight: 1.4,
          position: 'relative',
          ...variantStyle,
        }}
      >
        {children}
      </span>
    </div>
  )
}
