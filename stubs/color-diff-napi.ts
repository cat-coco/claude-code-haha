// Re-export the pure-TypeScript port so `import ... from 'color-diff-napi'`
// resolves to a working implementation at runtime (bun uses tsconfig paths).
export {
  ColorDiff,
  ColorFile,
  getSyntaxTheme,
  type Hunk,
  type SyntaxTheme,
  type NativeModule,
} from '../src/native-ts/color-diff/index.js'
