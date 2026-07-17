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

const junitFile = listFiles(join(resultDir, 'junit'))
  .filter((file) => file.endsWith('.xml'))
  .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs)[0]
const junit = junitFile ? readFileSync(junitFile, 'utf8') : ''
const tests = (junit.match(/<testcase\b/g) ?? []).length
const failures = (junit.match(/<(failure|error)\b/g) ?? []).length
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
const status = failures === 0 && tests > 0 && metadata.smokeStatus === 'success' ? 'PASSED' : 'FAILED'
const artifactLinks = artifacts
  .map((file) => `<li><a href="${encodeURI(file)}">${escapeHtml(file)}</a></li>`)
  .join('\n')

writeFileSync(
  outputFile,
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AlToke E2E ${status}</title>
<style>body{font-family:system-ui,sans-serif;max-width:900px;margin:3rem auto;padding:0 1rem} .status{font-size:1.4rem;font-weight:700;color:${status === 'PASSED' ? '#167c3a' : '#bd2020'}} code{background:#f1f1f1;padding:.15rem .3rem}</style>
</head><body><h1>AlToke E2E report</h1><p class="status">${status}</p><p>Tests: ${tests} | Failures: ${failures} | Production smoke: ${escapeHtml(metadata.smokeStatus)}</p><p>Commit: <code>${escapeHtml(metadata.sha)}</code></p><p>Tested URL: <a href="${escapeHtml(metadata.testedUrl)}">${escapeHtml(metadata.testedUrl)}</a></p><p>Generated: ${escapeHtml(metadata.generatedAt)}</p><p><a href="${escapeHtml(metadata.run)}">GitHub Actions run</a></p><h2>Artifacts</h2><ul>${artifactLinks || '<li>No screenshots or videos were generated.</li>'}</ul><h2>JUnit output</h2><pre>${escapeHtml(junit || 'No JUnit output was generated.')}</pre></body></html>`,
)
