/**
 * LP用・スマホネイティブ幅スクリーンショット撮影スクリプト
 *
 * 事前に dev server が http://localhost:3000 で立ち上がっていること
 *
 * 使い方:
 *   node scripts/capture-lp-mobile.js
 *
 * 出力先: public/screenshots/lp-mobile/
 * ビューポート: 393×932 (iPhone 16 Pro Max 相当の縦長比) @ DPR 2 → 786×1864 PNG
 *
 * capture-lp.js との違い:
 *   - 幅 786px 要件（LP に等倍で載せやすい）
 *   - 高さは iPhone 16 Pro Max 相当で縦長
 *   - Next.js dev indicator は CSS で非表示化
 *   - setlist は含めない（未実装のため、LP 公開後のアップデートで追加予定）
 */

const VIEWPORT_WIDTH  = 393
const VIEWPORT_HEIGHT = 932

const { chromium, devices } = require('playwright')
const path = require('path')

const BASE = 'http://localhost:3000'
const OUT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'lp-mobile')

// ── 撮影対象（LPでの登場順を想定） ──────────────────────────────────────

const SHOTS = [
  // 01: Artist Detail — 正方形写真・最上部まで到達・感情的ヒーロー
  {
    name: '01-artist-hero-koharu',
    url: '/grape/artist/koharu',
    setup: async (page) => {
      await setupPremium(page)
      await page.reload({ waitUntil: 'networkidle' })
    },
    wait: 1400,
  },

  // 02: Calendar Month — 期限マーカー(Style B)が見える状態
  {
    name: '02-calendar-month-urgency',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await injectUrgencyDemoData(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '月'))
      await page.reload({ waitUntil: 'networkidle' })
    },
    wait: 1400,
  },

  // 03: Calendar Day — イベントブロック表示（drag-to-create のゴーストは動的なので省略）
  {
    name: '03-calendar-day-event',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '日'))
      await page.reload({ waitUntil: 'networkidle' })
      // 今日(4/22) → 3日進めて 4/25 (PHAROS FES の日)
      await clickNextDay(page, 3)
    },
    wait: 1000,
  },

  // 04: EventPreviewScreen — Urgency Banner + 複数アーティスト + 価格
  {
    name: '04-event-preview-pharos',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await injectUrgencyDemoData(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '日'))
      await page.reload({ waitUntil: 'networkidle' })
      // 4/25 まで進めてイベントをタップ
      await clickNextDay(page, 3)
      await page.waitForTimeout(500)
      await clickEventBlock(page)
    },
    wait: 1200,
  },

  // 05: QuickEventSheet — ヘッダチップ + チケット defaultOpen
  {
    name: '05-quickevent-edit-pharos',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '日'))
      await page.reload({ waitUntil: 'networkidle' })
      await clickNextDay(page, 3)
      await page.waitForTimeout(500)
      await clickEventBlock(page)
      await page.waitForTimeout(500)
      // 編集ボタン（鉛筆アイコン）をタップ
      await page.evaluate(() => {
        const btn = document.querySelector('button[title="編集"]')
        btn && btn.click()
      })
    },
    wait: 1500,
  },

  // 06: Report / Artists — ArtistStackChart + ランキング
  {
    name: '06-report-artists-stackchart',
    url: '/grape/report',
    setup: async (page) => {
      await setupPremium(page)
      await page.reload({ waitUntil: 'networkidle' })
      // ArtistStackChart が見える位置までスクロール
      await page.evaluate(() => {
        const sc = Array.from(document.querySelectorAll('div')).find(d => {
          const s = getComputedStyle(d)
          return (s.overflowY === 'auto' || s.overflowY === 'scroll') && d.scrollHeight > d.clientHeight
        })
        if (sc) sc.scrollTop = 420
      })
    },
    wait: 1000,
  },

  // 07: ListView · 週次合算チップ（開催予定タブ・未来の週）
  {
    name: '07-listview-week-upcoming',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', 'リスト'))
      await page.reload({ waitUntil: 'networkidle' })
      // デフォルトで 開催予定 タブが選択されているので追加操作不要
      // 今週（4/20〜4/26）のチップが先頭あたりに出るはず
      await page.evaluate(() => {
        // 今週チップを最上部に
        const chips = Array.from(document.querySelectorAll('div')).filter(
          (d) => d.style.borderRadius === '999px' && d.textContent?.includes('今週')
        )
        chips[0]?.scrollIntoView({ block: 'start' })
      })
    },
    wait: 900,
  },

  // 08: Tickets — 3つのタブ + 申込中バッジ
  {
    name: '08-tickets-list',
    url: '/grape/tickets',
    setup: async (page) => {
      await setupPremium(page)
      await page.reload({ waitUntil: 'networkidle' })
    },
    wait: 1000,
  },

  // 09: AddActionSheet — + FAB 展開後（Premium 限定の URL取り込み導線）
  {
    name: '09-add-action-sheet',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await page.evaluate(() => localStorage.setItem('grape-calendar-view', '月'))
      await page.reload({ waitUntil: 'networkidle' })
      // + FAB をクリック
      await page.evaluate(() => {
        const fabs = Array.from(document.querySelectorAll('button')).filter((b) => {
          const r = b.getBoundingClientRect()
          return r.width === 52 && r.height === 52
        })
        fabs[0] && fabs[0].click()
      })
    },
    wait: 900,
  },

  // 10: URLImportSheet — URL から自動取り込みの画面
  {
    name: '10-url-import-sheet',
    url: '/grape/calendar',
    setup: async (page) => {
      await setupPremium(page)
      await page.reload({ waitUntil: 'networkidle' })
      // + FAB → AddActionSheet の「URLから取り込む」をタップ
      await page.evaluate(() => {
        const fabs = Array.from(document.querySelectorAll('button')).filter((b) => {
          const r = b.getBoundingClientRect()
          return r.width === 52 && r.height === 52
        })
        fabs[0] && fabs[0].click()
      })
      await page.waitForTimeout(400)
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find((b) =>
          b.textContent?.includes('URLから取り込む') || b.textContent?.includes('URL')
        )
        btn && btn.click()
      })
    },
    wait: 1100,
  },
]

