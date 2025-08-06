import { compile } from 'json-schema-to-typescript'

fetch('https://zed.dev/schema/themes/v0.2.0.json')
  .then(r => r.json())
  .then(json => compile(json as any, ''))
  .then(text => Bun.file('./src/type.ts').write(text))
