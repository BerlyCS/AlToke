import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const [resultDir, outputFile] = process.argv.slice(2)

if (!resultDir || !outputFile) {
  throw new Error('Usage: node scripts/generate-e2e-report.mjs <result-dir> <output-file>')
}

const escapeHtml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')

const listFiles = (directory) => {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  })
}

const junitFiles = listFiles(join(resultDir, 'junit'))
  .filter((file) => file.endsWith('.xml'))
  .sort((left, right) => statSync(left).mtimeMs - statSync(right).mtimeMs)
const reports = junitFiles.map((file) => {
  const junit = readFileSync(file, 'utf8')
  return {
    file: relative(resultDir, file).replaceAll('\\', '/'),
    junit,
    tests: (junit.match(/<testcase\b/g) ?? []).length,
    failures: (junit.match(/<(failure|error)\b/g) ?? []).length,
    skipped: (junit.match(/<skipped\b/g) ?? []).length,
  }
})
const tests = reports.reduce((total, report) => total + report.tests, 0)
const failures = reports.reduce((total, report) => total + report.failures, 0)
const skipped = reports.reduce((total, report) => total + report.skipped, 0)
const artifacts = listFiles(resultDir)
  .filter((file) => !file.endsWith('.xml'))
  .map((file) => relative(resultDir, file).replaceAll('\\', '/'))

const metadata = {
  sha: process.env.GITHUB_SHA ?? 'local',
  run: process.env.GITHUB_RUN_URL ?? 'local',
  testedUrl: process.env.E2E_TESTED_URL ?? 'http://localhost:8080',
  smokeStatus: process.env.SMOKE_STATUS ?? 'unknown',
  generatedAt: new Date().toISOString(),
}
const smokeOk = metadata.smokeStatus === 'success' || metadata.smokeStatus === 'unknown'
const status = failures === 0 && tests > 0 && smokeOk ? 'PASSED' : 'FAILED'
const artifactLinks = artifacts
  .map((file) => `<li><a href="${encodeURI(file)}">${escapeHtml(file)}</a></li>`)
  .join('\n')
const reportRows = reports
  .map(
    (report) =>
      `<tr><td><a href="${encodeURI(report.file)}">${escapeHtml(report.file)}</a></td><td>${report.tests}</td><td>${report.failures}</td><td>${report.skipped}</td></tr>`,
  )
  .join('\n')
const junitOutput = reports
  .map((report) => `<h3>${escapeHtml(report.file)}</h3><pre>${escapeHtml(report.junit)}</pre>`)
  .join('\n')

writeFileSync(
  outputFile,
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AlToke E2E ${status}</title>
  <style>body{font-family:system-ui,sans-serif;max-width:900px;margin:3rem auto;padding:0 1rem} .status{font-size:1.4rem;font-weight:700;color:${status === 'PASSED' ? '#167c3a' : '#bd2020'}} code{background:#f1f1f1;padding:.15rem .3rem}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:.5rem;text-align:left}</style>
</head><body><h1>AlToke test report</h1><p class="status">${status}</p><p>Tests: ${tests} | Failures: ${failures} | Skipped: ${skipped} | Production smoke: ${escapeHtml(metadata.smokeStatus)}</p><p>Commit: <code>${escapeHtml(metadata.sha)}</code></p><p>Tested URL: <a href="${escapeHtml(metadata.testedUrl)}">${escapeHtml(metadata.testedUrl)}</a></p><p>Generated: ${escapeHtml(metadata.generatedAt)}</p><p><a href="${escapeHtml(metadata.run)}">GitHub Actions run</a></p><h2>Test suites</h2><table><thead><tr><th>JUnit report</th><th>Tests</th><th>Failures</th><th>Skipped</th></tr></thead><tbody>${reportRows || '<tr><td colspan="4">No JUnit output was generated.</td></tr>'}</tbody></table><h2>Artifacts</h2><ul>${artifactLinks || '<li>No screenshots or videos were generated.</li>'}</ul><h2>JUnit output</h2>${junitOutput || '<pre>No JUnit output was generated.</pre>'}</body></html>`,
)
