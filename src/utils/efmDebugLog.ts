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
      writeFileSync(path, header, { encoding: 'utf8' })
    } else {
      appendFileSync(path, header, { encoding: 'utf8' })
    }
  } catch {
    // If writing fails we don't want to crash the host process.
  }
}

// Decodes JSON `\uXXXX` escapes (including surrogate pairs) back to literal
// characters so CJK and other non-ASCII content is readable in the log.
//
// Backslash-counting is significant: in JSON output `\uXXXX` (1 backslash)
// is the real Unicode escape, while `\\uXXXX` (2 backslashes) is a literal
// `\u` that happened to appear in the source string. Only an odd number
// of leading backslashes means the `u` is escaped and should be decoded —
// the last backslash is consumed, the rest remain literal.
//
// Control chars (< U+0020, except tab) are left escaped so a raw CR/LF or
// bell byte can't corrupt `tail -f` output.
function unescapeUnicodeForDisplay(s: string): string {
  // Collapse surrogate pairs first so emoji/non-BMP round-trip correctly.
  s = s.replace(
    /(\\+)u([dD][89abAB][0-9a-fA-F]{2})\\u([dD][c-fC-F][0-9a-fA-F]{2})/g,
    (match, slashes: string, hi: string, lo: string) => {
      if (slashes.length % 2 !== 1) return match
      const cp =
        (parseInt(hi, 16) - 0xd800) * 0x400 +
        (parseInt(lo, 16) - 0xdc00) +
        0x10000
      return slashes.slice(0, -1) + String.fromCodePoint(cp)
    },
  )
  return s.replace(
    /(\\+)u([0-9a-fA-F]{4})/g,
    (match, slashes: string, hex: string) => {
      if (slashes.length % 2 !== 1) return match
      const code = parseInt(hex, 16)
      if (code < 0x20 && code !== 0x09) return match
      return slashes.slice(0, -1) + String.fromCharCode(code)
    },
  )
}

const utf8Decoder = new TextDecoder('utf-8', { fatal: true })

// Decode a byte sequence as UTF-8. Returns null if the bytes aren't valid
// UTF-8 (so callers can fall through to a binary summary instead of
// producing mojibake).
function bytesToUtf8OrNull(bytes: Uint8Array): string | null {
  try {
    return utf8Decoder.decode(bytes)
  } catch {
    return null
  }
}

function summarizeBinary(len: number): string {
  return `<binary ${len} bytes>`
}

// Detect the serialized-Buffer shape `{type:"Buffer", data:[...]}` that
// appears after a Buffer has been through JSON.parse(JSON.stringify(buf)).
function asSerializedBuffer(v: unknown): number[] | null {
  if (!v || typeof v !== 'object') return null
  const obj = v as { type?: unknown; data?: unknown }
  if (obj.type !== 'Buffer' || !Array.isArray(obj.data)) return null
  if (!obj.data.every(n => typeof n === 'number')) return null
  return obj.data as number[]
}

function safeStringify(value: unknown): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  let out: string
  try {
    const seen = new WeakSet<object>()
    out = JSON.stringify(
      value,
      (_k, v) => {
        if (typeof v === 'bigint') return `${v.toString()}n`
        if (typeof v === 'function') return `[Function ${v.name || 'anon'}]`
        if (v instanceof Error) {
          return { name: v.name, message: v.message, stack: v.stack }
        }
        // Buffer / Uint8Array / other TypedArrays / ArrayBuffer: JSON.stringify
        // default is to dump numeric byte values, which turns CJK into
        // [228,189,160,...]. Try decoding as UTF-8 so 你好 round-trips; fall
        // back to a compact `<binary N bytes>` marker when it isn't text.
        if (v instanceof Uint8Array) {
          const str = bytesToUtf8OrNull(v)
          return str ?? summarizeBinary(v.byteLength)
        }
        if (v instanceof ArrayBuffer) {
          const u8 = new Uint8Array(v)
          const str = bytesToUtf8OrNull(u8)
          return str ?? summarizeBinary(u8.byteLength)
        }
        if (ArrayBuffer.isView(v)) {
          const view = v as ArrayBufferView
          const u8 = new Uint8Array(
            view.buffer,
            view.byteOffset,
            view.byteLength,
          )
          const str = bytesToUtf8OrNull(u8)
          return str ?? summarizeBinary(view.byteLength)
        }
        // Post-serialized Buffer shape ({type:'Buffer', data:[...]}).
        const bufArr = asSerializedBuffer(v)
        if (bufArr) {
          const u8 = Uint8Array.from(bufArr)
          const str = bytesToUtf8OrNull(u8)
          return str ?? summarizeBinary(u8.byteLength)
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
  return out === undefined ? '' : unescapeUnicodeForDisplay(out)
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
    appendFileSync(path, line, { encoding: 'utf8' })
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
