# ENCORE UI Kit — デザインドキュメント

## プロジェクト概要
- **旧名**: CRISP UI Kit（フード系アプリ）→ ライブ管理アプリ向けに全面リライト済み
- **現在の名前**: ENCORE（仮名、変更予定あり）
- **目的**: Next.js/React でコンポーネントを実装し、のちに SwiftUI/Xcode で再現するためのリファレンス
- **プロジェクト場所**: `/Users/alfa/Desktop/ENCORE`

---

## デザイントークン

### カラー
| CSS変数 | 値 | 用途 |
|--------|-----|------|
| `--color-encore-bg` | `#FAF8F4` | メイン背景（白カード） |
| `--color-encore-bg-section` | `#E9E8E4` | セクション背景 / グレー行 |
| `--color-encore-bg-card` | `#EDEAE4` | カード背景 |
| `--color-encore-green` | `#1A3A2D` | プライマリカラー（ボタン・テキスト） |
| `--color-encore-green-muted` | `#8BA898` | 無効状態・サイドバーサブテキスト |
| `--color-encore-amber` | `#C08A4A` | アクセント（Tab Bar アクティブ・CTA） |
| `--color-encore-text-sub` | `rgba(26,58,45,0.55)` | サブテキスト |
| `--color-encore-text-muted` | `rgba(26,58,45,0.35)` | ミュートテキスト・プレースホルダー |
| `--color-encore-border` | `#BAC2BB` | ボーダー（**グレー背景上**で使用） |
| `--color-encore-border-light` | `#E4E2DD` | ボーダー（**白背景上**で使用） |
| `--color-encore-white` | `#FFFFFF` | 白 |
| `--color-encore-error` | `#C0392B` | エラーカラー |
| `--color-body-bg` | `#CCC9C2` | ページ外側の背景 |

> **ボーダー使い分けルール**
> - `border`: グレー背景（`bg-section`）の上にある区切り線
> - `border-light`: 白背景（`bg`）の上にある区切り線・アウトライン
> - RankProgress の装飾ノード・Toggle のオフ色は例外的に `border` を使用

### 角丸
| トークン | 値 |
|---------|-----|
| `radius-sm` | `8px` |
| `radius-md` | `12px` |
| `radius-lg` | `16px` |
| `radius-pill` | `999px` |

### フォント
- **プライマリ（EN+JA）**: `var(--font-google-sans), var(--font-noto-jp), sans-serif`
- Google Sans が先頭 → 文中英字も Google Sans で表示される
- **ウェイト**: `700`（太い）/ `400`（細い）の2種類のみ。例外なし（600・500・300は使用しない）
- **テキスト色**: `#1A3A2D` ベース、透明度で階層表現

### シャドウ
- `shadow-card`: `0 2px 8px rgba(0,0,0,0.07)`
- `shadow-phone`: `0 28px 80px rgba(0,0,0,0.28), 0 0 0 2px #1a1a1a`

---

## コンポーネント一覧（34個）

| # | コンポーネント | ファイル | カテゴリ |
|---|-------------|---------|---------|
| 00 | Splash Screen | `SplashScreen.tsx` | Foundation |
| 01 | Color Palette | `ColorPalette.tsx` | Foundation |
| 02 | Typography | `Typography.tsx` | Foundation |
| 03 | Navigation Header | `NavHeader.tsx` | Navigation |
| 04 | Bottom Tab Bar | `TabBar.tsx` | Navigation |
| 05 | Horizontal Tabs | `HorizontalTabs.tsx` | Navigation |
| 06 | View Toggle | `ViewToggle.tsx` | Navigation |
| 07 | Buttons | `Button.tsx` | Controls |
| 08 | FAB | `FAB.tsx` | Controls |
| 09 | Input Fields | `InputField.tsx` | Controls |
| 10 | Select | `Select.tsx` | Controls |
| 11 | Segmented Control | `SegmentedControl.tsx` | Controls |
| 12 | Search Bar | `SearchBar.tsx` | Controls |
| 13 | Toggle Switch | `Toggle.tsx` | Controls |
| 14 | Qty Stepper | `QuantityStepper.tsx` | Controls |
| 15 | Color Picker | `ColorPicker.tsx` | Controls |
| 16 | Live Card | `LiveCard.tsx` | Content |
| 17 | Product Cards | `ProductCard.tsx` | Content |
| 18 | Artist Card | `ArtistCard.tsx` | Content |
| 19 | List Rows | `ListRow.tsx` | Content |
| 20 | Ingredient Selector | `IngredientSelector.tsx` | Content |
| 21 | Store Card | `StoreCard.tsx` | Content |
| 22 | Order Summary | `OrderSummary.tsx` | Content |
| 23 | Empty State | `EmptyState.tsx` | Feedback |
| 24 | Badges & Tags | `Badge.tsx` | Feedback |
| 25 | Status Badge | `StatusBadge.tsx` | Feedback |
| 26 | Bottom Sheet | `BottomSheet.tsx` | Feedback |
| 27 | Notification Banner | `Notification.tsx` | Feedback |
| 28 | Tooltip / Callout Bubble | `TooltipBubble.tsx` | Feedback |
| 29 | Rank Progress | `RankProgress.tsx` | Data Display |
| 30 | Credit Card UI | `CreditCard.tsx` | Data Display |
| 31 | Calendar | `Calendar.tsx` | Data Display |
| 32 | Bar Chart | `BarChart.tsx` | Data Display |
| 33 | Pie Chart | `PieChart.tsx` | Data Display |

