# GRAPE リファクタ不変条件チェックリスト

**目的**: 本日のリファクタ実行中、各ステップ後に「表示崩れ・機能欠損が起きていないか」を確認するためのチェックリスト。
**原則**: このリストの**すべての項目が動作継続する**ことを保証。1項目でも壊れたら即ロールバック。

---

## 🗓 Calendar — Month View

- [ ] 期限マーカー Style B（日付セルの赤色塗り）
  - danger（2日以内）: 塗りつぶし赤 + 明滅（`urgencyDateFlash`）
  - warn（3-5日）: 薄赤 + 細罫線
  - info（6-14日）: 罫線なし薄tint
- [ ] 今日の日付ハイライト
- [ ] イベントタイプ別カラードット表示
- [ ] セルタップで MiniEventSheet オープン（同日複数イベントのプレビュー含む）
- [ ] 月跨ぎ（`< >` ナビ）で月切替
- [ ] スワイプで月切替
- [ ] 期限日タップ → 該当イベント EventPreviewScreen 遷移（`onUrgencyTap`）
- [ ] ツールチップ（ホバー）が `.grape-phone-frame` を基準にエッジセーフクランプ
- [ ] Calendar View 永続化: localStorage `grape-calendar-view`

## 🗓 Calendar — Week View

- [ ] **現在時刻ライン（NOW ライン）** ← 過去ロスト実績あり、最重要
- [ ] Drag-to-create（15分精度、ゴーストブロック、タップ/ドラッグ 6px 閾値）
- [ ] API が `startMin/endMin`（分単位）で統一されている
- [ ] 開場時間優先でのコマ描画
- [ ] 期限マーカー（週ビューでも表示）
- [ ] イベントブロック PointerEvent ベースのタップ
- [ ] 週送り（前後）

## 🗓 Calendar — Day View

- [ ] **現在時刻ライン（NOW ライン）** ← 同上、最重要
- [ ] Drag-to-create（Week と同仕様）
- [ ] 上部バナー「⚠ 入金期限: ○○ 詳細 ›」（期限ありの日のみ）
- [ ] 次の日 / 前の日ボタン
- [ ] `clickNextDay()` 対応（capture-lp-mobile.js が依存）
- [ ] `[data-event-block="true"]` 属性（スクリプトが依存）

## 🗓 Calendar — List View

- [ ] 週次合算チップ「`4/13 – 4/19 | 6件 ¥9,500`」
- [ ] 今週の週次チップは琥珀色
- [ ] ダブルブッキング警告表示
- [ ] 週単位の縦積み・センタリング
- [ ] 月ヘッダー

## 🎫 Tickets

- [ ] タブカウント: 申込中 3件 / 要対応 2件 / 完了 2件
  - `before-sale` + `waiting` → 申込中
  - `payment-due` → 要対応
  - `paid/issued/done/pay-at-door` → 完了
- [ ] チケットカード: サムネイル左、スクワークル、coverImage優先
- [ ] イベント名 15px・2行 `-webkit-line-clamp: 2`
- [ ] 空状態オンボーディング3パターン
- [ ] 日付色 単色統一（土日の青赤廃止済み）
- [ ] 「要対応N件」バッジ位置（縦ずれしない）

## 📊 Report

- [ ] 期間タブ（今月/今年/累計）
- [ ] 今月時の月送り（`< >` + スワイプ）
- [ ] HeroCard（期間タイトル + 主要アーティスト + 主要会場）
- [ ] MonthlyChart（月別推移、バーチャート 550ms cubic-bezier、25ms stagger）
- [ ] ArtistStackChart（水平スタックバー + TOTAL EVENTS ラベル）
  - [ ] サムネイル吹き出しツールチップ（タップ/長押し、5%未満は無視）
  - [ ] `stackTooltipIn` アニメーション
- [ ] ArtistRankingList
- [ ] Live Type チャート
- [ ] Venue Ranking
- [ ] 空状態 EmptyState
- [ ] Report スクロールコンテナが `flex: 1, overflowY: auto` 構造（LP 撮影スクリプトが依存）

## 🎤 Artist Detail

- [ ] **正方形フルブリード写真**（`HERO_H = 393`、最上部まで到達）
- [ ] StatusBar 透明オーバーレイ（時刻 + バッテリー、シャドウで可読性確保）
- [ ] Back/Menu ボタン `top: 52`
- [ ] ポップオーバー `top: 100`
- [ ] 上部スクリム（縦グラデ 130px）
- [ ] 期間切替ドロップダウン（今月/今年/累計）
- [ ] 月送りナビ（< > + スワイプ）
- [ ] 統計カード（予定/参戦済み/気になる/合計費用）
- [ ] アーティストカラー反映
- [ ] イベントリスト

## ⚙️ Settings

- [ ] AppSummaryCard（20本 / 6アーティスト / Free プラン）
- [ ] 「?」InfoCircle アイコン → PlanInfoModal
- [ ] アーティスト管理 `N/5` カウンター
  - [ ] 上限時に Lock アイコン + アンバー色
