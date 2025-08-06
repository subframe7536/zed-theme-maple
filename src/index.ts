import { colors, type Colors } from '../vscode/src/colors'
import { name, author, description, displayName, repository as repo, version } from '../package.json'
import { writeFileSync } from 'node:fs'
import type { ThemeFamilyContent } from './type'
import { buildTheme } from './theme'

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
      style: buildTheme(baseColor, tokenColor, uiColor, isDark),
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