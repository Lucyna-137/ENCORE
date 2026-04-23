/**
 * Report 画面を 3 分割して撮影（LP のスクロールアニメ用素材）
 *
 * 出力: public/screenshots/lp-mobile/
 *   - report-top-fixed.png     — ステータスバー + Title + 期間タブ（固定ヘッダ）
 *   - report-scroll-full.png   — flex:1 overflow:auto の中身を全高展開して撮影
 *   - report-bottom-fixed.png  — TabBar（CALENDAR / TICKETS / REPORT / SETTINGS）
 *
 * 使い方:
 *   node scripts/capture-lp-report-parts.js
 *
 * 事前に dev server が http://localhost:3000 で立ち上がっていること
 *
 * 仕組み:
 *   1. /grape/report を 393×932 @ 2x DPR で描画
 *   2. スクロール要素（overflowY: auto）と TabBar（最後の flexShrink:0 div）を特定
 *   3. 通常状態で上下の固定領域をクリップ撮影
 *   4. スクロール要素を `height: scrollHeight + overflow: visible` に書き換えて
 *      フレームを全高展開 → その element を element.screenshot()
 */

const VIEWPORT_WIDTH  = 393
const VIEWPORT_HEIGHT = 932

const { chromium } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'lp-mobile')

async function setupPremium(page) {
  await page.evaluate(() => {
    localStorage.setItem('grape-is-premium', 'true')
  })
}

/** スマホ枠（borderRadius 44 + shadow + 外周余白）を除去 */
async function removePhoneFrame(page) {
  await page.evaluate(() => {
    const allDivs = Array.from(document.querySelectorAll('div'))
    allDivs.forEach((el) => {
      const cs = getComputedStyle(el)
      if (cs.borderTopLeftRadius === '44px') {
        el.style.borderRadius = '0'
        el.style.boxShadow = 'none'
        let parent = el.parentElement
        for (let i = 0; i < 3 && parent; i++) {
          parent.style.padding = '0'
          parent.style.margin = '0'
          parent.style.background = 'var(--color-encore-bg)'
          parent.style.alignItems = 'flex-start'
          parent.style.minHeight = '0'
          parent = parent.parentElement
        }
      }
    })
    document.body.style.background = 'var(--color-encore-bg)'
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.documentElement.style.background = 'var(--color-encore-bg)'
    document.documentElement.style.margin = '0'
    document.documentElement.style.padding = '0'
  })
  await page.waitForTimeout(200)
}

