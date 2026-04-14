'use client'
import { useEffect } from 'react'
import { initPalette } from '@/components/encore/ColorPalette'

export default function GrapeLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPalette()
  }, [])
  return (
    <>
      {/* Tailwind v4 が未知プロパティを除去するため JSX 内 style タグで注入（SSR時から適用されフラッシュなし） */}
      <style>{'.grape-page-title { text-box-trim: trim-end; text-box-edge: cap alphabetic; }'}</style>
      {children}
    </>
  )
}
