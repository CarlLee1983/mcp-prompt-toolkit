import chalk from 'chalk'

export type OutputFormat = 'text' | 'json'

export interface OutputOptions {
  format?: OutputFormat
  output?: string
}

export function writeOutput(data: unknown, options: OutputOptions = {}) {
  const { format = 'text', output } = options

  const content = format === 'json'
    ? JSON.stringify(data, null, 2)
    : String(data)

  if (output) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('fs')
    fs.writeFileSync(output, content, 'utf8')
    // eslint-disable-next-line no-console
    console.log(chalk.green(`Output written to: ${output}`))
  } else {
    // eslint-disable-next-line no-console
    console.log(content)
  }
}

export function formatSuccess(message: string): string {
  return chalk.green(`✓ ${message}`)
}

export function formatError(message: string): string {
  return chalk.red(`✗ ${message}`)
}

export function formatWarning(message: string): string {
  return chalk.yellow(`⚠ ${message}`)
}

export function formatInfo(message: string): string {
  return chalk.blue(`ℹ ${message}`)
}

