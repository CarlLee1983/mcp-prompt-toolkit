import { Command } from 'commander'
import path from 'path'
import fs from 'fs'
import { validatePartialsUsage } from '../../validators/validatePartialsUsage'
import { validateRegistry } from '../../validators/validateRegistry'
import { validatePromptFile } from '../../validators/validatePromptFile'
import { writeOutput, OutputFormat } from '../utils/output'
import { Logger } from '../utils/logger'
import ora from 'ora'

export const checkCommand = new Command('check')
  .description('Check prompt repository components')

checkCommand
  .command('partials')
  .description('Check partials usage (missing partials and circular dependencies)')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('-o, --output <file>', 'Output file path')
  .action(async (repoPath: string, options: { format: OutputFormat; output?: string }) => {
    const spinner = ora('Checking partials usage...').start()

    try {
      const resolvedPath = path.resolve(repoPath)

      if (!fs.existsSync(resolvedPath)) {
        spinner.fail(`Repository path does not exist: ${resolvedPath}`)
        process.exit(1)
      }

      const registryPath = path.join(resolvedPath, 'registry.yaml')
      if (!fs.existsSync(registryPath)) {
        spinner.fail(`Registry file not found: ${registryPath}`)
        process.exit(1)
      }

      const registry = validateRegistry(registryPath, resolvedPath)
      if (!registry.success) {
        spinner.fail('Registry validation failed')
        Logger.error('Cannot check partials: registry is invalid')
        process.exit(1)
      }

      const partialRoot = registry.data.partials?.enabled
        ? path.join(resolvedPath, registry.data.partials.path)
        : null

      if (!partialRoot) {
        spinner.warn('Partials are not enabled in registry')
        if (options.format === 'json') {
          writeOutput({ enabled: false, message: 'Partials are not enabled' }, options)
        } else {
          Logger.warning('Partials are not enabled in registry')
        }
        process.exit(0)
      }

      const allErrors: Array<{ file: string; type: string; partial?: string; chain?: string[] }> = []

      for (const group of Object.values(registry.data.groups)) {
        if (!group.enabled) continue

        for (const file of group.prompts) {
          const full = path.join(resolvedPath, group.path, file)
          const res = validatePromptFile(full)

          if (!res.success) continue

          const usageErrors = validatePartialsUsage(res.data.template, partialRoot)

          for (const e of usageErrors) {
            allErrors.push({
              file: `${group.path}/${file}`,
              ...e
            })
          }
        }
      }

      if (allErrors.length === 0) {
        spinner.succeed('No partials usage issues found!')
        if (options.format === 'json') {
          writeOutput({ passed: true, errors: [] }, options)
        } else {
          Logger.success('All partials are valid!')
        }
        process.exit(0)
      } else {
        spinner.fail(`Found ${allErrors.length} partials usage issue(s)!`)
        if (options.format === 'json') {
          writeOutput({ passed: false, errors: allErrors }, options)
        } else {
          Logger.error(`Found ${allErrors.length} partials usage issue(s):\n`)
          for (const error of allErrors) {
            // eslint-disable-next-line no-console
            console.log(`File: ${error.file}`)
            if (error.type === 'missing-partial') {
              // eslint-disable-next-line no-console
              console.log('  Type: Missing partial')
              // eslint-disable-next-line no-console
              console.log(`  Partial: ${error.partial}`)
            } else if (error.type === 'circular-partial') {
              // eslint-disable-next-line no-console
              console.log('  Type: Circular dependency')
              // eslint-disable-next-line no-console
              console.log(`  Chain: ${error.chain?.join(' → ')}`)
            }
            // eslint-disable-next-line no-console
            console.log('')
          }
        }
        process.exit(1)
      }
    } catch (error) {
      spinner.fail('Check error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

