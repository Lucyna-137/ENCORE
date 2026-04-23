'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Setlist, SetlistItem } from './types'

/**
 * セットリスト永続化フック
 *
 * localStorage キー: `grape_setlists_v1`
 * GrapeLive 本体（`grape_lives_v1`）とは別ストレージ。
 *
 * 保存形式: `Record<liveId, Setlist>`
 *   - O(1) での liveId 検索
 *   - 1 ライブに 1 セットリストの制約
 *
 * 設計判断:
 *   - アートワーク（artworkUrl）自体は URL のみ保存する。
 *     バイナリキャッシュは Phase 4 で IndexedDB（別ストア）を使う予定。
 *   - マイグレーションは v1 → v2 の際に加える（現時点では未発生）。
 */
const SETLISTS_KEY = 'grape_setlists_v1'

/** localStorage 上の保存形式: liveId → Setlist */
type SetlistsStore = Record<string, Setlist>

export function useSetlistStore() {
  const [setlists, setSetlistsState] = useState<SetlistsStore>({})
  const [ready, setReady] = useState(false)

  // ─── 初回マウント: localStorage から読み込み ──────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETLISTS_KEY)
      const loaded: SetlistsStore = raw ? JSON.parse(raw) : {}
      setSetlistsState(loaded)
    } catch {
      // パース失敗時は空で継続（破損データは上書き許容）
      setSetlistsState({})
    }
    setReady(true)
  }, [])

  // ─── 内部 persist（state + localStorage を同時更新）─────────────────
  const persist = useCallback((next: SetlistsStore) => {
    setSetlistsState(next)
    try {
      localStorage.setItem(SETLISTS_KEY, JSON.stringify(next))
    } catch {
      // localStorage 書き込み失敗（容量超過等）は無視して state のみ更新
    }
  }, [])

  // ─── 取得 ─────────────────────────────────────────────────────────────
  /** 1 ライブのセットリストを取得（存在しない場合は undefined） */
  const getSetlist = useCallback((liveId: string): Setlist | undefined => {
    return setlists[liveId]
  }, [setlists])

  // ─── 保存（新規・上書き両対応）────────────────────────────────────
  const saveSetlist = useCallback((
    liveId: string,
    items: SetlistItem[],
    options?: { approximate?: boolean }
  ) => {
    const next: Setlist = {
      liveId,
      items,
      approximate: options?.approximate ?? false,
      updatedAt: new Date().toISOString(),
    }
    persist({ ...setlists, [liveId]: next })
  }, [setlists, persist])

  // ─── 削除 ─────────────────────────────────────────────────────────────
  const deleteSetlist = useCallback((liveId: string) => {
    if (!(liveId in setlists)) return
    const next = { ...setlists }
    delete next[liveId]
    persist(next)
  }, [setlists, persist])

  return {
    setlists,
    ready,
    getSetlist,
    saveSetlist,
    deleteSetlist,
  }
}
