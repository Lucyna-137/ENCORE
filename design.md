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

## コンポーネント一覧（32個）

| # | コンポーネント | ファイル | カテゴリ |
|---|-------------|---------|---------|
| 00 | Splash Screen | `SplashScreen.tsx` | Foundation |
| 01 | Color Palette | `ColorPalette.tsx` | Foundation |
| 02 | Typography | `Typography.tsx` | Foundation |
| 03 | Navigation Header | `NavHeader.tsx` | Navigation |
| 04 | Bottom Tab Bar | `TabBar.tsx` | Navigation |
| 05 | Horizontal Tabs | `HorizontalTabs.tsx` | Navigation |
| 06 | Buttons | `Button.tsx` | Controls |
| 07 | FAB | `FAB.tsx` | Controls |
| 08 | Input Fields | `InputField.tsx` | Controls |
| 09 | Select | `Select.tsx` | Controls |
| 10 | Segmented Control | `SegmentedControl.tsx` | Controls |
| 11 | Search Bar | `SearchBar.tsx` | Controls |
| 12 | Toggle Switch | `Toggle.tsx` | Controls |
| 13 | Qty Stepper | `QuantityStepper.tsx` | Controls |
| 14 | Color Picker | `ColorPicker.tsx` | Controls |
| 15 | Live Card | `LiveCard.tsx` | Content |
| 16 | Artist Card | `ArtistCard.tsx` | Content |
| 17 | List Rows | `ListRow.tsx` | Content |
| 18 | Product Cards | `ProductCard.tsx` | Content |
| 19 | Ingredient Selector | `IngredientSelector.tsx` | Content |
| 20 | Store Card | `StoreCard.tsx` | Content |
| 21 | Order Summary | `OrderSummary.tsx` | Content |
| 22 | Empty State | `EmptyState.tsx` | Feedback |
| 23 | Badges & Tags | `Badge.tsx` | Feedback |
| 24 | Status Badge | `StatusBadge.tsx` | Feedback |
| 25 | Bottom Sheet | `BottomSheet.tsx` | Feedback |
| 26 | Notification Banner | `Notification.tsx` | Feedback |
| 27 | Tooltip / Callout Bubble | `TooltipBubble.tsx` | Feedback |
| 28 | Rank Progress | `RankProgress.tsx` | Data Display |
| 29 | Credit Card UI | `CreditCard.tsx` | Data Display |
| 30 | Calendar | `Calendar.tsx` | Data Display |
| 31 | Bar Chart | `BarChart.tsx` | Data Display |

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

### LiveCard
- LiveType 7種、LiveStatus 5種（カード内は終了バッジ非表示）
- バッジ順: Status → Type（左から）
- `artistImages: string[]` で複数アバター重ねて表示（28px、-8px overlap）
- スクワークル: k=0.65（36px）

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
