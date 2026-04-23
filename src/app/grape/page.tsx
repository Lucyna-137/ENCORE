'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadLastTab } from '@/lib/grape/lastTab'

/**
 * /grape にアクセスされた際、最後に選択していたタブへリダイレクトする。
 * 初回訪問時は /grape/calendar にフォールバック。
 */
export default function GrapeIndexPage() {
  const router = useRouter()

  useEffect(() => {
    const tab = loadLastTab()
    router.replace(`/grape/${tab}`)
  }, [router])

  return null
}
