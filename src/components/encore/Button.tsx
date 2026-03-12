'use client'

import React, { useRef } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'disabled' | 'sm-primary' | 'sm-ghost' | 'sm-secondary'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const variantStyles: Record<string, string> = {
  primary:      'w-full h-[52px] rounded-[8px] bg-[#1B3C2D] text-white text-[15px] font-medium border-0',
  secondary:    'w-full h-[52px] rounded-[8px] bg-transparent text-[#1B3C2D] text-[15px] font-medium',
  ghost:        'w-full h-[52px] rounded-[8px] bg-[#E8E5DF] text-[#1B3C2D] text-[15px] font-medium border-0',
  disabled:     'w-full h-[52px] rounded-[8px] bg-[#8BA898] text-white text-[15px] font-medium opacity-65 cursor-not-allowed border-0',
  'sm-primary':   'w-auto h-[36px] rounded-[8px] bg-[#1B3C2D] text-white text-[13px] font-medium px-5 border-0',
  'sm-ghost':     'w-auto h-[36px] rounded-[8px] bg-[#E8E5DF] text-[#1B3C2D] text-[13px] font-medium px-5 border-0',
  'sm-secondary': 'w-auto h-[36px] rounded-[8px] bg-transparent text-[#1B3C2D] text-[13px] font-medium px-5',
}

export default function Button({
  variant = 'primary',
  children,
  onClick,
  disabled,
  className = '',
}: ButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || variant === 'disabled') return

    const btn = btnRef.current
    if (!btn) return

    const rect = btn.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const ripple = document.createElement('span')
    ripple.className = 'encore-ripple'
    ripple.style.left = `${x}px`
    ripple.style.top = `${y}px`
    btn.appendChild(ripple)

    setTimeout(() => ripple.remove(), 600)

    onClick?.()
  }

  const isDisabled = disabled || variant === 'disabled'

  const isSecondary = variant === 'secondary' || variant === 'sm-secondary'
  const borderStyle = isSecondary
    ? { border: '1.5px solid #1B3C2D' }
    : { border: 'none' }

  return (
    <button
      ref={btnRef}
      onClick={handleClick}
      disabled={isDisabled}
      className={[
        'relative overflow-hidden flex items-center justify-center gap-2 cursor-pointer',
        'transition-transform duration-100 select-none',
        'active:scale-[0.97]',
        variantStyles[variant] ?? variantStyles.primary,
        className,
      ].join(' ')}
      style={{
        fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
        letterSpacing: '0.02em',
        WebkitTapHighlightColor: 'transparent',
        ...borderStyle,
      }}
    >
      {children}
    </button>
  )
}
