'use client'

import React, { useState, useRef } from 'react'

interface QuantityStepperProps {
  defaultValue?: number
  min?: number
  max?: number
  onChange?: (value: number) => void
}

export default function QuantityStepper({
  defaultValue = 1,
  min = 0,
  max = 99,
  onChange,
}: QuantityStepperProps) {
  const [value, setValue] = useState(defaultValue)
  const [animKey, setAnimKey] = useState(0)
  const valRef = useRef<HTMLDivElement>(null)

  const change = (delta: number) => {
    const next = Math.min(max, Math.max(min, value + delta))
    if (next !== value) {
      setValue(next)
      setAnimKey((k) => k + 1)
      onChange?.(next)
    }
  }

  return (
    <div
      className="inline-flex items-center overflow-hidden"
      style={{
        border: '1.5px solid var(--color-encore-border-light)',
        borderRadius: 999,
        background: 'var(--color-encore-bg)',
      }}
    >
      <button
        onClick={() => change(-1)}
        className="flex items-center justify-center transition-colors duration-150 hover:bg-encore-bg-section active:bg-encore-border cursor-pointer"
        style={{
          width: 40,
          height: 40,
          background: 'transparent',
          border: 'none',
          fontSize: 20,
          color: 'var(--color-encore-green)',
          fontWeight: 400,
          lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        −
      </button>
      <div
        key={animKey}
        ref={valRef}
        className="encore-stepper-val flex items-center justify-center"
        style={{
          minWidth: 40,
          textAlign: 'center',
          fontSize: 15,
          fontWeight: 700,
          height: 40,
          borderLeft: '1px solid var(--color-encore-border-light)',
          borderRight: '1px solid var(--color-encore-border-light)',
          fontFamily: 'var(--font-google-sans), sans-serif',
          color: 'var(--color-encore-green)',
        }}
      >
        {value}
      </div>
      <button
        onClick={() => change(1)}
        className="flex items-center justify-center transition-colors duration-150 hover:bg-encore-bg-section active:bg-encore-border cursor-pointer"
        style={{
          width: 40,
          height: 40,
          background: 'transparent',
          border: 'none',
          fontSize: 20,
          color: 'var(--color-encore-green)',
          fontWeight: 400,
          lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        +
      </button>
    </div>
  )
}
