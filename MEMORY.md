# ENCORE UI Kit — セッション記憶

## プロジェクト場所
- **作業ディレクトリ**: `/Users/alfa/Desktop/encore-ui`
- **開発サーバー**: http://localhost:3000
- **HTML リファレンス**: 削除済み（全コンポーネント照合完了 2026-03-12）

## 重要なコンテキスト
- 元々「CRISP SALAD WORKS」アプリのデザインシステム
- 「CRISP」→「ENCORE」に全リネーム済み（ブランド名は仮）
- 25個のコンポーネントを Next.js/TSX で実装したショーケース
- 最終目的: SwiftUI/Xcode での再実装リファレンス

## ファイル構成
- `src/app/page.tsx` — 全コンポーネントを展示するメインページ
- `src/app/globals.css` — Tailwind v4 @theme + `.encore-*` カスタムCSSクラス
- `src/components/encore/*.tsx` — 25個のコンポーネント

## 詳細ドキュメント
- `/Users/alfa/Desktop/encore-ui/design.md` — デザイントークン・実装ルール・修正メモ詳細
- `/Users/alfa/Desktop/encore-ui/CLAUDE.md` — プロジェクト固有の作業指示

## 全コンポーネントステータス（HTML照合完了）
- S00〜S21: 修正済み（Button, NavHeader, CreditCard 等）
- S22 Qty Stepper: リスト形式に修正済み
- S23 Tooltip Bubble: chat-left/chat-right バリアント追加・修正済み
- S24 Calendar: ReservationCalendar・WeekStrip を HTML に合わせて修正済み
