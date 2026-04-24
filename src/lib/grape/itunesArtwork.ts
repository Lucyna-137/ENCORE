/**
 * itunesArtwork — iTunes Search API で楽曲アートワークを検索
 *
 * エンドポイント:
 *   https://itunes.apple.com/search
 *     ?term={encoded}&media=music&entity=song&limit=1&country=JP
 *
 * 特徴:
 *   - 認証不要・レート制限もゆるい（目安 20 req/min）
 *   - CORS 対応済み（クライアント直接呼び出し可）
 *   - アートワーク URL は artworkUrl100 を返すが、
 *     URL 内の "100x100bb" を "600x600bb" に置換すれば高解像度版を取得できる
 *
 * 使い方:
 *   const url = await fetchArtwork('キミノネイロ', 'somei')
 *   // → 'https://.../600x600bb.jpg' or null
 *
 * キャッシュ連携:
 *   - 呼び出し前に getCachedArtwork で HIT/MISS を確認
 *   - API 応答後に setCachedArtwork で記録
 */

import { getCachedArtwork, setCachedArtwork } from './artworkCache'

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search'

export interface ArtworkResult {
  /** アートワーク URL（未発見は null）*/
  url: string | null
  /** iTunes が返した実際のアーティスト名（confidence 判定用）*/
  matchedArtist: string | null
}

/**
 * iTunes レスポンスの各結果アイテム（必要な項目のみ型定義）
 * 全フィールドは Apple ドキュメント参照: https://performance-partners.apple.com/search-api
 */
interface ITunesSong {
  trackId: number
  trackName: string
  artistName: string
  collectionName?: string
  artworkUrl100?: string
  artworkUrl60?: string
}

interface ITunesSearchResponse {
  resultCount: number
  results: ITunesSong[]
}

/**
 * iTunes Search API を叩いて、最も一致する楽曲のアートワーク URL を取得。
 * キャッシュ層を貫通するのでいつ呼んでも安全。
 *
 * @param title  曲名
 * @param artist アーティスト名（省略可、付けると精度向上）
 * @returns { url, matchedArtist }（url=null で見つからず、matchedArtist=iTunes 実値）
 */
export async function fetchArtwork(title: string, artist?: string): Promise<ArtworkResult> {
  const trimmed = title.trim()
  if (!trimmed) return { url: null, matchedArtist: null }

  // 1. キャッシュヒットなら即返し
  const cached = await getCachedArtwork(trimmed, artist)
  if (cached !== undefined) return { url: cached.url, matchedArtist: cached.matchedArtist ?? null }

  // 2. API 検索
  const term = artist ? `${trimmed} ${artist}` : trimmed
  const params = new URLSearchParams({
    term,
    media: 'music',
    entity: 'song',
    limit: '1',
    country: 'JP',
  })
  try {
    const res = await fetch(`${ITUNES_SEARCH_URL}?${params}`, {
      cache: 'default',
    })
    if (!res.ok) {
      await setCachedArtwork(trimmed, artist, null, null)
      return { url: null, matchedArtist: null }
    }
    const json = (await res.json()) as ITunesSearchResponse
    const first = json.results?.[0]
    if (!first || !first.artworkUrl100) {
      await setCachedArtwork(trimmed, artist, null, null)
      return { url: null, matchedArtist: null }
    }
    // 高解像度版へ置換: 100x100bb → 600x600bb
    const hiRes = first.artworkUrl100.replace(/\/100x100bb\./, '/600x600bb.')
    const matchedArtist = first.artistName ?? null
    await setCachedArtwork(trimmed, artist, hiRes, matchedArtist)
    return { url: hiRes, matchedArtist }
  } catch {
    // ネットワークエラーは negative cache しない（次回再試行のため）
    return { url: null, matchedArtist: null }
  }
}

/**
 * 期待するアーティスト名と iTunes が返した名前が一致しているか確度判定。
 *
 * 判定ロジック:
 *   - 両方とも normalize（lowercase + 空白除去）
 *   - どちらかに完全一致 or 包含関係があれば high confidence
 *   - 無ければ low confidence
 *
 * 注意: 日本語 vs ローマ字（メイ vs MEI）は textual には別物なので、
 * 現状はヒューリスティック的に low と判定される。ユーザーは UI の
 * confidence マーカーで「一致してないかも」と気づける。
 */
export function isArtistMatched(expected: string | undefined, matched: string | null | undefined): boolean {
  if (!expected || !matched) return true  // 情報不足時は問題扱いしない
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '')
  const e = norm(expected)
  const m = norm(matched)
  if (!e || !m) return true
  return e === m || e.includes(m) || m.includes(e)
}
