'use client'

import { useSyncExternalStore, useCallback } from 'react'

/**
 * GRAPE 共通トースト通知 Hook
 *
 * 使い方:
 *   const { show, dismiss } = useGrapeToast()
 *   show('保存しました')
 *   show('削除しました', { action: { label: '元に戻す', onClick: handleUndo } })
 *
 * ToastHost は PhoneFrame に組み込み済みなので、任意のページ / コンポーネントから
 * show() を呼ぶだけでトーストが表示される。
 *
 * 設計:
 *   - `useSyncExternalStore` ベース（SSR 安全、Provider 不要）
 *   - グローバルに 1 つのトーストのみ表示（複数同時は出さない）
 *   - 新規 show() は既存トーストを即座に置き換える
 *   - duration（デフォルト 2400ms）後に自動で消える
 *   - `pointerEvents: 'none'` ではなく action button が押せる前提
 */

export type ToastAction = {
  label: string
  /** 押下時に呼ばれる。呼び出し後トーストは自動 dismiss される */
  onClick: () => void
}

export type Toast = {
  /** トースト識別子（アニメーション key に利用） */
  id: number
  message: string
  action?: ToastAction
  duration: number
  createdAt: number
}

type ToastStore = {
  current: Toast | null
  listeners: Set<() => void>
}

const store: ToastStore = {
  current: null,
  listeners: new Set(),
}
let nextId = 1
let dismissTimer: ReturnType<typeof setTimeout> | null = null

function emit() {
  store.listeners.forEach(l => l())
}

function subscribe(cb: () => void) {
  store.listeners.add(cb)
  return () => {
    store.listeners.delete(cb)
  }
}

function getSnapshot(): Toast | null {
  return store.current
}

function getServerSnapshot(): Toast | null {
  return null
}

/** グローバル関数: コンポーネント外でも呼べる */
export function showToast(
  message: string,
  options?: { action?: ToastAction; duration?: number },
) {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
  const duration = options?.duration ?? 2400
  store.current = {
    id: nextId++,
    message,
    action: options?.action,
    duration,
    createdAt: Date.now(),
  }
  emit()
  dismissTimer = setTimeout(() => {
    store.current = null
    dismissTimer = null
    emit()
  }, duration)
}

/** 手動 dismiss */
export function dismissToast() {
  if (dismissTimer) {
    clearTimeout(dismissTimer)
    dismissTimer = null
  }
  if (store.current) {
    store.current = null
    emit()
  }
}

/** React コンポーネント向け: 現在のトーストを購読 + show/dismiss 関数を提供 */
export function useGrapeToast() {
  const toast = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const show = useCallback(
    (message: string, options?: { action?: ToastAction; duration?: number }) => {
      showToast(message, options)
    },
    [],
  )
  const dismiss = useCallback(() => {
    dismissToast()
  }, [])
  return { toast, show, dismiss }
}
