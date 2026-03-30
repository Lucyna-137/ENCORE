# ENCORE UI Kit — セッション記憶

## プロジェクト場所
- **作業ディレクトリ**: `/Users/uchiki/Desktop/ENCORE`
- **開発サーバー**: http://localhost:3000
- **HTML リファレンス**: 削除済み（全コンポーネント照合完了 2026-03-12）

## 重要なコンテキスト
- 元々「CRISP SALAD WORKS」アプリのデザインシステム
- 「CRISP」→「ENCORE」に全リネーム済み（ブランド名は仮）
- 34個のコンポーネントを Next.js/TSX で実装したショーケース（`/` ルート）
- 最終目的: SwiftUI/Xcode での再実装リファレンス
- **Grape** — マルチアーティスト向けライブ管理サブアプリを `/grape/*` に追加済み

## ファイル構成
- `src/app/page.tsx` — 全コンポーネントを展示するメインページ（**変更禁止**）
- `src/app/globals.css` — Tailwind v4 @theme + `.encore-*` カスタムCSSクラス
- `src/components/encore/*.tsx` — 34個のコンポーネント
- `src/app/grape/` — Grape アプリのルート群
- `src/components/grape/` — Grape 専用コンポーネント群
- `src/lib/grape/` — Grape の型定義・ダミーデータ

## 詳細ドキュメント
- `/Users/uchiki/Desktop/ENCORE/design.md` — デザイントークン・実装ルール・修正メモ詳細
- `/Users/uchiki/Desktop/ENCORE/CLAUDE.md` — プロジェクト固有の作業指示

## 全コンポーネントステータス（HTML照合完了）
- S00〜S21: 修正済み（Button, NavHeader, CreditCard 等）
- S22 Qty Stepper: リスト形式に修正済み
- S23 Tooltip Bubble: chat-left/chat-right バリアント追加・修正済み
- S24 Calendar: ReservationCalendar・WeekStrip を HTML に合わせて修正済み

---

## Grape アプリ（2026-03-19 実装完了）

### 概要
マルチアーティストファン向けのライブ管理アプリ。ENCORE デザインシステムの拡張として構築。

### 実装済みルート
| ルート | ページ |
|--------|--------|
| `/grape/calendar` | カレンダー（月/週/日/リスト 4ビュー） |
| `/grape/tickets` | チケット管理（タブ絞り込み） |

### 実装済みコンポーネント（`src/components/grape/`）
| ファイル | 概要 |
|---------|------|
| `AttendanceStatusMarker.tsx` | 出席状態を6pxドットで表示（raffle は amber pulse アニメ） |
| `CalendarMonthView.tsx` | 月グリッド・カバー画像サムネイル・overflow バッジ・選択セル bg |
| `CalendarWeekView.tsx` | Google Calendar 風・48px/hour・現在時刻ライン |
| `CalendarDayView.tsx` | 単日タイムライン・56px/hour・CaretLeft/Right ナビ・マウント時 10時へスクロール |
| `CalendarListView.tsx` | LiveCard を使ったリスト表示・月区切りヘッダー・bg-section 背景 |
| `DayAgendaSheet.tsx` | 日付タップ時のボトムシートオーバーレイ |
| `QuickEventSheet.tsx` | イベント簡易追加シート |
| `LiveCompareCard.tsx` | 56x56 カバー + タイトル/アーティスト/会場/時間 + ステータスマーカー |
| `TicketTaskCard.tsx` | チケット管理カード（52x52カバー・締切ピル・状態バッジ） |

### 型定義（`src/lib/grape/types.ts`）
```ts
AttendanceStatus: 'candidate' | 'planned' | 'raffle' | 'won' | 'lost' | 'attended' | 'skipped'
TicketStatus: 'before-entry' | 'open' | 'applied' | 'waiting' | 'won' | 'payment-due' | 'issued' | 'done' | 'lost'
LiveTypeGrape: 'ワンマン' | '対バン' | 'フェス' | '配信'
```

