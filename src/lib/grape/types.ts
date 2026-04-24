export type AttendanceStatus =
  | 'candidate'   // 気になる
  | 'planned'     // 行く
  | 'attended'    // 参戦済み
  | 'skipped'     // スキップ

export type TicketStatus =
  | 'before-sale'   // 発売前
  | 'waiting'       // 結果待ち（抽選結果日あり）
  | 'payment-due'   // 入金待ち（入金期限日あり）
  | 'pay-at-door'   // 当日支払い
  | 'paid'          // 支払い済み
  | 'issued'        // 発券済み
  | 'done'          // 完了

export type LiveTypeGrape = 'ワンマン' | '対バン' | 'フェス' | '配信' | '舞台・公演' | 'メディア出演' | 'リリースイベント' | 'その他'

export interface GrapeLive {
  id: string
  title: string
  artist: string
  artists?: string[]            // 対バン等で複数アーティスト名
  artistImage?: string          // /grape/artist/*.png
  artistImages?: string[]       // 対バン等で複数アーティスト画像（フェード切り替え用）
  coverImage?: string           // /grape/cover/*.png
  coverImagePosition?: string   // object-position e.g. '50% 30%'
  images?: string[]             // 追加画像（タイムテーブル/マップ等）base64 or URL
  venue: string
  date: string                  // 'YYYY-MM-DD'
  openingTime?: string          // 'HH:mm' 開場時間
  startTime: string             // 'HH:mm' 開演時間
  endTime?: string              // 'HH:mm'
  liveType?: LiveTypeGrape
  attendanceStatus: AttendanceStatus
  ticketStatus?: TicketStatus
  ticketUrl?: string
  salePhase?: string            // 販売フェーズ自由入力（例: FC先行 / オフィシャル先行 / 一般発売）
  ticketDeadline?: string       // 'YYYY-MM-DD' 入金・発券期限
  announcementDate?: string     // 'YYYY-MM-DD' 当落発表予定日
  announcementTime?: string     // 'HH:MM' 当落発表予定時刻
  saleStartDate?: string        // 'YYYY-MM-DD' 発売開始日（before-sale）
  saleStartTime?: string        // 'HH:MM' 発売開始時刻（before-sale）
  seatInfo?: string             // 座席情報 例: 'A列12番' / '未登録' / 'スタンディング'
  priority?: 'high' | 'medium' | 'low'  // チケット処理の優先度
  price?: number
  drink1Separate?: boolean          // 「1 Drink別途」フラグ
  merchandiseAmount?: number    // 物販代（円）。推し活の総支出集計用
  memo?: string
  color?: string                        // イベントカラー（HEX）。未設定 = デフォルト配色
}

export interface ArtistMember {
  name: string
  birthday?: string  // 'YYYY-MM-DD'
}

export interface GrapeArtist {
  id: string
  name: string
  image?: string
  birthday?: string    // 'YYYY-MM-DD'（ソロ用）
  members?: ArtistMember[]  // グループメンバー誕生日
  alwaysColor?: boolean // イベントを常にこのアーティストの色で表示
  defaultColor?: string // アーティスト固有の色（HEX）
}

/** カレンダーページのビューモード */
export type ViewMode = '月' | '週' | '日' | 'リスト'

/**
 * LiveCard の liveStatus prop に渡す表示ステータス型
 * （CalendarListView が AttendanceStatus をマッピングして使用）
 */
export type LiveCardStatus = '予定' | '抽選中' | '当選' | '落選' | '終了'

// ─── Setlist（Premium 機能）─────────────────────────────────────────────
//
// ひとつの GrapeLive に対して 1 セットリストを紐付ける。
// localStorage キー: `grape_setlists_v1`（GrapeLive 本体とは別ストレージ）
// 参照: src/lib/grape/useSetlistStore.ts

/** セットリスト内の 1 アイテム（曲 / MC / 区切り）の判別ユニオン */
export type SetlistItem =
  | SetlistSong
  | SetlistMC
  | SetlistDivider

export interface SetlistSong {
  kind: 'song'
  /** 曲名（表示用、原文そのまま） */
  title: string
  /** 正規化済みキー（検索・重複判定用。normalizeSong() で自動生成） */
  titleNormalized: string
  /** カバー曲の場合、原曲のアーティスト名（任意） */
  originalArtist?: string
  /**
   * 対バン時、この曲を演奏したアーティスト。
   * 値は GrapeArtist.name と一致させるか、'不明' を使う。
   * 単独公演では通常 undefined。
   */
  performedBy?: string
  /** 楽曲アートワーク URL（iTunes Search API キャッシュ等） */
  artworkUrl?: string
  /** 初披露フラグ（手動、または過去履歴との比較で自動判定） */
  debut?: boolean
  /** OCR 取り込み時の信頼度が低いフラグ（UI で「要確認」バッジ表示） */
  lowConfidence?: boolean
  /** 曲ごとのメモ */
  memo?: string
}

export interface SetlistMC {
  kind: 'mc'
  /** MC のメモ（任意、未設定時は UI が「MC」とだけ表示） */
  note?: string
}

export interface SetlistDivider {
  kind: 'divider'
  /**
   * 区切りラベル例:
   *   'ENCORE' / 'DOUBLE ENCORE' / '〜 somei 〜'（対バン時のアーティスト切替）
   */
  label: string
}

/** 1 ライブに紐づくセットリスト */
export interface Setlist {
  /** 紐づく GrapeLive.id */
  liveId: string
  /** セットリストアイテム（演奏順） */
  items: SetlistItem[]
  /**
   * うろ覚えで記録したか（UI で「うろ覚え」バッジ表示）
   * デフォルト false
   */
  approximate?: boolean
  /** 最終更新日時 (ISO 8601) */
  updatedAt: string
}
