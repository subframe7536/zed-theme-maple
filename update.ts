import { compile } from 'json-schema-to-typescript'

const version = process.argv[2] || 'v0.2.0'

const text = await fetch(`https://zed.dev/schema/themes/${version}.json`).then(r => r.text())
if (!text.startsWith('{')) {
  console.log("No schema:", text.slice(0, 500))
  process.exit(1)
}
Bun.file('./src/type.ts').write(await compile(JSON.parse(text), ''))
