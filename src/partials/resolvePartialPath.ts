import path from 'path'
import fs from 'fs'

export function resolvePartialPath(
  partialRoot: string,
  name: string
): string | null {
  const full = path.join(partialRoot, `${name}.hbs`)
  return fs.existsSync(full) ? full : null
}
