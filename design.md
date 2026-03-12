# ENCORE UI Kit — デザインドキュメント

## プロジェクト概要
- **旧名**: CRISP UI Kit（CRISP SALAD WORKS アプリのデザインシステム）
- **現在の名前**: ENCORE（仮名、変更予定あり）
- **目的**: Next.js/React でコンポーネントを実装し、のちに SwiftUI/Xcode で再現するためのリファレンス
- **HTMLリファレンス**: 削除済み（全25コンポーネントの照合・修正完了 2026-03-12）
- **プロジェクト場所**: `/Users/alfa/Desktop/encore-ui`

---

## デザイントークン

### カラー
| トークン | 値 | 用途 |
|---------|-----|------|
| `bg` | `#F2F0EB` | メイン背景 |
| `bg-section` | `#E8E5DF` | セクション背景 / グレー行 |
| `bg-card` | `#EDEAE4` | カード背景 |
| `green` | `#1B3C2D` | プライマリカラー（ボタン・テキスト） |
| `green-muted` | `#8BA898` | 無効状態 |
| `amber` | `#C08A4A` | アクセント（リンク・CTA） |
| `amber-light` | `#D4A060` | アンバーの明るいバリアント |
| `text-primary` | `#1B3C2D` | メインテキスト |
| `text-sub` | `#6B6B6B` | サブテキスト |
| `text-muted` | `#AEAAA3` | 薄いテキスト・プレースホルダー |
| `border` | `#D8D4CD` | ボーダー・区切り線 |
| `error` | `#C0392B` | エラーカラー |

### 角丸
| トークン | 値 |
|---------|-----|
| `radius-sm` | `8px` |
| `radius-md` | `12px` |
| `radius-lg` | `16px` |
| `radius-pill` | `999px` |

### フォント
- **日本語**: `"Hiragino Sans", "Yu Gothic", "Noto Sans JP", sans-serif`
- **英語**: `"Helvetica Neue", Arial, sans-serif`

### シャドウ
- `shadow-card`: `0 2px 8px rgba(0,0,0,0.07)`
- `shadow-phone`: `0 28px 80px rgba(0,0,0,0.28), 0 0 0 2px #1a1a1a`

---

## コンポーネント一覧（25個）

| # | コンポーネント | ファイル |
|---|-------------|---------|
| 00 | Splash Screen | `SplashScreen.tsx` |
| 01 | Color Palette | `ColorPalette.tsx` |
| 02 | Typography | `Typography.tsx` |
| 03 | Buttons | `Button.tsx` |
| 04 | Nav Header | `NavHeader.tsx` |
| 05 | Tab Bar | `TabBar.tsx` |
| 06 | Horizontal Tabs | `HorizontalTabs.tsx` |
| 07 | List Rows | `ListRow.tsx` |
| 08 | Input Fields | `InputField.tsx` |
| 09 | Product Cards | `ProductCard.tsx` |
| 10 | Ingredient Selector | `IngredientSelector.tsx` |
| 11 | Segmented Control | `SegmentedControl.tsx` |
| 12 | Search Bar | `SearchBar.tsx` |
| 13 | Store Card | `StoreCard.tsx` |
| 14 | Order Summary | `OrderSummary.tsx` |
| 15 | Empty State | `EmptyState.tsx` |
| 16 | Badges & Tags | `Badge.tsx` |
| 17 | Rank Progress | `RankProgress.tsx` |
| 18 | Bottom Sheet | `BottomSheet.tsx` |
| 19 | Notification Banner | `Notification.tsx` |
| 20 | Toggle Switch | `Toggle.tsx` |
| 21 | Credit Card UI | `CreditCard.tsx` |
| 22 | Qty Stepper | `QuantityStepper.tsx` |
| 23 | Tooltip Bubble | `TooltipBubble.tsx` |
| 24 | Calendar | `Calendar.tsx` |

---

