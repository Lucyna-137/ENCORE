'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

/**
 * Premium 購入状態の管理
 *
 * 将来的にはストア課金（RevenueCat等）と連携する前提の抽象化レイヤー。
 * 現状は localStorage ベースの dev フラグ。
 *
 * Dev Console での切り替え方:
 *   localStorage.setItem('grape-is-premium', 'true')   // Premium化
 *   localStorage.removeItem('grape-is-premium')        // Free化
 *   location.reload()
 */
const STORAGE_KEY = 'grape-is-premium'
const listeners = new Set<() => void>()

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

function subscribe(callback: () => void) {
  listeners.add(callback)
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback()
  }
  window.addEventListener('storage', handler)
  return () => {
    listeners.delete(callback)
    window.removeEventListener('storage', handler)
  }
}

function notifyAll() {
  listeners.forEach(fn => fn())
}

/** Premium 状態を購読するフック（SSR安全） */
export function useIsPremium(): boolean {
  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => false // SSR: Freeとして描画
  )
}

/** Premium 状態を変更（dev/QA用） */
export function setIsPremium(value: boolean) {
  if (typeof window === 'undefined') return
  if (value) {
    localStorage.setItem(STORAGE_KEY, 'true')
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
  notifyAll()
}
