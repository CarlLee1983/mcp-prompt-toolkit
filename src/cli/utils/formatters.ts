import chalk from 'chalk'
import { ValidationError } from '../../validators/validateRepo'

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return chalk.green('No validation errors found.')
  }

  const lines: string[] = []
  lines.push(chalk.red(`Found ${errors.length} validation error(s):\n`))

  for (const error of errors) {
    lines.push(chalk.bold(`File: ${error.file}`))

    if (error.type === 'schema') {
      lines.push(chalk.red('  Type: Schema validation error'))
      for (const err of error.errors) {
        lines.push(`    - ${err.path.join('.')}: ${err.message}`)
      }
    } else if (error.type === 'missing-partial') {
      lines.push(chalk.red('  Type: Missing partial'))
      lines.push(`    - Partial: ${error.partial}`)
    } else if (error.type === 'circular-partial') {
      lines.push(chalk.red('  Type: Circular dependency'))
      lines.push(`    - Chain: ${error.chain.join(' → ')}`)
    }

    lines.push('')
  }

  return lines.join('\n')
}

export function formatValidationErrorsJson(errors: ValidationError[]): object {
  return {
    errors: errors.map(error => {
      if (error.type === 'schema') {
        return {
          type: 'schema',
          file: error.file,
          errors: error.errors.map(e => ({
            path: e.path,
            message: e.message,
            code: e.code
          }))
        }
      } else if (error.type === 'missing-partial') {
        return {
          type: 'missing-partial',
          file: error.file,
          partial: error.partial
        }
      } else {
        return {
          type: 'circular-partial',
          file: error.file,
          chain: error.chain
        }
      }
    })
  }
}

