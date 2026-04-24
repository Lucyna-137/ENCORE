/**
 * artworkCache — IndexedDB を使った楽曲アートワーク URL キャッシュ
 *
 * iTunes Search API へのリクエスト回数を減らすために使う。
 *   - HIT: 以前取得した artworkUrl をそのまま返す
 *   - NEGATIVE HIT: 見つからなかった曲も null として記録し、再検索を避ける
 *   - MISS: null を返し、呼び出し側で API を叩く
 *
 * キャッシュ期限:
 *   - アートワーク URL は Apple 側でほぼ不変（CDN 上のハッシュ付き）ので
 *     基本的に TTL は無し。30 日経過した古いエントリは getAll でパージする設計。
 *
 * オフライン対応:
 *   - IndexedDB は localStorage と違い容量制限が緩い（数十 MB〜）
 *   - ネットワーク無しでもキャッシュだけで表示できる
 */

const DB_NAME = 'grape-artwork'
const STORE = 'tracks'
const DB_VERSION = 1

interface CacheEntry {
  /** キー: `${normalizedTitle}|${normalizedArtist ?? ''}` */
  key: string
  /** アートワーク URL（未発見は null）*/
  url: string | null
  /** iTunes が返した実際のアーティスト名（confidence 判定用）*/
  matchedArtist?: string | null
  /** 取得時刻（epoch ms）*/
  fetchedAt: number
}

// ─── IndexedDB 接続を 1 回だけ確立して使い回す ────────────────────────
let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB not available'))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

function buildKey(title: string, artist?: string): string {
  return `${title}|${artist ?? ''}`.toLowerCase()
}

export interface CachedArtworkResult {
  url: string | null
  matchedArtist?: string | null
}

/** キャッシュから取得。未 HIT は undefined、HIT は { url, matchedArtist } を返す。 */
export async function getCachedArtwork(title: string, artist?: string): Promise<CachedArtworkResult | undefined> {
  try {
    const db = await openDB()
    return await new Promise<CachedArtworkResult | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(buildKey(title, artist))
      req.onsuccess = () => {
        const entry = req.result as CacheEntry | undefined
        if (!entry) return resolve(undefined)
        resolve({ url: entry.url, matchedArtist: entry.matchedArtist })
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return undefined  // IndexedDB 不可の環境では無視
  }
}

/** キャッシュへ保存（URL が null の場合は negative hit として保存）*/
export async function setCachedArtwork(
  title: string,
  artist: string | undefined,
  url: string | null,
  matchedArtist?: string | null,
): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const entry: CacheEntry = {
        key: buildKey(title, artist),
        url,
        matchedArtist,
        fetchedAt: Date.now(),
      }
      const req = tx.objectStore(STORE).put(entry)
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    // noop
  }
}

/** 開発・デバッグ用: 全キャッシュを取得 */
export async function getAllCachedArtwork(): Promise<CacheEntry[]> {
  try {
    const db = await openDB()
    return await new Promise<CacheEntry[]>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).getAll()
      req.onsuccess = () => resolve(req.result as CacheEntry[])
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

/** キャッシュ全消去 */
export async function clearArtworkCache(): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite')
      const req = tx.objectStore(STORE).clear()
      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    })
  } catch {
    // noop
  }
}
