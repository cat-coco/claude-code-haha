import { appendFileSync, existsSync, writeFileSync } from 'fs'
import memoize from 'lodash-es/memoize.js'
import { dirname, join } from 'path'

import { isEnvTruthy } from './envUtils.js'

/**
 * EFM debug log — a project-local, single-file debug log intended for
 * `tail -f debugLog.log` while iterating. Writes land in the project root
 * so they're easy to locate without digging into ~/.claude.
 *
 * Controlled by env var EFM_DEBUG_LOG (1/true/yes/on). The path can be
 * overridden with EFM_DEBUG_LOG_PATH. Default: <projectRoot>/debugLog.log.
 *
 * Intentionally kept independent from the existing ~/.claude/debug/*.txt
 * stream so turning this on doesn't drag in verbose internal diagnostics.
 */

export const isEfmDebugLogEnabled = memoize((): boolean => {
  return isEnvTruthy(process.env.EFM_DEBUG_LOG)
})

function resolveProjectRoot(): string {
  // Walk up from the entrypoint looking for a package.json (the project root).
  // Falls back to cwd if the walk doesn't find one.
  const main = typeof process !== 'undefined' ? process.argv[1] : undefined
  if (main) {
    let dir = dirname(main)
    for (let i = 0; i < 6; i++) {
      if (existsSync(join(dir, 'package.json'))) return dir
      const parent = dirname(dir)
      if (parent === dir) break
      dir = parent
    }
  }
  return process.cwd()
}

export const getEfmDebugLogPath = memoize((): string => {
  const override = process.env.EFM_DEBUG_LOG_PATH
  if (override) return override
  return join(resolveProjectRoot(), 'debugLog.log')
})

let headerWritten = false

function ensureHeader(path: string): void {
  if (headerWritten) return
  headerWritten = true
  try {
    const header = `===== EFM debug log session @ ${new Date().toISOString()} pid=${process.pid} =====\n`
    if (!existsSync(path)) {
      writeFileSync(path, header)
    } else {
      appendFileSync(path, header)
    }
  } catch {
    // If writing fails we don't want to crash the host process.
  }
}

function safeStringify(value: unknown): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  try {
    const seen = new WeakSet<object>()
    return JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === 'bigint') return `${v.toString()}n`
        if (typeof v === 'function') return `[Function ${v.name || 'anon'}]`
        if (v instanceof Error) {
          return { name: v.name, message: v.message, stack: v.stack }
        }
        if (v && typeof v === 'object') {
          if (seen.has(v as object)) return '[Circular]'
          seen.add(v as object)
        }
        return v
      },
      2,
    )
  } catch {
    try {
      return String(value)
    } catch {
      return '[unserializable]'
    }
  }
}

/**
 * Log a named event with an optional payload to debugLog.log.
 * No-op unless EFM_DEBUG_LOG is truthy.
 */
export function efmDebugLog(tag: string, data?: unknown): void {
  if (!isEfmDebugLogEnabled()) return
  const path = getEfmDebugLogPath()
  ensureHeader(path)
  const ts = new Date().toISOString()
  const payload = data === undefined ? '' : ` ${safeStringify(data)}`
  const line = `[${ts}] ${tag}${payload}\n`
  try {
    appendFileSync(path, line)
  } catch {
    // swallow — logging must never break the host flow
  }
}

/**
 * Lazy variant — pass a producer so callers can skip stringifying heavy
 * payloads when logging is disabled.
 */
export function efmDebugLogLazy(tag: string, produce: () => unknown): void {
  if (!isEfmDebugLogEnabled()) return
  let data: unknown
  try {
    data = produce()
  } catch (e) {
    data = { _producerError: e instanceof Error ? e.message : String(e) }
  }
  efmDebugLog(tag, data)
}
