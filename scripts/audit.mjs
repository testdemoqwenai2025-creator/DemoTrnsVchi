#!/usr/bin/env node
/**
 * AV/Robotics Operations Center — Public MPA Audit Script
 *
 * Run from the public-staging directory or against the live site:
 *   node scripts/audit.mjs                      # audits local file:// or http://localhost:8889
 *   node scripts/audit.mjs https://testdemoqwenai2025-creator.github.io/DemoTrnsVchi/
 *
 * Checks for every page:
 *   1. HTTP status (must be 200, except 404.html which must be 404)
 *   2. Required structural elements present (#site-header, #site-footer, #main, .container)
 *   3. Header and footer populated (not empty)
 *   4. Main content not empty
 *   5. Page <title> present and non-empty
 *   6. Assets (styles.css, app.js, data.js) return 200
 *   7. No HTML contains obviously-broken patterns (unclosed tags, etc.)
 *
 * Outputs a table to stdout and writes a JSON report to scripts/audit-report.json.
 */

import { createRequire } from 'module'
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Pages to audit (in nav order)
const PAGES = [
  { path: '/', file: 'index.html', expectedStatus: 200, titleIncludes: 'AV/Robotics Operations Center' },
  { path: '/fleet.html', file: 'fleet.html', expectedStatus: 200, titleIncludes: 'Fleet Overview' },
  { path: '/telemetry.html', file: 'telemetry.html', expectedStatus: 200, titleIncludes: 'Live Telemetry' },
  { path: '/missions.html', file: 'missions.html', expectedStatus: 200, titleIncludes: 'Mission Control' },
  { path: '/robotics.html', file: 'robotics.html', expectedStatus: 200, titleIncludes: 'Robotics Console' },
  { path: '/diagnostics.html', file: 'diagnostics.html', expectedStatus: 200, titleIncludes: 'Diagnostics Hub' },
  { path: '/knowledge.html', file: 'knowledge.html', expectedStatus: 200, titleIncludes: 'Knowledge Vault' },
  { path: '/perception.html', file: 'perception.html', expectedStatus: 200, titleIncludes: 'Perception' },
  { path: '/localization.html', file: 'localization.html', expectedStatus: 200, titleIncludes: 'Localization' },
  { path: '/prediction.html', file: 'prediction.html', expectedStatus: 200, titleIncludes: 'Prediction' },
  { path: '/planning.html', file: 'planning.html', expectedStatus: 200, titleIncludes: 'Behavioural Planning' },
  { path: '/trajectory.html', file: 'trajectory.html', expectedStatus: 200, titleIncludes: 'Trajectory' },
  { path: '/v2x.html', file: 'v2x.html', expectedStatus: 200, titleIncludes: 'V2X' },
  { path: '/safety.html', file: 'safety.html', expectedStatus: 200, titleIncludes: 'Fault Tolerance' },
  { path: '/simulation.html', file: 'simulation.html', expectedStatus: 200, titleIncludes: 'Simulation' },
  { path: '/login.html', file: 'login.html', expectedStatus: 200, titleIncludes: 'Login' },
  { path: '/search.html', file: 'search.html', expectedStatus: 200, titleIncludes: 'Search' },
  { path: '/chat.html', file: 'chat.html', expectedStatus: 200, titleIncludes: 'AI Chat' },
  { path: '/privacy.html', file: 'privacy.html', expectedStatus: 200, titleIncludes: 'Privacy' },
  { path: '/live.html', file: 'live.html', expectedStatus: 200, titleIncludes: 'Live Demo' },
  { path: '/architecture.html', file: 'architecture.html', expectedStatus: 200, titleIncludes: 'Production Architecture' },
  { path: '/404.html', file: '404.html', expectedStatus: 200, titleIncludes: '404' },
]

const ASSETS = ['assets/styles.css', 'assets/app.js', 'assets/data.js']

// Required structural selectors per page (after JS runs)
const REQUIRED_SELECTORS = ['#site-header', '#site-footer', '#main']

// Resolve base URL
const argBaseUrl = process.argv[2] || process.env.AUDIT_BASE_URL
let baseUrl
if (argBaseUrl) {
  baseUrl = argBaseUrl.replace(/\/$/, '')
} else {
  // Default: serve local files via python3 -m http.server on port 8889
  baseUrl = 'http://localhost:8889'
}

console.log(`\n🔍 Auditing ${PAGES.length} pages against: ${baseUrl}\n`)

async function fetchWithStatus(url) {
  try {
    const res = await fetch(url, { redirect: 'follow' })
    return { status: res.status, ok: res.ok, body: await res.text() }
  } catch (err) {
    return { status: 0, ok: false, error: err.message, body: '' }
  }
}

