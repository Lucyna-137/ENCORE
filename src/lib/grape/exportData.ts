/**
 * GRAPE データエクスポートユーティリティ
 *
 * ユーザーの全データ（ライブ / アーティスト / セットリスト）を
 * 1 つの JSON ファイルとしてダウンロード可能にする。
 *
 * 設計:
 *   - 人間可読な JSON スキーマ（将来のインポート・他サービス連携の土台）
 *   - 画像は base64 埋め込み（ユーザーアップロード画像のみ、デフォルトアセットはパスのみ）
 *   - dev / UI フラグ（Premium フラグ、last-tab 等）は含めない
 *   - iTunes アートワークキャッシュは再生成可能なため含めない
 *
 * ファイル名: `grape-backup-YYYY-MM-DD.json`
 */

import type { GrapeLive, GrapeArtist, Setlist } from './types'

export const EXPORT_SCHEMA_VERSION = 1
export const APP_VERSION = '1.0.0'

export interface GrapeExportPayload {
  schemaVersion: number
  exportedAt: string
  source: {
    app: 'GRAPE'
    appVersion: string
  }
  stats: {
    liveCount: number
    artistCount: number
    setlistCount: number
  }
  artists: GrapeArtist[]
  lives: GrapeLive[]
  setlists: Setlist[]
}

/** エクスポート用ペイロードを構築 */
export function buildExportPayload(args: {
  lives: GrapeLive[]
  artists: GrapeArtist[]
  setlists: Record<string, Setlist>
}): GrapeExportPayload {
  const setlistArray = Object.values(args.setlists)
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    source: {
      app: 'GRAPE',
      appVersion: APP_VERSION,
    },
    stats: {
      liveCount: args.lives.length,
      artistCount: args.artists.length,
      setlistCount: setlistArray.length,
    },
    artists: args.artists,
    lives: args.lives,
    setlists: setlistArray,
  }
}

/** ファイル名生成: `grape-backup-YYYY-MM-DD.json` */
export function buildExportFilename(date: Date = new Date()): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `grape-backup-${yyyy}-${mm}-${dd}.json`
}

/** JSON を Blob 化してブラウザでダウンロード（Capacitor では将来 Share Sheet 経由に） */
export function downloadExportBlob(payload: GrapeExportPayload, filename: string): void {
  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // メモリ解放（一部ブラウザで必要）
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** サマリー用: 件数を human-readable に（例: "20 ライブ / 6 アーティスト / 3 セトリ"） */
export function formatExportSummary(stats: GrapeExportPayload['stats']): string {
  return `${stats.liveCount} ライブ / ${stats.artistCount} アーティスト / ${stats.setlistCount} セトリ`
}
