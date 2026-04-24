/**
 * Capacitor (iOS/Android) 用のエントリ HTML を作る後処理スクリプト
 *
 * 背景:
 *   Next.js のルート `/` はコンポーネントショーケース（開発リファレンス）なので、
 *   Capacitor で WebView に読み込まれた時は Grape アプリ本体 `/grape/` に飛ばしたい。
 *
 * 動作:
 *   - out/index.html をショーケースの内容から、/grape/ への即時リダイレクトに差し替え
 *   - 元のショーケースは out/showcase.html に退避（万が一 iOS でも参照したい時用）
 *
 * 呼び出し:
 *   `CAPACITOR_BUILD=1 next build` の直後に実行される（package.json の build:capacitor）
 */
import { writeFileSync, renameSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const outDir = resolve(process.cwd(), 'out')
const indexHtml = resolve(outDir, 'index.html')
const showcaseHtml = resolve(outDir, 'showcase.html')

if (!existsSync(indexHtml)) {
  console.error(`[make-ios-entry] ${indexHtml} が存在しません。先に next build を実行してください。`)
  process.exit(1)
}

// 元の index.html を showcase.html に退避（既に退避済みなら上書きスキップ）
if (!existsSync(showcaseHtml)) {
  renameSync(indexHtml, showcaseHtml)
  console.log('[make-ios-entry] out/index.html → out/showcase.html に退避')
} else {
  console.log('[make-ios-entry] out/showcase.html 既存のため、リダイレクト HTML で上書きのみ行います')
}

const redirectHtml = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<title>Grape</title>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover">
<meta http-equiv="refresh" content="0; url=./grape/index.html">
<script>window.location.replace('./grape/index.html')</script>
<style>
html, body {
  margin: 0;
  height: 100%;
  background: #FAFAF7;
}
</style>
</head>
<body></body>
</html>
`

writeFileSync(indexHtml, redirectHtml, 'utf8')
console.log('[make-ios-entry] out/index.html を /grape/ へのリダイレクトに差し替え完了')
