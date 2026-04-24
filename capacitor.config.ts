import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Grape — Capacitor 設定
 *
 * ビルド手順:
 *   1. CAPACITOR_BUILD=1 npm run build       # Next.js 静的書き出し → out/
 *   2. npx cap sync ios                       # out/ を iOS プロジェクトに反映
 *   3. npx cap open ios                       # Xcode で開いてビルド・配信
 */
const config: CapacitorConfig = {
  appId: 'jp.karabina.grape',
  appName: 'Grape',
  webDir: 'out',
  ios: {
    // ステータスバー背後まで WebView を広げる（safe-area-inset を Web 側で制御済み）
    contentInset: 'never',
    // 背景色: Grape のアプリ背景 #FAFAF7 に合わせる（起動時のチラつき防止）
    backgroundColor: '#FAFAF7',
  },
  android: {
    // Android 側は後日 `npx cap add android` 時に詳細設定
    backgroundColor: '#FAFAF7',
  },
}

export default config
