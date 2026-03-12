import React from 'react'

interface BadgeProps {
  variant?: 'green' | 'amber' | 'muted' | 'outline' | 'light-green'
  children: React.ReactNode
}

const variantStyles: Record<string, React.CSSProperties> = {
  green: { background: '#1B3C2D', color: '#fff' },
  amber: { background: '#C08A4A', color: '#fff' },
  muted: { background: '#E8E5DF', color: '#6B6B6B' },
  outline: { background: 'transparent', border: '1.5px solid #D8D4CD', color: '#6B6B6B' },
  'light-green': { background: 'rgba(27,60,45,0.08)', color: '#1B3C2D' },
}

export default function Badge({ variant = 'green', children }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        fontFamily: '"Helvetica Neue", Arial, sans-serif',
        fontSize: 11,
        fontWeight: 700,
        padding: '4px 12px',
        letterSpacing: '0.04em',
        ...variantStyles[variant],
      }}
    >
      {children}
    </span>
  )
}
