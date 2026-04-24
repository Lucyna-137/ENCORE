/**
 * useShowHolidays — 国民の休日表示の ON/OFF トグル
 *
 * - localStorage キー: `grape-show-holidays`
 * - デフォルト ON
 * - useSyncExternalStore で全画面に即座に反映
 *   （premium / palette と同じパターン）
 */

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'grape-show-holidays'
const EVENT_NAME = 'grape-show-holidays-update'

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return true
  const raw = localStorage.getItem(STORAGE_KEY)
  // 未設定 = true（デフォルト ON）
  return raw === null ? true : raw === 'true'
}

function getServerSnapshot(): boolean {
  return true
}

function subscribe(callback: () => void): () => void {
  const handler = () => callback()
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler)
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}

/** 祝日表示フラグを参照（React hook） */
export function useShowHolidays(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

/** フラグを書き換え + 全画面へ通知 */
export function setShowHolidays(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value))
    window.dispatchEvent(new Event(EVENT_NAME))
  } catch {
    // noop
  }
}
