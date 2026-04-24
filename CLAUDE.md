# ENCORE UI Kit — Claude 作業指示書

## プロジェクト概要
- Next.js + TypeScript + Tailwind CSS v4 のコンポーネントショーケース（34コンポーネント、00〜33番）
- **プロジェクト場所**: `/Users/uchiki/Desktop/ENCORE`
- ライブ管理アプリ向けのデザインシステム
- ブランド名「ENCORE」は仮名（確定後に全置換）
- 最終目的: SwiftUI/Xcode での再実装リファレンス

## よく使うコマンド
- 開発サーバー: `npm run dev`（ポート3000）
- 他デバイスから見る: `npm run dev -- --hostname 0.0.0.0`
- ビルド確認: `npm run build`
- 型チェック: `npx tsc --noEmit`
- リント: `npm run lint`
- 開発サーバー起動前は必ず `npm install` を実行

## 技術スタック
- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS v4**
- Tailwind v4 は CSS-first: `tailwind.config.ts` なし、`globals.css` の `@theme` ブロックでトークン定義
- `'use client'` ディレクティブ: useState/useEffect を使うコンポーネント全てに必須

## ファイル構成
```
src/
├── app/
│   ├── page.tsx              # メインショーケース（'use client'、全コンポーネント展示）※変更禁止
│   ├── globals.css           # Tailwind @theme + .encore-* カスタムクラス
│   └── grape/
│       ├── layout.tsx        # Grape パススルーレイアウト
│       ├── calendar/page.tsx # カレンダー（月/週/日/リスト）
│       └── tickets/page.tsx  # チケット管理
├── components/
│   ├── encore/               # 34個のコンポーネント (.tsx)
│   └── grape/                # Grape 専用コンポーネント群
└── lib/
    └── grape/
        ├── types.ts          # GrapeLive / GrapeArtist 型定義
        └── dummyData.ts      # ARTISTS / LIVES データ（20件）
```

## デザイントークン（クイックリファレンス）
詳細は `design.md` を参照。よく使う値：
- グリーン（プライマリ）: `#1A3A2D` / `var(--color-encore-green)`
- ボーダー（グレー背景上）: `var(--color-encore-border)`
- ボーダー（白背景上）: `var(--color-encore-border-light)`

## フォント方針
- フォントスタック: `var(--font-google-sans), var(--font-noto-jp), sans-serif`（Google Sansを必ず先頭に）
- フォントウェイトは **700と400の2種類のみ**（600・500・300は使用しない）
- テキスト色は全て `#1A3A2D` ベース（透明度で階層表現）

## コンポーネント修正の進め方
1. React 版 (`src/components/encore/*.tsx`) を Read で確認
2. `src/app/page.tsx` の該当 SectionBlock を確認
3. 差分を特定して修正

## 既知のパターン・落とし穴

### CSS specificity
- `secondary` / `sm-secondary` / `xs-secondary` ボタンのボーダーはインラインスタイルで指定（Tailwind クラスは負ける）
- hover 系プロパティは Tailwind クラスで指定し、インラインスタイルと混在させない

### HorizontalTabs のオーバーフロー
- `overflow-y: hidden` を付けるとスライドインジケーターがクリップされる
- `.encore-tab-strip` は `overflow-x: auto` のみ（Y方向は指定しない）

### InputField のカウンター配置（バグ注意）
- カウンターはボーダー div の**外**（下）に置く
- 内側に入れると `items-end` でアイコンがカウンター位置まで下がるバグが発生する

### マージンコラプス
- `padding-top:0` の親 + `margin-top` の子 → コラプス発生
- Bottom Sheet ドラッグハンドルは `flex justify-center + padding` で対応済み

### flex column でのボタン幅
- `sm-*` / `xs-*` ボタンが全幅になる場合は wrapper に `alignSelf:'flex-start'`

### 角丸の二重適用
- page.tsx のフレーム wrapper が `borderRadius + overflow:hidden` を持つとき、子コンポーネントも同じ指定があると二重角丸
- フレーム内に収まるコンポーネントは自身で borderRadius を持たない

### NavHeader タイトルの overlap
- `variant="close"` や `variant="back"` のとき、タイトルが長いとアイコンと被る
- タイトル `<span>` に `paddingLeft/paddingRight: 52` を追加済み（variant !== 'title-only' のとき）