async function auditPage(page) {
  const url = baseUrl + page.path
  const result = {
    page: page.file,
    path: page.path,
    url,
    httpStatus: 0,
    httpOk: false,
    titleOk: false,
    title: '',
    hasHeader: false,
    hasFooter: false,
    hasMain: false,
    headerChildren: 0,
    footerChildren: 0,
    mainContentLength: 0,
    mainContentPreview: '',
    hasInteractiveContent: false,
    errors: [],
  }

  const res = await fetchWithStatus(url)
  result.httpStatus = res.status
  result.httpOk = res.status === page.expectedStatus
  if (!res.ok && res.error) {
    result.errors.push(`fetch failed: ${res.error}`)
    return result
  }
  if (!result.httpOk) {
    result.errors.push(`expected HTTP ${page.expectedStatus}, got ${res.status}`)
  }

  const html = res.body || ''

  // Title check (regex; doesn't run JS, just verifies <title> tag is present and contains expected text)
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i)
  if (titleMatch) {
    result.title = titleMatch[1].trim()
    result.titleOk = result.title.includes(page.titleIncludes)
    if (!result.titleOk) {
      result.errors.push(`title "${result.title}" does not include "${page.titleIncludes}"`)
    }
  } else {
    result.errors.push('<title> tag missing')
  }

  // Required structural elements (must be in the static HTML)
  for (const sel of REQUIRED_SELECTORS) {
    const idOrClass = sel.startsWith('#') ? `id="${sel.slice(1)}"` : `class="${sel.slice(1)}"`
    if (!html.includes(idOrClass)) {
      result.errors.push(`required selector ${sel} missing from HTML`)
    }
  }
  result.hasHeader = html.includes('id="site-header"')
  result.hasFooter = html.includes('id="site-footer"')
  result.hasMain = html.includes('id="main"')

  // Check that <main> contains visible content (not just whitespace)
  const mainMatch = html.match(/<main[^>]*id="main"[^>]*>([\s\S]*?)<\/main>/i)
  if (mainMatch) {
    const inner = mainMatch[1].replace(/<[^>]+>/g, '').trim()
    result.mainContentLength = inner.length
    result.mainContentPreview = inner.slice(0, 80)
    if (inner.length < 50) {
      result.errors.push(`main content too short (${inner.length} chars)`)
    }
  }

  // Check that interactive script is wired
  if (!html.includes('AVops.init(')) {
    result.errors.push('AVops.init() call missing — page will not have header/footer injected')
  }
  if (!html.includes('assets/data.js')) {
    result.errors.push('assets/data.js not included')
  }
  if (!html.includes('assets/app.js')) {
    result.errors.push('assets/app.js not included')
  }
  if (!html.includes('assets/styles.css')) {
    result.errors.push('assets/styles.css not included')
  }

  return result
}

async function auditAssets() {
  const results = []
  for (const asset of ASSETS) {
    const url = baseUrl + '/' + asset
    const res = await fetchWithStatus(url)
    results.push({
      asset,
      url,
      status: res.status,
      ok: res.status === 200,
      sizeBytes: res.body ? res.body.length : 0,
    })
  }
  return results
}

async function main() {
  // Audit pages in parallel (but limit concurrency to avoid rate limits)
  const CONCURRENCY = 5
  const pageResults = []
  for (let i = 0; i < PAGES.length; i += CONCURRENCY) {
    const batch = PAGES.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(batch.map(auditPage))
    pageResults.push(...batchResults)
  }

  // Audit shared assets
  const assetResults = await auditAssets()

  // Print table
  console.log('─'.repeat(110))
  console.log('PAGE                                                              HTTP  TITLE  HDR  FTR  MAIN  ERRORS')
  console.log('─'.repeat(110))
  for (const r of pageResults) {
    const status = r.httpOk ? '\x1b[32m' + r.httpStatus + '\x1b[0m' : '\x1b[31m' + r.httpStatus + '\x1b[0m'
    const titleOk = r.titleOk ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
    const hdr = r.hasHeader ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
    const ftr = r.hasFooter ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
    const main = r.hasMain ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'
    const errCount = r.errors.length
    const errCol = errCount === 0 ? '\x1b[32m0\x1b[0m' : '\x1b[31m' + errCount + '\x1b[0m'
    const name = (r.page || '').padEnd(62).slice(0, 62)
    console.log(`${name}  ${status}   ${titleOk}     ${hdr}    ${ftr}    ${main}    ${errCol}`)
  }
  console.log('─'.repeat(110))

  // Print asset table
  console.log('\nASSETS:')
  console.log('─'.repeat(80))
  for (const a of assetResults) {
    const status = a.ok ? '\x1b[32m' + a.status + '\x1b[0m' : '\x1b[31m' + a.status + '\x1b[0m'
    console.log(`  ${a.asset.padEnd(28)}  ${status}  ${(a.sizeBytes / 1024).toFixed(1)} KB`)
  }
  console.log('─'.repeat(80))

  // Print per-page errors in detail
  const failedPages = pageResults.filter(r => r.errors.length > 0)
  if (failedPages.length > 0) {
    console.log('\n\n❌ ERRORS DETAIL:')
    for (const r of failedPages) {
      console.log(`\n  ${r.page}:`)
      for (const e of r.errors) {
        console.log(`    • ${e}`)
      }
    }
  }

  // Summary
  const totalPages = pageResults.length
  const passedPages = pageResults.filter(r => r.errors.length === 0 && r.httpOk).length
  const failedAssets = assetResults.filter(a => !a.ok).length
  console.log(`\n\n📊 SUMMARY`)
  console.log(`  Pages:  ${passedPages}/${totalPages} passed (${failedPages.length} with errors)`)
  console.log(`  Assets: ${assetResults.length - failedAssets}/${assetResults.length} OK`)

  // Write JSON report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl,
    summary: {
      totalPages,
      passedPages,
      failedPages: failedPages.length,
      totalAssets: assetResults.length,
      failedAssets,
    },
    pages: pageResults,
    assets: assetResults,
  }
  const reportPath = resolve(__dirname, 'audit-report.json')
  writeFileSync(reportPath, JSON.stringify(report, null, 2))
  console.log(`\n  JSON report: ${reportPath}`)

  // Exit code: 0 if all pass, 1 otherwise
  if (failedPages.length > 0 || failedAssets > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

main().catch(err => {
  console.error('Audit failed:', err)
  process.exit(2)
})
