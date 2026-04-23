/**
 * 最後に訪問したタブを記憶・復元するユーティリティ
 * /grape/<tab> にアクセスするとそのタブが保存され、
 * /grape へアクセスすると保存されたタブへリダイレクトされる
 */

const KEY = 'grape-last-tab'

export type GrapeTab = 'calendar' | 'tickets' | 'report' | 'settings'

const VALID_TABS: GrapeTab[] = ['calendar', 'tickets', 'report', 'settings']

export function saveLastTab(tab: GrapeTab) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(KEY, tab)
  } catch {}
}

export function loadLastTab(): GrapeTab {
  if (typeof window === 'undefined') return 'calendar'
  try {
    const v = localStorage.getItem(KEY) as GrapeTab | null
    if (v && VALID_TABS.includes(v)) return v
  } catch {}
  return 'calendar'
}