---

## コンポーネント設計仕様

### Button
- **Large**: `primary` / `secondary` / `ghost` / `disabled` — 高さ `70px`、フォント `14px 400`、角丸 `4px`
- **Medium**: `sm-primary` / `sm-ghost` / `sm-secondary` — 高さ `46px`、フォント `12px 400`、角丸 `pill`
- **Small**: `xs-primary` / `xs-ghost` / `xs-secondary` — 高さ `28px`、フォント `11px 400`、角丸 `pill`
- リップルエフェクト: `.encore-ripple` クラスを動的生成

### FAB
- 高さ・幅: `46px`（extended 時は幅 auto、padding `0 20px`）
- アイコン: `Plus size={20} weight="light"`
- フォント: `12px 400`、シャドウなし

### HorizontalTabs
- タブ下線: 絶対配置の `div` を `left` / `width` の CSS transition でスライド（`scaleX` は使わない）
- 区切り線: `boxShadow: 'inset 0 -1px 0 var(--color-encore-border-light)'`

### InputField
- 構造: `mb-6` wrapper → ボーダー flex行（icon + label + input）→ カウンター（ボーダーの**外**）
- 非選択ボーダー: `1.5px solid --color-encore-border-light`
- フォーカスアニメーション: 絶対配置 div（`height: 1px, bottom: -1`）が `scaleX(0→1)`, `transformOrigin: 'left'` で左から右へスライドイン
- フォーカス時: ラベル色 muted → green、アイコン opacity `0.4` → `1`
- props: `style` → mb-6 wrapper、`inputStyle` → input 要素

### StatusBadge
- `LiveStatusBadge`: 予定 / 抽選中（→チケット抽選中） / 当選（→チケット当選） / 落選（→チケット落選） / 終了
- `LiveTypeBadge`: ワンマン / 対バン / フェス / 配信 / 舞台・公演 / メディア出演 / リリースイベント
- LotteryStatus: 廃止済み

### ViewToggle
- ヘッダー内設置用のセグメントスイッチ（2択以上対応）
- スライダー: `useRef` でボタン幅を測定し `left` + `width` を CSS transition でアニメーション
- 高さ: `28px`、フォント: `ty.caption`（11px）、fontWeight: 700固定（テキスト幅変動防止）
- アクティブ: 白テキスト / 非アクティブ: `text-sub` テキスト

### BarChart
- `orientation: 'horizontal' | 'vertical'`
- Horizontal: アバター + アーティスト名 + バー + 回数 + パーセンテージ（合計比）
- Vertical: 高さアニメーション付き棒グラフ（月別推移など）
- パーセンテージはセグメントカラーで表示（`Math.round(value/total*100)%`）

### PieChart
- SVG `stroke-dasharray` / `strokeDashoffset` でドーナツチャートを描画
- STROKE: 13px（細め）、RADIUS: 78px、SIZE: 260px
- アバターはリング外周に極座標計算で配置（`AVATAR_ORBIT = RADIUS + STROKE/2 + 26`）
- アバターに `.encore-float` クラス + `animationDelay: i * 0.6s` でゆらゆら浮遊アニメ
- 中央テキスト: TOTAL LIVES（9px muted）/ 合計数（40px green）/ N ARTISTS（9px bold green）
- TOP ARTISTSレジェンドは廃止（BarChart に役割移管）

### LiveCard
- LiveType 7種、LiveStatus 5種（カード内は終了バッジ非表示）
- バッジ順: Status → Type（左から）
- `artistImages: string[]` で複数アバター重ねて表示（28px、-8px overlap）
- スクワークル: k=0.65（36px）
- 日付エリア右側の縦ボーダーなし

### ArtistCard / ArtistAvatar
- スクワークル形状: k=0.72
- サイズ: sm=36px / md=48px / lg=64px
- `image?: string` prop で画像表示対応

