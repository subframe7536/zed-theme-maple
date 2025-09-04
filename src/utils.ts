import type { Prettify } from '@subframe7536/type-utils'
import type { ThemeStyleContent, HighlightStyleContent } from './type'

type GatherByPrefix<T, K extends string> = {
  [P in keyof T as P extends `${K}.${infer Tail}` ? Tail : never]: T[P]
}

type HasDirectKey<T, K extends string> = K extends keyof T ? true : false

type HasNestedKey<T, K> = K extends string
  ? Extract<keyof T, `${K}.${string}`> extends never
    ? false
    : true
  : never

type TopLevelKeys<K> = K extends `${infer Head}.${string}` ? Head : K
type RemoveStringIndex<T> = {
  [K in keyof T as string extends K ? never : K]: T[K]
}

type ExpandDotKeys<T extends object> = {
  [K in TopLevelKeys<keyof T> & string]?: HasDirectKey<T, K> extends true
    ? HasNestedKey<T, K> extends true
      ? Prettify<
          ExpandDotKeys<GatherByPrefix<T, K>> & { DEFAULT?: T[K & keyof T] }
        >
      : T[K & keyof T]
    : ExpandDotKeys<GatherByPrefix<T, K>>
}

type UI = Omit<ExpandDotKeys<RemoveStringIndex<ThemeStyleContent>>, 'syntax'>

export function buildUI(themeDev: UI) {
  const theme: Record<string, any> = {}

  function flatten(obj: any, prefix = '') {
    for (const key in obj) {
      const value = obj[key]
      const newKey = prefix
        ? key === 'DEFAULT'
          ? prefix
          : `${prefix}.${key}`
        : key

      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          theme[newKey] = value
        } else {
          flatten(value, newKey)
        }
      } else {
        theme[newKey] = value
      }
    }
  }

  flatten(themeDev)
  return theme
}

interface SyntaxConfig {
  color: string
  backgroundColor?: string
  fontStyle?: 'normal' | 'italic' | 'oblique'
  fontWeight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900
}

export function buildSyntax(
  obj: Record<string, string | SyntaxConfig>,
): Record<string, HighlightStyleContent> {
  const result: Record<string, HighlightStyleContent> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      result[k] = { color: v }
    } else if (typeof v === 'object') {
      result[k] = {
        color: v.color,
        font_style: v.fontStyle,
        font_weight: v.fontWeight,
        background_color: v.backgroundColor,
      }
    }
  }
  return result
}