// ── ヘルパー ─────────────────────────────────────────────────────────────

/** Premium フラグを有効化 */
async function setupPremium(page) {
  await page.evaluate(() => {
    localStorage.setItem('grape-is-premium', 'true')
  })
}

/** 期限マーカー用の近日デモデータを注入
 *   PHAROS FES 2026: ticketDeadline = 4/24 (danger / 2日先)
 *   LIGHTS CIRCUIT 2026: waiting + announcementDate = 4/26 (warn / 4日先)
 */
async function injectUrgencyDemoData(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('grape_lives_v1')
    if (!raw) return
    const lives = JSON.parse(raw)
    const pharos = lives.find((l) => l.title === 'PHAROS FES 2026')
    if (pharos) {
      pharos.ticketDeadline = '2026-04-24'
    }
    const lights = lives.find((l) => l.title && l.title.includes('LIGHTS CIRCUIT'))
    if (lights) {
      lights.ticketStatus = 'waiting'
      lights.announcementDate = '2026-04-26'
    }
    localStorage.setItem('grape_lives_v1', JSON.stringify(lives))
  })
}

/** Day view で次の日ボタンを N 回クリック */
async function clickNextDay(page, n) {
  for (let i = 0; i < n; i++) {
    await page.evaluate(() => {
      const svgs = Array.from(document.querySelectorAll('svg'))
      const nextCaret = svgs.find((s) => {
        const r = s.getBoundingClientRect()
        return r.x > 320 && r.y < 250 && r.y > 120
      })
      const btn = nextCaret && nextCaret.closest('button')
      btn && btn.click()
    })
    await page.waitForTimeout(250)
  }
  await page.waitForTimeout(350)
}

/** Day view のイベントブロックをクリック（PointerEvent 直接ディスパッチで
 *  EventPreviewScreen を開く） */
async function clickEventBlock(page) {
  await page.evaluate(() => {
    const block = document.querySelector('[data-event-block="true"]')
    if (!block) return
    const r = block.getBoundingClientRect()
    const cx = r.x + r.width / 2
    const cy = r.y + 30
    const common = {
      pointerId: 1, pointerType: 'mouse', isPrimary: true,
      button: 0, bubbles: true, cancelable: true, composed: true,
    }
    block.dispatchEvent(new PointerEvent('pointerdown', { ...common, buttons: 1, clientX: cx, clientY: cy }))
    block.dispatchEvent(new PointerEvent('pointerup', { ...common, buttons: 0, clientX: cx, clientY: cy }))
    block.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, clientX: cx, clientY: cy }))
  })
  await page.waitForTimeout(400)
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

/** 注入したデモデータを元に戻す */
async function restoreDemoData(page) {
  await page.evaluate(() => {
    const raw = localStorage.getItem('grape_lives_v1')
    if (!raw) return
    const lives = JSON.parse(raw)
    const pharos = lives.find((l) => l.title === 'PHAROS FES 2026')
    if (pharos) pharos.ticketDeadline = '2026-04-30'
    const lights = lives.find((l) => l.title && l.title.includes('LIGHTS CIRCUIT'))
    if (lights) {
      lights.ticketStatus = 'before-sale'
      lights.announcementDate = '2026-04-10'
    }
    localStorage.setItem('grape_lives_v1', JSON.stringify(lives))
  })
}

// ── main ─────────────────────────────────────────────────────────────────

async function main() {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: false,   // マウスベースのイベント互換性のため
    hasTouch: false,   // テキスト選択干渉を避ける
    colorScheme: 'light',
  })
  const page = await context.newPage()

  console.log(`📸 Capturing ${SHOTS.length} LP mobile screens (${VIEWPORT_WIDTH * 2}×${VIEWPORT_HEIGHT * 2} @ 2x DPR)`)
  console.log(`   → ${OUT_DIR}`)
  console.log('')

  for (const shot of SHOTS) {
    const filepath = path.join(OUT_DIR, `${shot.name}.png`)
    process.stdout.write(`  ${shot.name.padEnd(34)} ... `)
    try {
      await page.goto(`${BASE}${shot.url}`, { waitUntil: 'networkidle' })
      if (shot.setup) await shot.setup(page)
      await page.waitForTimeout(shot.wait ?? 800)
      await removePhoneFrame(page)
      // Next.js dev indicator / ルートアナウンサーを非表示（LP に残らないように）
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
      await page.waitForTimeout(100)
      await page.screenshot({ path: filepath, type: 'png', fullPage: false })
      console.log('✅')
    } catch (err) {
      console.log(`❌ ${err.message}`)
    }
  }

  // 最後にデモデータを復元
  try { await restoreDemoData(page) } catch {}

  await browser.close()
  console.log('')
  console.log(`✨ Done! Files saved to: ${path.relative(process.cwd(), OUT_DIR)}`)
  console.log(`   (Native 393×852 viewport with DPR 2 → 786×1704 PNG)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
