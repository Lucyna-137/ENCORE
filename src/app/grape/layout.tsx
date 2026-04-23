'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initPalette } from '@/components/encore/ColorPalette'
import { saveLastTab, type GrapeTab } from '@/lib/grape/lastTab'

export default function GrapeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  useEffect(() => {
    initPalette()
  }, [])

  // 現在のタブを localStorage に保存（/grape/<tab>/... にマッチ）
  useEffect(() => {
    if (!pathname) return
    const m = pathname.match(/^\/grape\/(calendar|tickets|report|settings)(?:\/|$)/)
    if (m) saveLastTab(m[1] as GrapeTab)
  }, [pathname])
  return (
    <>
      {/* Tailwind v4 が未知プロパティを除去するため JSX 内 style タグで注入（SSR時から適用されフラッシュなし） */}
      <style>{'.grape-page-title { text-box-trim: trim-end; text-box-edge: cap alphabetic; }'}</style>
      {children}
    </>
  )
}
