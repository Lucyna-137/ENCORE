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
  artistImage?: string          // /Artistimg/NN.jpg
  artistImages?: string[]       // 対バン等で複数アーティスト画像（フェード切り替え用）
  coverImage?: string           // /liveimg/NN.jpeg etc
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