### InputField
- controlled対応: `value` + `onChange` props（2026-03-13追加）
- uncontrolled: `defaultValue` で内部state管理
- フォーカスアニメーション: 左→右スライドの green アンダーライン

### HorizontalTabs
- `tabs: (string | React.ReactNode)[]`（ReactNode対応済み）
- Phosphorアイコン入りタブラベル使用可能

### Typography スケール（確定）
| スタイル | サイズ | ウェイト | フォント |
|---------|--------|---------|---------|
| Display | 32px | 700 | EN |
| Title | 24px | 700 | EN |
| Heading | 18px | 700 | JA |
| Section | 15px | 700 | JA |
| Section SM | 14px | 700 | JA |
| Body | 13px | 400 | JA |
| Body SM / Sub | 12px | 400 | JA |
| Price | 15px | 700 | EN |
| Link | 13px | 400 | JA amber |
| Caption | 11px | 400 | EN |
| Caption Muted | 11px | 400 | EN muted |

- `text-sub` (rgba 0.55) は薄い → 通常テキストは `--color-encore-green` を使う
- `typographyStyles.ts` に `section`・`sectionSM` の共通定数あり

### デザインルール（確定）
- **角丸**: `borderRadius: 8`（全コンポーネント背景）
- **シャドウ**: `boxShadow: var(--shadow-card)` はコンポーネントに使用しない
- **シェブロン**: CaretRight / CaretDown は全て `var(--color-encore-green)`
- **アイコン**: Phosphor Icons、`weight="light"` 統一

### 静的アセット（public/）
- ライブフライヤー: `liveimg/` (01.jpeg, 02.jpg, 03.jpeg.webp, 04.jpeg)
- アーティスト画像: `Artistimg/` (01〜04.jpg)
- 会場画像: `Houseimg/unnamed.webp`（Zepp Haneda）

---

## 今後の作業
- ブランド名「ENCORE」は仮名 → 確定後に全置換が必要

---

## Grape アプリ デザイン仕様（2026-03-19 追加）

### ルート構成
- `/grape/calendar` — カレンダーページ（メイン）
- `/grape/tickets` — チケット管理ページ
- `/grape/report`, `/grape/settings` — 未実装（Tab Bar には表示あり）

### Grape Tab Bar
ENCORE `TabBar.tsx` と完全同一パターンで実装:
- `weight="regular"`, `size=24`
- アクティブ色: `var(--color-encore-amber)`
- 非アクティブ色: `var(--color-encore-green)`
- ラベル: uppercase, 9px, fontWeight 700, letterSpacing 0.08em
- アイテム: CALENDAR（CalendarBlank）/ TICKETS（Ticket）/ REPORT（ChartBar）/ SETTINGS（GearSix）

### Grape ページヘッダー
```
[captionMuted + uppercase + letterSpacing 0.14em] → "Grape"
[ty.display, lineHeight: 1] → "Calendar" or "Tickets"
```

### Grape ViewToggle（CalendarViewToggle）
- ENCORE `ViewToggle.tsx` と同一パターン（sliding indicator）
- オプション: Month / Week / Day / List
- 背景: `var(--color-encore-bg-section)`, 角丸: 999px
- インジケーター: `var(--color-encore-green)`, left + width の CSS transition

### Grape カレンダー仕様
- **月ビュー**: 1px gap グリッド・32x32カバーサムネイル・overflow バッジ・today circle・選択セル bg
- **週ビュー**: 48px/hour・現在時刻ライン・attendanceStatus カラーのイベントブロック
- **日ビュー**: 56px/hour・CaretLeft/Right ナビ・「今日」ピル・mount 時 10時へスクロール
- **リストビュー**: LiveCard コンポーネント使用・月区切りヘッダー・背景 `var(--color-encore-bg-section)`
  - 過去イベント: opacity 0.6
  - 月ヘッダー: `ty.title`（20px）＋ `ty.captionMuted`（年）

### AttendanceStatus → LiveCard LiveStatus マッピング
| AttendanceStatus | LiveCard LiveStatus |
|-----------------|---------------------|
| candidate / planned | 予定 |
| raffle | 抽選中 |
| won | 当選 |
| lost | 落選 |
| attended / skipped | 終了 |

### Grape 静的アセット（public/grape/）
- アーティスト画像: `/grape/artist/` — somei.JPG / シユイ.JPG / 優利香.JPG / Ado.JPG / スーパー登山部.JPG / yama.JPG
- カバー画像: `/grape/cover/` — 各イベントフライヤー（詳細は MEMORY.md の画像紐付けを参照）
