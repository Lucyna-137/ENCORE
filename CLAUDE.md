# ENCORE UI Kit — Claude 作業指示書

## プロジェクト概要
- Next.js + TypeScript + Tailwind CSS v4 のコンポーネントショーケース（32コンポーネント）
- **プロジェクト場所**: `/Users/alfa/Desktop/ENCORE`
- ライブ管理アプリ向けのデザインシステム
- ブランド名「ENCORE」は仮名（確定後に全置換）
- 最終目的: SwiftUI/Xcode での再実装リファレンス

## よく使うコマンド
- 開発サーバー: `npm run dev`（ポート3000）
- 他デバイスから見る: `npm run dev -- --hostname 0.0.0.0`
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
    └── encore/           # 32個のコンポーネント (.tsx)
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

## デモコンテンツ方針
- 全てライブ管理アプリのコンテキスト（食べ物・サラダ系テキストは廃止済み）
- アーティスト名・ライブ会場・チケット情報などを使用

## ブランド名変更のメモ
- 元々「CRISP」→「ENCORE」に一括置換済み（2026-03-12）
- ブランド名が再度変わる場合: プロジェクト内の `encore`/`ENCORE`/`Encore` を新名称に一括置換
