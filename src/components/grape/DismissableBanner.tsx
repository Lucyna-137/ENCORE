'use client'

import React, { useState } from 'react'

/**
 * ふわっと消えるバナーラッパー。
 * children は render prop (dismiss 関数を受け取る) として使う。
 * X ボタンなどから dismiss() を呼ぶと opacity + maxHeight アニメーション後に
 * onDismiss() が呼ばれる。
 */
export default function DismissableBanner({
  onDismiss,
  children,
}: {
  onDismiss: () => void
  children: (dismiss: () => void) => React.ReactNode
}) {
  const [fading, setFading] = useState(false)

  const dismiss = () => {
    setFading(true)
    setTimeout(onDismiss, 320)
  }

  return (
    <div
      style={{
        opacity: fading ? 0 : 1,
        maxHeight: fading ? 0 : 120,
        overflow: 'hidden',
        pointerEvents: fading ? 'none' : 'auto',
        transition: 'opacity 0.28s ease, max-height 0.32s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {children(dismiss)}
    </div>
  )
}
