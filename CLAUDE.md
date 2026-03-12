# ENCORE UI Kit — Claude 作業指示書

## プロジェクト概要
- Next.js + TypeScript + Tailwind CSS v4 のコンポーネントショーケース
- **プロジェクト場所**: `/Users/alfa/Desktop/encore-ui`
- ブランド名「ENCORE」は仮名（確定後に全置換）
- 最終目的: SwiftUI/Xcode での再実装リファレンス
- HTML リファレンス (`crisp-components.html`) は削除済み（全コンポーネント照合完了）

## よく使うコマンド
- 開発サーバー: `npm run dev`（ポート3000）
- ビルド確認: `npm run build`
- 型チェック: `npx tsc --noEmit`
- 開発サーバー起動前は必ず `npm install` を実行

## 技術スタック
- **Next.js** (App Router) + **TypeScript** + **Tailwind CSS v4**
- Tailwind v4 は CSS-first: `tailwind.config.ts` なし、`globals.css` の `@theme` ブロックでトークン定義
- `'use client'` ディレクティブ: useState/useEffect を使うコンポーネント全てに必須

## ファイル構成
```
src/
├── app/
│   ├── page.tsx          # メインショーケース（'use client'、全コンポーネント展示）
│   └── globals.css       # Tailwind @theme + .encore-* カスタムクラス
└── components/
    └── encore/           # 25個のコンポーネント (.tsx)
```

## デザイントークン（重要カラー）
- 背景: `#F2F0EB`
- グリーン（プライマリ）: `#1B3C2D`
- アンバー（アクセント）: `#C08A4A`
- ボーダー: `#D8D4CD`
- サブテキスト: `#6B6B6B`
- ミュートテキスト: `#AEAAA3`

詳細は `design.md` を参照。

## コンポーネント修正の進め方
1. React 版 (`src/components/encore/*.tsx`) を Read で確認
2. `src/app/page.tsx` の該当 SectionBlock を確認
3. 差分を特定して修正（HTML リファレンスは削除済み・全照合完了）

## 既知のパターン・落とし穴

### CSS specificity
- `secondary` ボタンのボーダーはインラインスタイルで指定（Tailwind クラスは負ける）
- hover 系プロパティは Tailwind クラスで指定し、インラインスタイルと混在させない

### マージンコラプス
- `padding-top:0` の親 + `margin-top` の子 → コラプス発生
- Bottom Sheet ドラッグハンドルは `flex justify-center + padding` で対応済み

### flex column でのボタン幅
- `sm-*` ボタンが全幅になる場合は wrapper に `alignSelf:'flex-start'`

### 角丸の二重適用
- page.tsx のフレーム wrapper が `borderRadius + overflow:hidden` を持つとき、子コンポーネントも同じ指定があると二重角丸
- フレーム内に収まるコンポーネントは自身で borderRadius を持たない

### NavHeader タイトルの overlap
- `variant="close"` や `variant="back"` のとき、タイトルが長いとアイコンと被る
- タイトル `<span>` に `paddingLeft/paddingRight: 52` を追加済み（variant !== 'title-only' のとき）

### CreditCard の props
- `cardNumber`（string）を受け取り、16桁を `#### #### #### ####` 形式で表示
- 旧 `first4` prop は廃止済み

### TooltipBubble のバリアント
- `chat-left`: `borderRadius: '16px 16px 16px 4px'`（左寄せ吹き出し）
- `chat-right`: `borderRadius: '16px 16px 4px 16px'`（右寄せ吹き出し）
- `tail-top` / `tail-left` / `tail-right`: CSS pseudo-element で矢印

## CSSクラス名
グローバルCSS クラスは全て `.encore-*` プレフィックス:
`.encore-ripple`, `.encore-tab-active`, `.encore-tab-strip`, `.encore-bottom-sheet-panel`, `.encore-notification`, `.encore-toggle-knob`, `.encore-badge-pop`, `.encore-cal-pop`, `.encore-stepper-val`, `.encore-tooltip-tail-*`, `.encore-week-strip`, `.encore-sidebar`

### `.encore-tab-strip`（HorizontalTabs用）
- `overflow-x: auto` + `overflow-y: hidden` + `scrollbar-width: none`
- スクロールバー非表示・縦ぶれ防止

## ブランド名変更のメモ
- 元々「CRISP」→「ENCORE」に一括置換済み（2026-03-12）
- ブランド名が再度変わる場合: プロジェクト内の `encore`/`ENCORE`/`Encore` を新名称に一括置換
