import type { AttendanceStatus, TicketStatus, LiveCardStatus, GrapeLive, GrapeArtist } from './types'

// ─── 日付 ──────────────────────────────────────────────────────────────────
/** リアルタイムの今日の日付 (YYYY-MM-DD) */
const _now = new Date()
export const TODAY = _now.toLocaleDateString('sv-SE') // 'YYYY-MM-DD' format

/** 現在年月 */
export const CURRENT_YEAR  = _now.getFullYear()
export const CURRENT_MONTH = _now.getMonth() + 1

// ─── カレンダー表示 ─────────────────────────────────────────────────────────
/**
 * 時間グリッドの 1 時間あたりの高さ（px）
 * WeekView は列が多く狭いため小さめ、DayView は 1 列で余裕があるため大きめ
 */
export const HOUR_HEIGHT_WEEK = 48
export const HOUR_HEIGHT_DAY  = 56

/**
 * 時刻ラベル列の幅（px）
 * WeekView: 46 / DayView: 44（列幅の差による内側余白調整）
 */
export const TIME_COL_WIDTH_WEEK = 46
export const TIME_COL_WIDTH_DAY  = 44

/**
 * 曜日ラベル配列
 * DOW_SUN_FIRST: 月ビュー（日曜始まり）
 * DOW_MON_FIRST: 週ビュー（月曜始まり）
 */
export const DOW_SUN_FIRST = ['日', '月', '火', '水', '木', '金', '土'] as const
export const DOW_MON_FIRST = ['月', '火', '水', '木', '金', '土', '日'] as const

// ─── ラベル辞書 ─────────────────────────────────────────────────────────────

/** 参加ステータス → 日本語ラベル */
export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  candidate: '気になる',
  planned:   '行く',
  attended:  '参戦済み',
  skipped:   'スキップ',
}

/** 参加ステータス → LiveCard 表示ステータス */
export const ATTENDANCE_TO_LIVE_STATUS: Record<AttendanceStatus, LiveCardStatus> = {
  candidate: '予定',
  planned:   '予定',
  attended:  '終了',
  skipped:   '終了',
}

/** チケットステータス → 日本語ラベル */
export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  'before-sale':  '発売前',
  'waiting':      '結果待ち',
  'payment-due':  '入金待ち',
  'pay-at-door':  '当日支払い',
  'paid':         '支払い済み',
  'issued':       '発券済み',
  'done':         '完了',
}

// ─── ライブ種別カラー ─────────────────────────────────────────────────────────
/** ライブ種別 → 表示カラー（チャート・タイムライン共通） */
export const LIVE_TYPE_COLOR: Record<string, string> = {
  'ワンマン':         'var(--color-encore-green)',
  '対バン':           'var(--color-encore-green-muted)',
  'フェス':           'var(--color-encore-amber)',
  '配信':             'var(--color-encore-border)',
  '舞台・公演':       '#7C3AED',
  'メディア出演':     '#0EA5E9',
  'リリースイベント': '#DB2777',
  'その他':           'var(--color-encore-text-muted)',
}

// ─── 曜日カラー ──────────────────────────────────────────────────────────────
/** 誕生日ピッカー等の曜日ヘッダー: 日曜 */
export const DOW_SUN_COLOR = '#E05555'
/** 誕生日ピッカー等の曜日ヘッダー: 土曜 */
export const DOW_SAT_COLOR = '#4878C0'

// ─── 通知バナー ───────────────────────────────────────────────────────────────
/** 誕生日・翌日ライブバナーの背景色 */
export const BANNER_BG_COLOR     = 'rgba(192,138,74,0.10)'
/** 誕生日・翌日ライブバナーのボーダー色 */
export const BANNER_BORDER_COLOR = 'rgba(192,138,74,0.22)'

/** チケットステータス → バッジ表示設定（label / bg / color） */
// ─── イベントカラー解決 ────────────────────────────────────────────────────────
/**
 * イベントの表示色を解決する。
 * 優先順位: ① イベント個別色 → ② メインアーティストの defaultColor (alwaysColor=true 時) → ③ undefined
 */
export function resolveEventColor(live: GrapeLive, artists: GrapeArtist[]): string | undefined {
  if (live.color) return live.color
  const mainArtistName = live.artists?.[0] ?? live.artist
  if (mainArtistName) {
    const artist = artists.find(a => a.name === mainArtistName)
    if (artist?.alwaysColor && artist.defaultColor) return artist.defaultColor
  }
  return undefined
}

export const TICKET_STATUS_CONFIG: Record<TicketStatus, { label: string; bg: string; color: string }> = {
  'before-sale':  { label: '発売前',     bg: 'var(--color-encore-bg-section)',  color: 'var(--color-encore-text-sub)' },
  'waiting':      { label: '結果待ち',   bg: 'var(--color-grape-tint-10)',      color: 'var(--color-encore-green)' },
  'payment-due':  { label: '入金待ち',   bg: 'var(--color-encore-amber)',        color: 'var(--color-encore-white)' },
  'pay-at-door':  { label: '当日支払い', bg: 'var(--color-grape-tint-10)',      color: 'var(--color-encore-green)' },
  'paid':         { label: '支払い済み', bg: 'var(--color-grape-tint-10)',      color: 'var(--color-encore-green)' },
  'issued':       { label: '発券済み',   bg: 'var(--color-encore-green)',        color: 'var(--color-encore-white)' },
  'done':         { label: '完了',       bg: 'var(--color-encore-bg-section)',  color: 'var(--color-encore-text-muted)' },
}
