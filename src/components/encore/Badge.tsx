import React from 'react'

interface BadgeProps {
  variant?: 'green' | 'amber' | 'muted' | 'outline' | 'light-green'
  children: React.ReactNode
}

const variantStyles: Record<string, React.CSSProperties> = {
  green: { background: 'var(--color-encore-green)', color: 'var(--color-encore-white)' },
  amber: { background: 'var(--color-encore-amber)', color: 'var(--color-encore-white)' },
  muted: { background: 'var(--color-encore-bg-section)', color: 'var(--color-encore-text-sub)' },
  outline: { background: 'transparent', border: '1.5px solid var(--color-encore-border-light)', color: 'var(--color-encore-text-sub)' },
  'light-green': { background: 'rgba(27,60,45,0.08)', color: 'var(--color-encore-green)' },
}

export default function Badge({ variant = 'green', children }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 999,
        fontFamily: 'var(--font-google-sans), sans-serif',
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