async function hideDevIndicator(page) {
  await page.addStyleTag({ content: `
    nextjs-portal, next-route-announcer,
    [data-nextjs-toast], [data-nextjs-dev-tools-button],
    [data-nextjs-dialog-overlay], [data-nextjs-scroll-focus-boundary] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  ` })
}

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: false,
    hasTouch: false,
    colorScheme: 'light',
  })
  const page = await context.newPage()

  console.log(`📸 Capturing Report page parts (${VIEWPORT_WIDTH * 2}×? @ 2x DPR)`)
  console.log(`   → ${OUT_DIR}`)
  console.log('')

  await page.goto(`${BASE}/grape/report`, { waitUntil: 'networkidle' })
  await setupPremium(page)
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await removePhoneFrame(page)
  await hideDevIndicator(page)
  await page.waitForTimeout(300)

  // スクロール要素と TabBar を特定＆タグ付け
  const regions = await page.evaluate(() => {
    const scrollEl = Array.from(document.querySelectorAll('div')).find(d => {
      const s = getComputedStyle(d)
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && d.scrollHeight > d.clientHeight
    })
    if (!scrollEl) return null
    scrollEl.setAttribute('data-capture-scroll', 'true')

    // TabBar = スクロール要素の次の兄弟 div（height: 68px, flexShrink: 0）
    const tabBar = scrollEl.nextElementSibling
    if (tabBar) tabBar.setAttribute('data-capture-tabbar', 'true')

    const sr = scrollEl.getBoundingClientRect()
    const tr = tabBar ? tabBar.getBoundingClientRect() : null
    return {
      scroll: {
        top: Math.round(sr.top),
        bottom: Math.round(sr.bottom),
        height: Math.round(sr.height),
        scrollHeight: scrollEl.scrollHeight,
      },
      tabBar: tr ? {
        top: Math.round(tr.top),
        bottom: Math.round(tr.bottom),
        height: Math.round(tr.height),
      } : null,
    }
  })

  if (!regions) {
    console.error('❌ scroll container not found')
    await browser.close()
    process.exit(1)
  }

  console.log(`  scroll area : top=${regions.scroll.top} bottom=${regions.scroll.bottom} clientH=${regions.scroll.height} scrollH=${regions.scroll.scrollHeight}`)
  console.log(`  tab bar     : ${regions.tabBar ? `top=${regions.tabBar.top} bottom=${regions.tabBar.bottom} h=${regions.tabBar.height}` : 'N/A'}`)
  console.log('')

  // ─── 1. 上部固定エリア ───────────────────────────
  const topPath = path.join(OUT_DIR, 'report-top-fixed.png')
  process.stdout.write('  report-top-fixed         ... ')
  await page.screenshot({
    path: topPath,
    clip: { x: 0, y: 0, width: VIEWPORT_WIDTH, height: regions.scroll.top },
  })
  console.log('✅')

  // ─── 2. 下部固定エリア（TabBar）───────────────────
  if (regions.tabBar) {
    const bottomPath = path.join(OUT_DIR, 'report-bottom-fixed.png')
    process.stdout.write('  report-bottom-fixed      ... ')
    await page.screenshot({
      path: bottomPath,
      clip: {
        x: 0,
        y: regions.tabBar.top,
        width: VIEWPORT_WIDTH,
        height: regions.tabBar.height,
      },
    })
    console.log('✅')
  }

  // ─── 3. スクロール全長 ─────────────────────────
  // スクロール要素を全高展開して element.screenshot
  process.stdout.write('  report-scroll-full       ... ')
  const scrollFullHeight = await page.evaluate(() => {
    const scrollEl = document.querySelector('[data-capture-scroll="true"]')
    if (!scrollEl) return 0

    // 全高展開
    scrollEl.style.overflow = 'visible'
    scrollEl.style.height = scrollEl.scrollHeight + 'px'
    scrollEl.style.maxHeight = 'none'
    scrollEl.style.flex = 'none'

    // 親（PhoneFrame 内）の高さ制約も緩める
    const frame = document.querySelector('.grape-phone-frame')
    if (frame) {
      frame.style.height = 'auto'
      frame.style.maxHeight = 'none'
      frame.style.minHeight = '0'
    }
    const outer = document.querySelector('.grape-outer')
    if (outer) {
      outer.style.height = 'auto'
      outer.style.maxHeight = 'none'
      outer.style.minHeight = '0'
    }
    document.body.style.height = 'auto'
    document.body.style.minHeight = '0'
    document.documentElement.style.height = 'auto'
    document.documentElement.style.minHeight = '0'

    return scrollEl.scrollHeight
  })

  // 展開後のレイアウト反映を待つ
  await page.waitForTimeout(500)

  // viewport を全高に合わせて再設定（Playwright のクリップが効くように）
  await page.setViewportSize({ width: VIEWPORT_WIDTH, height: scrollFullHeight + 200 })
  await page.waitForTimeout(300)

  // element を再取得して screenshot
  const scrollEl = await page.$('[data-capture-scroll="true"]')
  if (!scrollEl) {
    console.log('❌ scroll element lost')
  } else {
    await scrollEl.screenshot({
      path: path.join(OUT_DIR, 'report-scroll-full.png'),
      type: 'png',
    })
    console.log(`✅ (${scrollFullHeight}px)`)
  }

  await browser.close()
  console.log('')
  console.log('Done.')
  console.log('')
  console.log('LP での組み合わせ例:')
  console.log('  ┌── report-top-fixed.png ──┐  (sticky top)')
  console.log('  │                          │')
  console.log('  │  report-scroll-full.png  │  (scrolls inside mask)')
  console.log('  │                          │')
  console.log('  └── report-bottom-fixed ──┘  (sticky bottom)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