### AttendanceStatus → LiveCard LiveStatus マッピング
| AttendanceStatus | LiveCard表示 |
|-----------------|-------------|
| candidate / planned | 予定 |
| raffle | 抽選中 |
| won | 当選 |
| lost | 落選 |
| attended / skipped | 終了 |

### ダミーデータ（`src/lib/grape/dummyData.ts`）
- 6アーティスト: somei / シユイ / 優利香 / Ado / スーパー登山部 / yama
- 20ライブ（l01〜l20）: 2026-03-05 〜 2026-05-23
- アーティスト画像: `/grape/artist/*.JPG`
- カバー画像: `/grape/cover/*.JPG`（2026-03-19 に画像紐付けを正しく修正済み）

### 画像紐付け（2026-03-19 修正内容）
**確定している正しい紐付け:**
| ライブ | coverImage |
|--------|-----------|
| l01, l16 Somei ASYLUM | `Somei 1st ONE MAN LiVE『ASYLUM』.JPG` |
| l02 切磋琢磨 4th anniversary | `切磋琢磨 4th anniversary.JPG` |
| l03 Shibuya Fidd Out! Vol.3 | `IMG_9808.JPG`（Shibuya Find Out!! Vol.3 フライヤー） |
| l04 Kabukicho Street Live Fes. | `IMG_9747.JPG`（アーティスト一覧ポスター） |
| l05 Shibuya Street Live × SFW® | `Shibuya Street Live × SFW_優利香.JPG` |
| l06 Shibuya Street Live × SFW® somei | `Shibuya Street Live × SFW2_somei.JPG` |
| l07 CONTINUE 優利香 ワンマン | `CONTINUE_優利香.JPG` |
| l08 シェアート FES 2026 | `シェアート FES 2026.JPG` |
| l09 シェアート FES 2026（2日目） | `シェアート FES 2026_2.JPG` |
| l18 下北沢 Daisy Bar 優利香 presents | `IMG_0173.JPG`（優利香 presents フライヤー） |
| l19 Shibuya Fidd Out! Vol.3 追加公演 | `Shibuya Fidd Out! Vol.3.JPG` |

**coverImage なし（artistImage にフォールバック）:**
l10 Women's Voice 2026 / l11 LIGHTSのすゝめ / l12 Majorrity blues / l13 Make Happy!! / l14 HAG ROCK GW / l15 HAG ROCK GW day2 / l17 TAKE OFF LIVE / l20 yama acoustic night

**使用しないタイムテーブル画像（フォルダに残存）:**
- `Kabukicho Street Live Fes.JPG` — 歌舞伎町タイムテーブル
- `Kabukicho Street Live Fes2.JPG` — 同上
- `IMG_9747 2.JPG` — 同上
- `IMG_9887.JPG` — animate Theater LIVE'd 2026 SPRING（マッチするイベントなし）

### Grape UI デザイン仕様（ENCORE 準拠）
- **ページタイトル**: `ty.display`（32px EN 700）英語表記（"Calendar" / "Tickets"）
- **サブキャプション**: `ty.captionMuted` + `letterSpacing: '0.14em'` + `textTransform: 'uppercase'` で "Grape"
- **ViewToggle**: `CalendarViewToggle` — ViewToggle.tsx と同パターン（useRef + left/width transition）
  - ラベル: Month / Week / Day / List（英語）
- **Tab Bar**: `TabBar.tsx` 準拠 — `weight="regular"`, size=24, amber アクティブ, uppercase 9px 700
- **カレンダーリスト背景**: `var(--color-encore-bg-section)` でカードを浮き立たせる
- **「当選」「要対応」サマリーピル**: カレンダー画面には不要（Tickets 画面の役割）

### launch.json
`.claude/launch.json`（プロジェクト内）と `/Users/uchiki/Desktop/.claude/launch.json`（両方）に設定済み:
```json
{ "name": "ENCORE Dev Server", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev"], "port": 3000 }
```

---

## 今後の検討事項
- ブランド名「ENCORE」は仮名 → 確定後に全置換が必要
- Grape: `/grape/report` `/grape/settings` ルートは未実装
- Grape: カバー画像のないイベント（l10〜l15 等）に専用フライヤー画像の追加を検討
