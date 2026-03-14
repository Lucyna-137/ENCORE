'use client'

import React, { useRef } from 'react'
import * as ty from './typographyStyles'

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'disabled' | 'sm-primary' | 'sm-ghost' | 'sm-secondary' | 'xs-primary' | 'xs-ghost' | 'xs-secondary'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const variantStyles: Record<string, string> = {
  primary:        'w-full h-[70px] rounded-[4px] bg-encore-green text-white border-0',
  secondary:      'w-full h-[70px] rounded-[4px] bg-transparent text-encore-green',
  ghost:          'w-full h-[70px] rounded-[4px] bg-encore-bg-section text-encore-green border-0',
  disabled:       'w-full h-[70px] rounded-[4px] bg-encore-green-muted text-white opacity-65 cursor-not-allowed border-0',
  'sm-primary':   'w-auto h-[46px] rounded-full bg-encore-green text-white px-5 border-0',
  'sm-ghost':     'w-auto h-[46px] rounded-full bg-encore-bg-section text-encore-green px-5 border-0',
  'sm-secondary': 'w-auto h-[46px] rounded-full bg-transparent text-encore-green px-5',
  'xs-primary':   'w-auto h-[28px] rounded-full bg-encore-green text-white px-3 border-0',
  'xs-ghost':     'w-auto h-[28px] rounded-full bg-encore-bg-section text-encore-green px-3 border-0',
  'xs-secondary': 'w-auto h-[28px] rounded-full bg-transparent text-encore-green px-3',
}

const isWhiteText = (variant: string) =>
  variant === 'primary' || variant === 'disabled' || variant === 'sm-primary' || variant === 'xs-primary'

const textStyle = (variant: string) => {
  const color = isWhiteText(variant) ? 'var(--color-encore-white)' : 'var(--color-encore-green)'
  if (variant.startsWith('xs')) return { ...ty.bodySM, fontSize: 11, color }
  if (variant.startsWith('sm')) return { ...ty.bodySM, color }
  return { ...ty.sectionSM, fontWeight: 400, color }
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

  const isSecondary = variant === 'secondary' || variant === 'sm-secondary' || variant === 'xs-secondary'
  const borderStyle = isSecondary
    ? { border: '1.5px solid var(--color-encore-green)' }
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
        ...textStyle(variant),
        letterSpacing: '0.02em',
        WebkitTapHighlightColor: 'transparent',
        ...borderStyle,
      }}
    >
      {children}
    </button>
  )
}
