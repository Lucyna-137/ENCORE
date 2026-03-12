# ENCORE UI Kit — デザインドキュメント

## プロジェクト概要
- **旧名**: CRISP UI Kit（フード系アプリ）→ ライブ管理アプリ向けに全面リライト済み
- **現在の名前**: ENCORE（仮名、変更予定あり）
- **目的**: Next.js/React でコンポーネントを実装し、のちに SwiftUI/Xcode で再現するためのリファレンス
- **プロジェクト場所**: `/Users/alfa/Desktop/encore-ui`

---

## デザイントークン

### カラー
| CSS変数 | 値 | 用途 |
|--------|-----|------|
| `--color-encore-bg` | `#F2F0EB` | メイン背景（白カード） |
| `--color-encore-bg-section` | `#E9E8E4` | セクション背景 / グレー行 |
| `--color-encore-bg-card` | `#EDEAE4` | カード背景（ProductCardのみ使用） |
| `--color-encore-green` | `#1B3C2D` | プライマリカラー（ボタン・テキスト） |
| `--color-encore-green-muted` | `#8BA898` | 無効状態・サイドバーサブテキスト |
| `--color-encore-amber` | `#C08A4A` | アクセント（リンク・CTA） |
| `--color-encore-text-sub` | `rgba(27,60,45,0.55)` | サブテキスト |
| `--color-encore-text-muted` | `rgba(27,60,45,0.35)` | ミュートテキスト・プレースホルダー |
| `--color-encore-border` | `#BAC2BB` | ボーダー（**グレー背景上**で使用） |
| `--color-encore-border-light` | `#E4E2DD` | ボーダー（**白背景上**で使用） |
| `--color-encore-white` | `#FFFFFF` | 白 |
| `--color-encore-error` | `#C0392B` | エラーカラー |
| `--color-body-bg` | `#CCC9C2` | ページ外側の背景 |

> **ボーダー使い分けルール**
> - `border`: グレー背景（`bg-section`）の上にある区切り線
> - `border-light`: 白背景（`bg`）の上にある区切り線・アウトライン

### 角丸
| トークン | 値 |
|---------|-----|
| `radius-sm` | `8px` |
| `radius-md` | `12px` |
| `radius-lg` | `16px` |
| `radius-pill` | `999px` |

### フォント
- **プライマリ（EN+JA）**: `var(--font-google-sans), var(--font-noto-jp), sans-serif`
- **英字のみ**: `var(--font-google-sans), sans-serif`
- Google Sans が先頭 → 文中英字も Google Sans で表示される

### フォントウェイト
- **2種類のみ**: `700`（太い）/ `400`（細い）
- 例外なし（600・500・300は使用しない）

### シャドウ
- `shadow-card`: `0 2px 8px rgba(0,0,0,0.07)`
- `shadow-phone`: `0 28px 80px rgba(0,0,0,0.28), 0 0 0 2px #1a1a1a`

---

## コンポーネント一覧（31個）

| # | コンポーネント | ファイル | カテゴリ |
|---|-------------|---------|---------|
| 00 | Splash Screen | `SplashScreen.tsx` | Foundation |
| 01 | Color Palette | `ColorPalette.tsx` | Foundation |
| 02 | Typography | `Typography.tsx` | Foundation |
| 03 | Buttons | `Button.tsx` | Controls |
| 04 | Nav Header | `NavHeader.tsx` | Navigation |
| 05 | Tab Bar | `TabBar.tsx` | Navigation |
| 06 | Horizontal Tabs | `HorizontalTabs.tsx` | Navigation |
| 07 | List Rows | `ListRow.tsx` | Content |
| 08 | Input Fields | `InputField.tsx` | Controls |
| 09 | Product Cards | `ProductCard.tsx` | Content |
| 10 | Ingredient Selector | `IngredientSelector.tsx` | Content |
| 11 | Segmented Control | `SegmentedControl.tsx` | Controls |
| 12 | Search Bar | `SearchBar.tsx` | Controls |
| 13 | Store Card | `StoreCard.tsx` | Content |
| 14 | Order Summary | `OrderSummary.tsx` | Content |
| 15 | Empty State | `EmptyState.tsx` | Feedback |
| 16 | Badges & Tags | `Badge.tsx` | Feedback |
| 17 | Rank Progress | `RankProgress.tsx` | Data Display |
| 18 | Bottom Sheet | `BottomSheet.tsx` | Feedback |
| 19 | Notification Banner | `Notification.tsx` | Feedback |
| 20 | Toggle Switch | `Toggle.tsx` | Controls |
| 21 | Credit Card UI | `CreditCard.tsx` | Data Display |
| 22 | Qty Stepper | `QuantityStepper.tsx` | Controls |
| 23 | Tooltip Bubble | `TooltipBubble.tsx` | Feedback |
| 24 | Calendar | `Calendar.tsx` | Data Display |
| 25 | Live Card | `LiveCard.tsx` | Content |
| 26 | Artist Card | `ArtistCard.tsx` | Content |
| 27 | FAB | `FAB.tsx` | Controls |
| 28 | Status Badge | `StatusBadge.tsx` | Feedback |
| 29 | Select | `Select.tsx` | Controls |
| 30 | Bar Chart | `BarChart.tsx` | Data Display |
| 31 | Color Picker | `ColorPicker.tsx` | Controls |