- [ ] PremiumInfoCard（ダークパープル + ゴールドクラウン、カード全体タップで Sheet 起動）
- [ ] ColorPalette（Grape/Ocean/Moss/BlueBerry、useSyncExternalStore + subscribeToSchemeId）
  - [ ] 選択ズレしない
- [ ] カラーピッカー（10カラートークン）
- [ ] アーティスト削除ダイアログ（リンクイベント件数表示、2択）
- [ ] プライバシー・利用規約 iframe（`?embed=1`）
- [ ] お問い合わせ Google Forms リンク（`forms.gle/DwXucUV4tLyMhWRTA`）
- [ ] 「使い方」行が非表示

## 📱 Sheets & Modals

- [ ] **QuickEventSheet**
  - [ ] ヘッダに参戦ステータス4択チップ（気になる/行く/参戦済み/スキップ）
  - [ ] ヘッダにチケットステータスバッジ（アンバー、タップでスクロール）
  - [ ] チケット FormSection `defaultOpen={!!ticketStatus}`
  - [ ] 同日重複警告（リアルタイム検出）
  - [ ] 下書き自動保存（`grape-event-draft-v1`、700ms debounce、新規作成時のみ）
  - [ ] 復元プロンプトバナー（[破棄] / [復元]）
  - [ ] スマートデフォルト（liveType = 直近、会場 = フォーカス時サジェスト）
  - [ ] Premium 訴求バナーを最下部
  - [ ] URLから取り込む PREMIUM バッジ（Free ユーザ向けアップセル）
- [ ] **EventPreviewScreen**
  - [ ] カバー 240px
  - [ ] 複数アーティスト縦リスト（`live.artistImages[]`）
  - [ ] 価格 InfoRow（+1Drink別途）
  - [ ] 座席情報 InfoRow
  - [ ] Urgency Banner（14日以内カウントダウン、3階層トーン）
  - [ ] 参戦ステータスチップ（プライマリーグリーン）
  - [ ] 左右スワイプ（Stories風、`allLives` 日時順ソート）
  - [ ] 極薄 chevron 円（`rgba(0,0,0,0.14)`, opacity 0.7）
  - [ ] 180ms スライド遷移
  - [ ] 抽選結果表示（`ticketStatus === 'waiting'` + `announcementDate/Time`）
  - [ ] 「チケット情報を登録する」リンク（ticketStatus 未設定時）
- [ ] **MiniEventSheet**
  - [ ] 同日プレビュー
  - [ ] 時間帯重複で赤色警告
  - [ ] `startMin/endMin`（分単位）
- [ ] **AddActionSheet**
  - [ ] Premium 時のみ「URL/画像から」表示
- [ ] **URLImportSheet**
  - [ ] 解析4段階スピナー（0/1.5s/5s/10s）
  - [ ] 画像プレビュー + 個別削除
  - [ ] アーティスト登録チェックボックス（「すべて選択」マスター、初期 = 未選択）
  - [ ] 情報不足警告バナー
  - [ ] × 閉じる時の破棄確認
- [ ] **PremiumUpgradeSheet**
  - [ ] フルカバー `position: absolute, inset: 0`
  - [ ] 背景色 `#1C0F42`
  - [ ] 打ち消し価格（~~¥980~~ ¥480）
  - [ ] ゴールドクラウン
  - [ ] Premium機能3つ（無制限登録 / URL取り込み / 詳細レポート）
  - [ ] 購入を復元ボタン
  - [ ] z-index = 900
- [ ] **PlanInfoModal**: z-index = 250
- [ ] **DayAgendaSheet**

## 🧩 Shared Components

- [ ] NavHeader タイトル
  - [ ] `variant="close"` / `"back"` 時 `paddingLeft/Right: 52`
  - [ ] `variant="title-only"` 時はパディングなし
- [ ] PhoneFrame（レスポンシブ）
  - [ ] ≥900px: 393×852 iPhone風フレーム（角R44 + シャドウ + 外周余白）
  - [ ] <900px: 全画面、`html,body overflow:hidden`
- [ ] HorizontalTabs
  - [ ] スライドインジケーター
  - [ ] `.encore-tab-strip` は `overflow-x: auto` のみ（Y方向は指定しない）
- [ ] EncoreSelect（フォントサイズ 15px）
- [ ] EncoreToggle / EncoreRadio
- [ ] ArtistAvatar 重なり表示（28px、`-8px` offset）
- [ ] LiveCard（バッジ順: Live Status → Live Type）
- [ ] TicketTaskCard
- [ ] Ripple effect（`.encore-ripple`、550ms ease-out）
- [ ] Bottom Sheet ドラッグハンドル（flex justify-center + padding）
- [ ] InputField
  - [ ] カウンターはボーダー div の**外**（下）配置
  - [ ] controlled モード対応（`value` + `onChange`）

## 🎨 Animations

