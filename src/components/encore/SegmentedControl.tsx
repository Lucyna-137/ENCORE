'use client'

import React, { useState } from 'react'

interface SegmentedControlProps {
  options: string[]
  defaultSelected?: number
  onChange?: (index: number) => void
}

export default function SegmentedControl({
  options,
  defaultSelected = 0,
  onChange,
}: SegmentedControlProps) {
  const [selected, setSelected] = useState(defaultSelected)

  const handleClick = (i: number) => {
    setSelected(i)
    onChange?.(i)
  }

  return (
    <div className="flex gap-2" style={{ padding: '16px 20px' }}>
      {options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleClick(i)}
          className="flex-1 flex items-center justify-center gap-1.5 cursor-pointer transition-all duration-200"
          style={{
            height: 48,
            border: selected === i ? '2px solid #1B3C2D' : '1.5px solid #D8D4CD',
            borderRadius: 8,
            background: selected === i ? 'rgba(27,60,45,0.04)' : 'transparent',
            fontSize: 14,
            fontFamily: '"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif',
            color: selected === i ? '#1B3C2D' : '#6B6B6B',
            fontWeight: selected === i ? 600 : 400,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
