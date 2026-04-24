/**
 * useArtworkLookup — 曲タイトルから iTunes アートワークを自動検索する React hook
 *
 * 使い方:
 *   const { artworkUrl, loading } = useArtworkLookup(title, artist, {
 *     initialUrl: item.artworkUrl,  // 既にある場合はそれを初期値に
 *     debounceMs: 600,              // タイプ中の API 連発を抑制
 *   })
 *
 * 挙動:
 *   - title が空なら何もしない
 *   - initialUrl があれば最初はそれを返す
 *   - title / artist が変わるたび debounce 後に fetchArtwork を呼ぶ
 *   - IndexedDB キャッシュは fetchArtwork 側で処理される
 *   - コンポーネントがアンマウントされたら pending fetch を無視（stale 防止）
 */

import { useEffect, useRef, useState } from 'react'
import { fetchArtwork, isArtistMatched } from './itunesArtwork'

interface UseArtworkOptions {
  /** 既にある場合の初期値（store に保存済みの artworkUrl 等）*/
  initialUrl?: string
  /** タイプ中の debounce（ミリ秒）。デフォルト 600ms */
  debounceMs?: number
  /** 有効フラグ（編集モード以外では false にする等）*/
  enabled?: boolean
}

interface UseArtworkResult {
  artworkUrl: string | null
  loading: boolean
  /** iTunes が返した実アーティスト名 vs 期待のアーティストが不一致（低信頼） */
  lowConfidence: boolean
  /** iTunes が返した実アーティスト名（ツールチップ等で説明表示に使える） */
  matchedArtist: string | null
}

export function useArtworkLookup(
  title: string,
  artist: string | undefined,
  options: UseArtworkOptions = {},
): UseArtworkResult {
  const { initialUrl, debounceMs = 600, enabled = true } = options

  const [artworkUrl, setArtworkUrl] = useState<string | null>(initialUrl ?? null)
  const [matchedArtist, setMatchedArtist] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 最新の lookup request ID を追跡し、古いレスポンスは捨てる
  const requestIdRef = useRef(0)

  useEffect(() => {
    if (!enabled) return
    const t = title.trim()
    if (!t) {
      setArtworkUrl(null)
      setMatchedArtist(null)
      setLoading(false)
      return
    }

    const id = ++requestIdRef.current
    setLoading(true)
    const handle = setTimeout(async () => {
      const result = await fetchArtwork(t, artist)
      // 最新リクエストのみ state 反映
      if (requestIdRef.current === id) {
        setArtworkUrl(result.url)
        setMatchedArtist(result.matchedArtist)
        setLoading(false)
      }
    }, debounceMs)

    return () => clearTimeout(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, artist, enabled, debounceMs])

  // artwork が見つかった場合だけ confidence 判定（URL 無しは判定スキップ）
  const lowConfidence = !!artworkUrl && !isArtistMatched(artist, matchedArtist)

  return { artworkUrl, loading, lowConfidence, matchedArtist }
}
