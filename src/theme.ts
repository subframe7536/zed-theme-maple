import { buildTerminalColor } from "../vscode/src/terminal";
import type { BaseColor, TokenColor, UIColor } from "../vscode/src/type";
import { parseColor, getSchemeTextColor } from "../vscode/src/util";
import { buildUI, buildSyntax } from "./utils";

export function buildTheme(
  base: BaseColor,
  token: TokenColor,
  ui: UIColor,
  isDark: boolean,
) {
  return {
    ...buildUI({
      background: {
        DEFAULT: ui.background,
      },
      text: {
        DEFAULT: ui.foreground,
        accent: ui.secondary,
        muted: parseColor(ui.foreground, 0.9),
      },
      hint: {
        DEFAULT: base.gray,
      },
      elevated_surface: {
        background: ui.background,
      },
      editor: {
        foreground: ui.foreground,
        background: ui.backgroundEditor,
        gutter: {
          background: ui.background,
        },
        document_highlight: {
          // highlight occurences of selection
          bracket_background: parseColor(ui.selection, 0.4),
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
        background: parseColor(ui.backgroundEditorAlt, 0.5),
      },
      element: {
        hover: parseColor(ui.listItem, 0.6),
        active: parseColor(ui.listItem, 0.8),
        selected: ui.listItem,
      },
      ghost_element: {
        hover: parseColor(ui.listItem, 0.4),
        active: parseColor(ui.listItem, 0.6),
        selected: ui.listItem,
      },
      terminal: {
        background: ui.backgroundEditor,
        foreground: ui.foreground,
        ansi: buildTerminalColor(base, isDark, (type, isBright) =>
          isBright ? `bright_${type}` : type,
        ),
      },
      created: {
        DEFAULT: token.diff.inserted,
      },
      deleted: {
        DEFAULT: token.diff.deleted,
      },
      modified: {
        DEFAULT: token.diff.changed,
      },
      conflict: {
        DEFAULT: base.purple,
      },
      renamed: {
        DEFAULT: base.cyan,
      },
      ignored: {
        DEFAULT: base.gray,
      },
      border: {
        DEFAULT: ui.borderNormal,
        focused: parseColor(ui.borderActive, 0.8),
        selected: ui.borderActive,
      },
      panel: {
        background: ui.background,
      },
      link_text: {
        hover: ui.backgroundEditorAlt,
      },
      scrollbar: {
        thumb: {
          background: parseColor(ui.scrollbar, isDark ? 0.5 : 0.3),
          hover_background: parseColor(ui.scrollbar, isDark ? 0.8 : 0.6),
        },
      },
      hidden: {
        background: ui.backgroundEditorAlt,
      },
      success: {
        DEFAULT: base.green,
        background: parseColor(base.green, 0.3),
      },
      info: {
        DEFAULT: base.blue,
        background: parseColor(base.blue, 0.3),
      },
      error: {
        DEFAULT: base.red,
        background: parseColor(base.red, 0.3),
      },
      warning: {
        DEFAULT: base.yellow,
        background: parseColor(base.yellow, 0.3),
      },
      unreachable: {
        DEFAULT: base.gray,
      },
      search: {
        match_background: ui.backgroundEditorAlt,
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
        fontStyle: "italic",
      },
      comment: token.comment,
      constant: token.constant,
      constructor: token.class.normal,
      embedded: token.constant,
      emphasis: {
        color: token.markdown.italic,
        fontStyle: "italic",
      },
      "emphasis.strong": {
        color: token.markdown.bold,
        fontWeight: 700,
      },
      enum: token.enum.normal,
      function: token.function,
      hint: token.comment,
      keyword: {
        color: token.keyword.normal,
        fontStyle: "italic",
      },
      label: token.function,
      link_text: token.string,
      link_uri: token.link,
      namespace: token.namespace,
      number: token.number,
      operator: token.operator,
      primary: token.builtin,
      property: token.property.normal,
      punctuation: token.punctuation,
      string: token.string,
      selector: token.property.normal,
      "selector.pseudo": token.css.pseudo,
      tag: token.htmlTag,
      type: {
        color: token.type.normal,
        fontWeight: 700,
      },
      title: token.markdown.title,
      variable: parseColor(token.variable.local, 0.9),
      "variable.special": token.variable.defaultLib,
    }),
  };
}