## コンポーネント設計ルール

### Button
- **バリアント**: `primary` / `secondary` / `ghost` / `disabled` / `sm-primary` / `sm-ghost` / `sm-secondary`
- `secondary` / `sm-secondary` のボーダーは Tailwind クラスではなく **インラインスタイル**で指定（specificity 問題）
- `sm-*` は `w-auto`（full-width にならない）
- リップルエフェクト: `.encore-ripple` クラスを動的生成

### CSS クラス命名（globals.css）
- プレフィックス: `.encore-*`
- 主要クラス: `.encore-ripple`, `.encore-tab-active`, `.encore-tab-strip`, `.encore-bottom-sheet-panel`, `.encore-notification`, `.encore-toggle-knob`, `.encore-badge-pop`, `.encore-cal-pop`, `.encore-stepper-val`, `.encore-tooltip-tail-*`, `.encore-week-strip`, `.encore-sidebar`
- `.encore-tab-strip`: HorizontalTabs のタブ行。`overflow-x:auto` + `overflow-y:hidden` + スクロールバー非表示

### アニメーション
- `ripple-out`: ボタンリップル
- `badge-pop`: バッジ出現
- `cal-pop`: カレンダーセル選択
- `tab-slide-in`: タブ下線
- `stepper-change`: ステッパー数値変化

---

## 実装上の注意点

### CSS vs インラインスタイル
- **同一プロパティは混在させない**（hover系はTailwindクラス、それ以外はインライン）
- Tailwind hover/transition はクラスで指定、インラインスタイルで同プロパティを上書きしない

### マージンコラプス対策
- `padding-top: 0` の親に `margin-top` の子を置くとコラプスが起きる
- Bottom Sheet のドラッグハンドルは `flex justify-center` + `padding` で対応

### flex column 内のボタン幅
- flex column コンテナ内では `align-self: stretch` がデフォルト
- `sm-*` ボタンが全幅になる場合は wrapper に `alignSelf: 'flex-start'` を指定

### 角丸の二重適用防止
- page.tsx 側で `borderRadius + overflow:hidden` を持つ wrapper があるとき、子コンポーネント自身にも同じ指定があると二重角丸になる
- OrderSummary など「フレームに収まるコンポーネント」は自身で borderRadius を持たない

---

## ファイル構成
```
encore-ui/
├── src/
│   ├── app/
│   │   ├── page.tsx        # メインショーケースページ（'use client'）
│   │   └── globals.css     # Tailwind v4 @theme + カスタムCSS
│   └── components/
│       └── encore/         # 25個のコンポーネント
└── design.md               # このファイル
```

---

## コンポーネント修正メモ（2026-03-12 完了）

### 修正済み内容
- **HorizontalTabs**: スクロールバー非表示（`.encore-tab-strip`）、縦スクロール時のぶれ修正
- **NavHeader**: close/back バリアント時にタイトル左右 52px パディング追加（アイコン重なり防止）
- **Notification**: アイコン〜テキスト間隔を `gap-3.5` に拡大
- **CreditCard**: `first4` → `cardNumber` prop に変更。16桁を `#### #### #### ####` 形式で表示
- **QuantityStepper (S22)**: page.tsx をリスト形式（ソルト/ブラックペッパー/ホットソース）に変更
- **TooltipBubble (S23)**: `chat-left` / `chat-right` バリアント追加。page.tsx を HTML 通り3バリアントに整理
- **Calendar (S24)**:
  - ReservationCalendar: NavHeader 追加、タイムスロット12個（unavailable: 11:00/11:30/14:00/16:30）、「この日時で予約する」`Button` コンポーネント追加
  - WeekStrip: NavHeader（「注文履歴」）追加、選択日ラベル追加（選択時 `#1B3C2D`・未選択時 `#AEAAA3`）

## 今後の作業
- ブランド名「ENCORE」は仮名 → 確定後に全置換が必要
