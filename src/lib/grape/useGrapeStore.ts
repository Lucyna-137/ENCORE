'use client'

import { useState, useEffect, useCallback } from 'react'
import type { GrapeLive, GrapeArtist, TicketStatus } from './types'
import { LIVES as SEED_LIVES, ARTISTS as SEED_ARTISTS } from './dummyData'

const LIVES_KEY    = 'grape_lives_v1'
const ARTISTS_KEY  = 'grape_artists_v1'
/** Dev: これが 'true' のとき、空の localStorage でもシードデータを投入しない。
 *       「インストールしたばかりの空の状態」シミュレーション用。 */
const NO_SEED_KEY  = 'grape-no-seed'

/** 旧チケットステータス → 新ステータスへのマイグレーションマップ */
const LEGACY_TICKET_STATUS_MAP: Record<string, TicketStatus> = {
  'applied':      'waiting',
  'open':         'before-sale',
  'before-entry': 'before-sale',
  'won':          'issued',
  'lost':         'done',
  'pending':      'waiting',
}

function migrateLive(l: GrapeLive): GrapeLive {
  if (l.ticketStatus && LEGACY_TICKET_STATUS_MAP[l.ticketStatus]) {
    return { ...l, ticketStatus: LEGACY_TICKET_STATUS_MAP[l.ticketStatus] }
  }
  return l
}

export function useGrapeStore() {
  const [lives,   setLivesState]   = useState<GrapeLive[]>([])
  const [artists, setArtistsState] = useState<GrapeArtist[]>([])
  const [ready,   setReady]        = useState(false)

  // ─── 初回マウント: localStorage から読み込み、なければシードデータを保存 ──
  useEffect(() => {
    const rawLives   = localStorage.getItem(LIVES_KEY)
    const rawArtists = localStorage.getItem(ARTISTS_KEY)
    // 「空の状態で起動」フラグが立っているときはシードを投入しない（Dev 用）
    const noSeed = localStorage.getItem(NO_SEED_KEY) === 'true'

    const emptyLives: GrapeLive[] = []
    const emptyArtists: GrapeArtist[] = []
    const seedLives = noSeed ? emptyLives : SEED_LIVES
    const seedArtists = noSeed ? emptyArtists : SEED_ARTISTS

    const loadedLives   = (rawLives ? (JSON.parse(rawLives) as GrapeLive[]) : seedLives).map(migrateLive)
    const rawArtistsParsed: GrapeArtist[] = rawArtists ? JSON.parse(rawArtists) : seedArtists

    // Migration: birthday フィールドが未設定の場合、シードから補完する
    const loadedArtists = rawArtistsParsed.map(a => {
      if (a.birthday) return a
      const seed = SEED_ARTISTS.find(s => s.id === a.id)
      return seed?.birthday ? { ...a, birthday: seed.birthday } : a
    })

    setLivesState(loadedLives)
    setArtistsState(loadedArtists)

    // マイグレーション後のデータを保存
    localStorage.setItem(LIVES_KEY, JSON.stringify(loadedLives))
    localStorage.setItem(ARTISTS_KEY, JSON.stringify(loadedArtists))

    setReady(true)
  }, [])

  // ─── 内部セッター（state + localStorage を同時更新） ──────────────────────
  const setLives = useCallback((updater: GrapeLive[] | ((prev: GrapeLive[]) => GrapeLive[])) => {
    setLivesState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(LIVES_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const setArtists = useCallback((updater: GrapeArtist[] | ((prev: GrapeArtist[]) => GrapeArtist[])) => {
    setArtistsState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  // ─── Lives CRUD ───────────────────────────────────────────────────────────
  const addLive = useCallback((live: GrapeLive) => {
    setLives(prev => [...prev, live])
  }, [setLives])

  const updateLive = useCallback((updated: GrapeLive) => {
    setLives(prev => prev.map(l => l.id === updated.id ? updated : l))
  }, [setLives])

  const deleteLive = useCallback((id: string) => {
    setLives(prev => prev.filter(l => l.id !== id))
  }, [setLives])

  const updateLives = useCallback((updater: (prev: GrapeLive[]) => GrapeLive[]) => {
    setLives(updater)
  }, [setLives])

  // ─── Artists CRUD ─────────────────────────────────────────────────────────
  const addArtist = useCallback((artist: GrapeArtist) => {
    // 新規登録アーティストは先頭に追加
    setArtists(prev => [artist, ...prev])
  }, [setArtists])

  const updateArtist = useCallback((updated: GrapeArtist) => {
    setArtists(prev => prev.map(a => a.id === updated.id ? updated : a))
  }, [setArtists])

  const deleteArtist = useCallback((id: string) => {
    setArtists(prev => prev.filter(a => a.id !== id))
  }, [setArtists])

  return {
    lives, artists, ready,
    addLive, updateLive, deleteLive, updateLives,
    addArtist, updateArtist, deleteArtist,
  }
}
