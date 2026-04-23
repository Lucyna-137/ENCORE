'use client'

import { useSyncExternalStore, useCallback } from 'react'
import type { Setlist, SetlistItem } from './types'

/**
 * セットリスト永続化フック（グローバル singleton store）
 *
 * localStorage キー: `grape_setlists_v1`
 * GrapeLive 本体（`grape_lives_v1`）とは別ストレージ。
 *
 * 保存形式: `Record<liveId, Setlist>`
 *   - O(1) での liveId 検索
 *   - 1 ライブに 1 セットリストの制約
 *
 * 設計:
 *   - useSyncExternalStore ベースの singleton store（premium.ts と同じパターン）
 *     → 複数の useSetlistStore() 呼び出しが同じ state を共有する
 *     → Editor で保存すると SetlistSection のプレビューも即座に更新される
 *   - 他タブからの storage イベントも購読して自動同期
 *   - アートワーク（artworkUrl）自体は URL のみ保存する。
 *     バイナリキャッシュは Phase 4 で IndexedDB（別ストア）を使う予定。
 *   - マイグレーションは v1 → v2 の際に加える（現時点では未発生）。
 */

const SETLISTS_KEY = 'grape_setlists_v1'

/** localStorage 上の保存形式: liveId → Setlist */
type SetlistsStore = Record<string, Setlist>

// ─── グローバル singleton state ────────────────────────────────────────
let currentState: SetlistsStore = {}
let initialized = false
const listeners = new Set<() => void>()

function loadFromLocalStorage(): SetlistsStore {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(SETLISTS_KEY)
    return raw ? (JSON.parse(raw) as SetlistsStore) : {}
  } catch {
    return {}
  }
}

function ensureInitialized() {
  if (initialized) return
  currentState = loadFromLocalStorage()
  initialized = true

  // 他タブからの storage イベントも購読して state 同期
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key !== SETLISTS_KEY) return
      currentState = loadFromLocalStorage()
      emit()
    })
  }
}

function emit() {
  listeners.forEach(l => l())
}

function subscribe(cb: () => void) {
  ensureInitialized()
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}

function getSnapshot(): SetlistsStore {
  ensureInitialized()
  return currentState
}

function getServerSnapshot(): SetlistsStore {
  return {}
}

// ─── 書き込み API（store を更新 → localStorage 書き込み → 全 subscriber 通知）
function writeState(next: SetlistsStore) {
  currentState = next
  try {
    localStorage.setItem(SETLISTS_KEY, JSON.stringify(next))
  } catch {
    // 容量超過等は無視
  }
  emit()
}

/** セットリスト全体を取得（デバッグ/エクスポート用） */
export function getAllSetlists(): SetlistsStore {
  ensureInitialized()
  return currentState
}

/** 指定 liveId のセットリストを保存 */
export function saveSetlist(
  liveId: string,
  items: SetlistItem[],
  options?: { approximate?: boolean },
) {
  const next: Setlist = {
    liveId,
    items,
    approximate: options?.approximate ?? false,
    updatedAt: new Date().toISOString(),
  }
  writeState({ ...currentState, [liveId]: next })
}

/** 指定 liveId のセットリストを削除 */
export function deleteSetlist(liveId: string) {
  if (!(liveId in currentState)) return
  const next = { ...currentState }
  delete next[liveId]
  writeState(next)
}

/** Hook: 現在のセットリスト全件 + 操作関数を返す */
export function useSetlistStore() {
  const setlists = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const ready = initialized  // 呼び出し時点で初期化済み（subscribe が先に走る）

  const getSetlist = useCallback(
    (liveId: string): Setlist | undefined => setlists[liveId],
    [setlists],
  )

  const save = useCallback(
    (liveId: string, items: SetlistItem[], options?: { approximate?: boolean }) => {
      saveSetlist(liveId, items, options)
    },
    [],
  )

  const remove = useCallback((liveId: string) => {
    deleteSetlist(liveId)
  }, [])

  return {
    setlists,
    ready,
    getSetlist,
    saveSetlist: save,
    deleteSetlist: remove,
  }
}
