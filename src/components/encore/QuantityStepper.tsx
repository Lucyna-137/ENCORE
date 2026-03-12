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
        border: '1.5px solid #D8D4CD',
        borderRadius: 999,
        background: '#F2F0EB',
      }}
    >
      <button
        onClick={() => change(-1)}
        className="flex items-center justify-center transition-colors duration-150 hover:bg-[#E8E5DF] active:bg-[#D8D4CD] cursor-pointer"
        style={{
          width: 40,
          height: 40,
          background: 'transparent',
          border: 'none',
          fontSize: 20,
          color: '#1B3C2D',
          fontWeight: 300,
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
          fontWeight: 600,
          height: 40,
          borderLeft: '1px solid #D8D4CD',
          borderRight: '1px solid #D8D4CD',
          fontFamily: '"Helvetica Neue", Arial, sans-serif',
          color: '#1B3C2D',
        }}
      >
        {value}
      </div>
      <button
        onClick={() => change(1)}
        className="flex items-center justify-center transition-colors duration-150 hover:bg-[#E8E5DF] active:bg-[#D8D4CD] cursor-pointer"
        style={{
          width: 40,
          height: 40,
          background: 'transparent',
          border: 'none',
          fontSize: 20,
          color: '#1B3C2D',
          fontWeight: 300,
          lineHeight: 1,
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        +
      </button>
    </div>
  )
}