- [ ] `encore-bell-ring`（1.4s 周期）
- [ ] `encore-border-pulse`（1.6s 周期）
- [ ] `urgencyDateFlash`（Style B danger）
- [ ] `stackTooltipIn`（ArtistStackChart サムネイル）
- [ ] `encore-ripple`（scale 0→70、550ms ease-out、rgba(255,255,255,0.35)）
- [ ] count-up numbers（700ms easeOutExpo）
- [ ] Sheet slide in/out（`cubic-bezier(0.32, 0.72, 0, 1)`）
- [ ] Pop / badge appear（`cubic-bezier(0.34, 1.56, 0.64, 1)`）
- [ ] Bar charts（550ms + 25ms stagger）
- [ ] Calendar スワイプ
- [ ] カレンダーセル選択 `.encore-cal-pop`
- [ ] ステッパー数値 `.encore-stepper-val`
- [ ] PieChart アバター浮遊 `.encore-float`（3s ease-in-out infinite）
- [ ] UNDO トースト 4秒

## 💾 Data & Storage

- [ ] localStorage キー:
  - `grape_lives_v1`（ライブデータ）
  - `grape-calendar-view`（カレンダービュー）
  - `grape-last-tab`（最後のタブ）
  - `grape-event-draft-v1`（下書き）
  - `grape-is-premium`（Premium フラグ、テスト用切替）
  - `encore-palette-v2`（カラーパレット）
  - `grape_setlists_v1`（将来：セットリスト）
- [ ] dummyData.ts: ARTISTS 6組 + LIVES 20件
- [ ] PREMIUM_FEATURES 3項目
- [ ] `/api/event-from-url` エンドポイント
- [ ] ALWAYS_USE_JINA ドメイン: l-tike / eplus / cnplayguide / peatix
- [ ] Anthropic SDK + Prompt Caching (ephemeral)
- [ ] Jina AI Reader フォールバック
- [ ] UA: `GRAPEbot/1.0 (+https://grape.app/bot)`
- [ ] FREE_ARTIST_LIMIT = 5

## 🔐 Premium 判定

- [ ] `useIsPremium()` hook（useSyncExternalStore）
- [ ] AddActionSheet / URLImportSheet / PremiumUpgradeSheet の Premium 分岐
- [ ] Free 向けアップセルバナー

## 📚 z-index 階層

- [ ] PremiumUpgradeSheet: **900**
- [ ] URLImportSheet 閉じる確認: **400**
- [ ] QuickEventSheet main: **300**
- [ ] PlanInfoModal: **250**
- [ ] URLImportSheet: **200**
- [ ] AddActionSheet: **180**

## 🔧 LP・外部スクリプト依存

- [ ] `scripts/capture-lp-mobile.js` が動作継続
  - [ ] `[data-event-block="true"]` 属性
  - [ ] `overflowY: auto` のスクロール要素
  - [ ] `.grape-phone-frame` / `.grape-outer` クラス
  - [ ] `border-top-left-radius: 44px` の phone frame 識別
- [ ] `scripts/capture-lp-artists.js` が動作継続
- [ ] `scripts/capture-lp-report-parts.js` が動作継続
  - [ ] TabBar がスクロール要素の次の兄弟 div
  - [ ] TabBar の `height: 68px`

## 🎨 デザイントークン（壊してはいけない）

- [ ] フォントスタック: `var(--font-google-sans), var(--font-noto-jp), sans-serif`
- [ ] フォントウェイト: **700 と 400 のみ**（500/600/300 禁止）
- [ ] テキスト色: `#1A3A2D` ベース（透明度で階層）
- [ ] 角丸: カード 8px / ピル 999px / スマホフレーム 44px
- [ ] スクワークル: k=0.72（ArtistCard/OrderSummary）、k=0.65（ColorPicker/LiveCard）
- [ ] Phosphor Icons `weight="light"` 統一（規約に則っている箇所）

---

## 検証手順（各ステップ後に実行）

1. `npx tsc --noEmit`（型エラー）
2. `npm run lint`（lint 警告）
3. `npm run build`（ビルド成功）
4. `npm run dev` → ブラウザで以下画面を目視確認:
   - `/grape/calendar`（月 / 週 / 日 / リスト 4モード切替）← **現在時刻ラインに特に注意**
   - `/grape/tickets`
   - `/grape/report`（期間 3タブ）
   - `/grape/artist/koharu`（正方形写真）
   - `/grape/settings`
5. インタラクション:
   - イベントブロックタップ → EventPreviewScreen
   - Drag-to-create（Week/Day）
   - 左右スワイプ（EventPreviewScreen）
   - Premium 切替（`localStorage.setItem('grape-is-premium', 'true')`）
   - URL取り込み（任意、API 利用）
6. スクリプト動作確認:
   - `node scripts/capture-lp-mobile.js` で 10枚撮れる
   - `node scripts/capture-lp-report-parts.js` で 3枚撮れる

## ロールバック方針

各ステップを **独立コミット** にする。不変条件が1つでも壊れたら:

```bash
git reset --hard HEAD~1
```

で直前のコミットを破棄 → 原因特定 → 計画修正。
