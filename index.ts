import type { BaseColor, TokenColor, UIColor } from './vscode/src/type'

import { buildTerminalColor } from './vscode/src/terminal'
import { getSchemeTextColor, parseColor } from './vscode/src/util'
import { colors, type Colors } from './vscode/src/colors'
import { name, author, description, displayName, repository as repo, version } from './package.json'
import { writeFileSync } from 'node:fs'
import type { HighlightStyleContent, ThemeFamilyContent, ThemeStyleContent } from './type'
import type { Prettify } from "@subframe7536/type-utils";

// 将 T 中所有以 K 为前缀的键值重新映射到子对象
type _GatherByPrefix<T, K extends string> = {
  [P in keyof T as P extends `${K}.${infer Tail}` ? Tail : never]: T[P];
};

// 判断 T 中是否存在直接字段 K（无 '.' 的 K）
type _HasDirectKey<T, K extends string> = K extends keyof T ? true : false;

// 判断 T 中是否存在以 K. 开头的字段
type _HasNestedKey<T, K> = K extends string ? Extract<keyof T, `${K}.${string}`> extends never ? false : true : never;

// 主实现
type ExpandDotKeys<T extends object> = {
    [K in TopLevelKeys<keyof T> & string]?: _HasDirectKey<T, K> extends true
    ? _HasNestedKey<T, K> extends true
    ? // 冲突：同时存在 a 和 a.b，将 a 的值放进 DEFAULT
    Prettify<
      ExpandDotKeys<_GatherByPrefix<T, K>> & { DEFAULT?: T[K & keyof T] }
    >
    : // 只有 a，没有 a.*，保持原值
    T[K & keyof T]
    : // 只有 a.*，没有 a，继续展开
    ExpandDotKeys<_GatherByPrefix<T, K>>;
  }

// 取出所有顶层键名（'a.b' -> 'a'）
type TopLevelKeys<K> = K extends `${infer Head}.${string}` ? Head : K;
type RemoveStringIndex<T> = {
  [K in keyof T as string extends K ? never : K]: T[K];
};

type UI = Omit<ExpandDotKeys<RemoveStringIndex<ThemeStyleContent>>, 'syntax'>

function buildUI(themeDev: UI) {
  const theme: Record<string, any> = {}

  function flatten(obj: any, prefix = '') {
    for (const key in obj) {
      const value = obj[key]
      const newKey = prefix ? key === 'DEFAULT' ? prefix : `${prefix}.${key}` : key

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

function buildSyntax(obj: Record<string, string | SyntaxConfig>): Record<string, HighlightStyleContent> {
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

function buildZedTheme(
  base: BaseColor,
  token: TokenColor,
  ui: UIColor,
  isDark: boolean,
) {
  return {
    ...buildUI({
      background: {
        DEFAULT: ui.background
      },
      editor: {
        foreground: ui.foreground,
        background: ui.backgroundEditor,
        gutter: {
          background: ui.background,
        },
        document_highlight: {
          bracket_background: parseColor(ui.cursor, isDark ? 0.5 : 0.3),
        },
        active_line: {
          background: parseColor(ui.selection, 0.25),
        },
        active_line_number: getSchemeTextColor(ui.background),
        line_number: parseColor(base.gray, 0.7),
        highlighted_line: {
          background: parseColor(ui.selection, 0.5),
        },
      },
      status_bar: {
        background: ui.background,
      },
      toolbar: {
        background: ui.backgroundEditorAlt,
      },
      terminal: {
        background: ui.backgroundEditor,
        foreground: ui.foreground,
        ansi: buildTerminalColor(
          base,
          isDark,
          (type, isBright) => isBright ? `bright_${type}` : type,
        ),
      },
      created: {
        DEFAULT: base.green
      },
      deleted: {
        DEFAULT: base.red
      },
      modified: {
        DEFAULT: base.blue
      },
      conflict: {
        DEFAULT: base.cyan
      },
      renamed: {
        DEFAULT: base.purple
      },
      ignored: {
        DEFAULT: base.gray
      },
      border: {
        DEFAULT: ui.borderNormal,
        focused: ui.borderActive,
      },
      warning: {
        background: ui.backgroundEditorAlt,
        border: ui.borderNormal,
      },
      players: [
        {
          cursor: ui.cursor,
          background: ui.backgroundEditor,
          selection: ui.selection,
        },
      ],
    }),
    syntax: buildSyntax({
      attribute: token.property.normal,
      boolean: {
        color: token.boolean,
        fontStyle: 'italic',
      },
      comment: token.comment,
      constant: token.constant,
      constructor: token.keyword.alt,
      embedded: token.constant,
      emphasis: {
        color: token.link,
        fontStyle: 'italic',
      },
      enum: token.enum.normal,
      function: token.function,
      hint: token.comment,
      keyword: {
        color: token.keyword.normal,
        fontStyle: 'italic',
      },
      label: token.function,
      number: token.number,
      operator: token.operator,
      primary: token.builtin,
      property: token.property.normal,
      punctuation: token.punctuation,
      string: token.string,
      tag: token.htmlTag,
      type: {
        color: token.type.normal,
        fontWeight: 700,
      },
      variable: token.variable.local,
    }),
  }
}


function main(colorConfig: Record<string, Colors>) {
  const themeJson: ThemeFamilyContent = {
    name: 'Maple Theme',
    author,
    themes: [],
  }
  for (const [name, color] of Object.entries(colorConfig)) {
    const { baseColor, isDark, tokenColor, uiColor } = color
    themeJson.themes.push({
      appearance: color.isDark ? 'dark' : 'light',
      name,
      style: buildZedTheme(baseColor, tokenColor, uiColor, isDark),
    })
  }
  writeFileSync(
    `themes/maple.json`,
    `${JSON.stringify(themeJson, null, 2)}\n`,
  )

  const tomlConfig = {
    id: name,
    name: displayName,
    version,
    schema_version: 1,
    description,
    repository: repo.url,
    authors: [author],
    themes: ['maple.json'],
  }
  writeFileSync(
    'extension.toml',
    Object.entries(tomlConfig)
      .map(([k, v]) => {
        const prefix = `${k} = `
        if (typeof v === 'string') {
          return `${prefix}"${v}"`
        }
        if (Array.isArray(v)) {
          return prefix + JSON.stringify(v)
        }
        return prefix + v
      })
      .join('\n'),
  )

  console.log('Theme updated')
}

main(colors)