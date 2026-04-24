/**
 * Grape API 設定
 *
 * URL 取り込み機能（Premium）の API エンドポイント設定。
 *
 * - Web (Vercel ホスト版): 従来は同一オリジンの /api/event-from-url を叩いていたが、
 *   iOS Capacitor 版（静的書き出し）と共存するため、API 本体は別プロジェクト (grape-api) に
 *   分離する予定。
 *
 * - iOS 版: NEXT_PUBLIC_GRAPE_API_URL が空の間は URL 取り込み UI を全面的に hide する。
 *   後日、grape-api を Vercel にデプロイしたら、そのベース URL を設定すれば機能が有効化される。
 *
 * 使い方:
 *   - NEXT_PUBLIC_GRAPE_API_URL=https://grape-api.vercel.app  ← API 分離後に設定
 *   - 未設定 (空) の場合は URL 取り込み機能は UI から見えない
 */
export const GRAPE_API_URL = process.env.NEXT_PUBLIC_GRAPE_API_URL ?? ''

/**
 * URL 取り込み機能が有効か (Premium 限定機能のさらに内側のフラグ)
 */
export const URL_IMPORT_ENABLED = GRAPE_API_URL !== ''