---

## コンポーネント設計ルール

### Button
- **Large バリアント**: `primary` / `secondary` / `ghost` / `disabled`
  - 高さ: `70px`、フォント: `14px 400`、角丸: `4px`
- **Medium バリアント**: `sm-primary` / `sm-ghost` / `sm-secondary`
  - 高さ: `46px`、フォント: `12px 400`、角丸: `rounded-full`
- **Small バリアント**: `xs-primary` / `xs-ghost` / `xs-secondary`
  - 高さ: `28px`、フォント: `11px 400`、角丸: `rounded-full`
- `secondary` / `sm-secondary` / `xs-secondary` のボーダーは **インラインスタイル**で指定（Tailwind クラスは specificity で負ける）
- リップルエフェクト: `.encore-ripple` クラスを動的生成

### HorizontalTabs
- タブ下線は絶対配置の1本の `div` を `left` / `width` の CSS transition でスライド
- グレー区切り線は `boxShadow: 'inset 0 -1px 0 var(--color-encore-border-light)'`（白背景上なので border-light）
- `overflow-y: hidden` は**使用しない**（絶対配置インジケーターがクリップされるため）

### StatusBadge
- `LiveStatusBadge`: 予定 / 抽選中 / 当選 / 落選 / 終了
- `LiveTypeBadge`: ワンマン / 対バン / フェス / 配信（完全角丸 `999px`）
- `LotteryStatusBadge`: エントリー前 / 受付中 / 申込済み / 締切 / 結果待ち
- 「当選」「落選」は `LiveStatusBadge` のみに存在（重複排除済み）

### Typography（デモテキスト方針）
- ライブ管理アプリのコンテキストに統一（食べ物系テキストは全廃）
- Body: `#1B3C2D` 100%、Sub: `rgba(27,60,45,0.55)`、Caption: `rgba(27,60,45,0.35)`

### FAB
- シャドウなし
- アイコン: `Plus weight="light"`
- フォント: `400`

---

## CSS クラス名（globals.css）
プレフィックス: `.encore-*`

| クラス | 用途 |
|-------|------|
| `.encore-ripple` | ボタンリップルエフェクト |
| `.encore-tab-strip` | HorizontalTabs のタブ行（overflow-x: auto） |
| `.encore-bottom-sheet-panel` | ボトムシートパネル |
| `.encore-notification` | 通知バナー（dismiss トランジション） |
| `.encore-toggle-knob` | トグルのつまみ |
| `.encore-badge-pop` | バッジ出現アニメ |
| `.encore-cal-pop` | カレンダーセル選択アニメ |
| `.encore-stepper-val` | ステッパー数値変化アニメ |
| `.encore-tooltip-tail-*` | ツールチップの矢印 |
| `.encore-week-strip` | 週スクロール |
| `.encore-sidebar` | サイドバー |

---

## 実装上の注意点

### ボーダー使い分け
- 白背景（`--color-encore-bg`）上の divider・outline → `--color-encore-border-light`
- グレー背景（`--color-encore-bg-section`）上のセパレーター → `--color-encore-border`
- RankProgress の装飾ノード・Toggle のオフ色 → `--color-encore-border`（デザイン上の意図）

### HorizontalTabs のオーバーフロー
- `overflow-y: hidden` を付けると絶対配置のスライドインジケーターがクリップされる
- `overflow-x: auto` のみ指定、Y方向はデフォルト（visible）

### CSS vs インラインスタイル
- hover/transition 系は Tailwind クラスで指定
- インラインスタイルと同プロパティを Tailwind で重ねない（specificity 競合）

### マージンコラプス対策
- `padding-top: 0` の親に `margin-top` の子 → コラプス発生
- Bottom Sheet のドラッグハンドルは `flex justify-center + padding` で対応

### flex column 内のボタン幅
- `sm-*` / `xs-*` ボタンが全幅になる場合は wrapper に `alignSelf: 'flex-start'`

---

## 今後の作業
- ブランド名「ENCORE」は仮名 → 確定後に全置換が必要