## CSS クラス名（globals.css）
グローバル CSS クラスは全て `.encore-*` プレフィックス:

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
| `.encore-float` | PieChart アバター浮遊アニメ（3s ease-in-out infinite） |

## 画面確認
- スクリーンショットは「確認して」と指示されたときのみ `webdev-mcp > takeScreenshot` を使う

## Typographyルール（全コンポーネント共通・2026-04-24 偶数統一）
| スタイル名 | サイズ | ウェイト | フォント | 用途 |
|-----------|--------|---------|---------|------|
| Display | 32px | 700 | EN | ランク名など大見出し |
| Title | 24px | 700 | EN | セクション大見出し |
| Heading | 18px | 700 | JA | モーダルタイトルなど |
| Section | 16px | 700 | JA | カード・セクション見出し |
| Section SM | 14px | 700 | JA | サブ見出し |
| Body | 14px | 400 | JA | 本文 |
| Body SM / Sub | 12px | 400 | JA | 補足テキスト |
| Price | 16px | 700 | EN | 金額表示 |
| Link | 14px | 400 | JA | amber色リンク |
| Caption | 12px | 400 | EN | 注釈・ラベル |
| Caption Muted | 12px | 400 | EN | 薄い注釈 |

※ 偶数統一（2 の倍数）。使用サイズは 8/10/12/14/16/18/20/22/24/26/28/30/32/34/40/52/56/76/88 の 19 種。
※ iPhone 実機の視認性向上のため、すべての奇数 fontSize（11/13/15/17/19）を +1 偶数に統合済み。

- EN = `var(--font-google-sans), sans-serif`
- JA = `var(--font-google-sans), var(--font-noto-jp), sans-serif`
- fontWeightは700と400のみ
- `--color-encore-text-sub` は rgba(26,58,45,0.55) で薄め。普通のテキストは `--color-encore-green` を使う

## デザインシステム確定事項
- **角丸**: 全コンポーネント背景は `borderRadius: 8`（カード・モーダル等）
- **ドロップシャドウ**: コンポーネント背景への `boxShadow: var(--shadow-card)` は使用しない
- **シェブロン色**: `CaretRight` / `CaretDown` は全て `var(--color-encore-green)`（Primary）
- **スクワークル形状**: k=0.72（ArtistCard/OrderSummary等）、k=0.65（ColorPicker/LiveCard）
- **アイコン**: Phosphor Icons（`@phosphor-icons/react`）、`weight="light"` 統一

## Live Card仕様
- `liveType`: ワンマン / 対バン / フェス / 配信 / 舞台・公演 / メディア出演 / リリースイベント
- `liveStatus`: 予定 / 抽選中 / 当選 / 落選 / 終了
  - 表示ラベル: 抽選中→チケット抽選中、当選→チケット当選、落選→チケット落選
  - 終了のバッジはカード内で非表示
- バッジ順: Live Status → Live Type（左から）
- 複数アーティスト: `artistImages: string[]` で重なりアバター表示（28px, -8px overlap）

## 静的アセット
- ライブフライヤー: `/public/liveimg/` (01.jpeg, 02.jpg, 03.jpeg.webp, 04.jpeg)
- アーティスト画像: `/public/Artistimg/` (01〜04.jpg)
- 会場画像: `/public/Houseimg/unnamed.webp`
- **Grape アーティスト画像**: `/public/grape/artist/` (somei.JPG / シユイ.JPG / 優利香.JPG / Ado.JPG / スーパー登山部.JPG / yama.JPG)
- **Grape カバー画像**: `/public/grape/cover/` (各イベントフライヤー、詳細は MEMORY.md 参照)

## InputField — controlledモード対応
- `value` + `onChange` propsでcontrolled inputとして使用可能（2026-03-13追加）
- フォーカスアニメーション（グリーンアンダーライン）はcontrolledでも動作する

## HorizontalTabs — ReactNode対応
- `tabs` プロップは `(string | React.ReactNode)[]` に拡張済み
- Phosphorアイコン入りタブラベルを使用可能

## デモコンテンツ方針
- 全てライブ管理アプリのコンテキスト（食べ物・サラダ系テキストは廃止済み）
- アーティスト名・ライブ会場・チケット情報などを使用

## ブランド名変更のメモ
- 元々「CRISP」→「ENCORE」に一括置換済み（2026-03-12）
- ブランド名が再度変わる場合: プロジェクト内の `encore`/`ENCORE`/`Encore` を新名称に一括置換
