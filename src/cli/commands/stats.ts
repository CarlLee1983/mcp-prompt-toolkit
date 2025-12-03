import { Command } from 'commander'
import path from 'path'
import fs from 'fs'
import { validateRegistry } from '../../validators/validateRegistry'
import { validatePartials } from '../../validators/validatePartials'
import { writeOutput, OutputFormat } from '../utils/output'
import { Logger } from '../utils/logger'
import ora from 'ora'

export const statsCommand = new Command('stats')
  .description('Show repository statistics')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .action((repoPath: string, options: { format: OutputFormat }) => {
    const spinner = ora('Collecting statistics...').start()

    try {
      const resolvedPath = path.resolve(repoPath)
      const registryPath = path.join(resolvedPath, 'registry.yaml')

      if (!fs.existsSync(registryPath)) {
        spinner.fail(`Registry file not found: ${registryPath}`)
        process.exit(1)
      }

      const registry = validateRegistry(registryPath, resolvedPath)
      if (!registry.success) {
        spinner.fail('Registry validation failed')
        Logger.error('Cannot collect statistics: registry is invalid')
        process.exit(1)
      }

      // Count prompts
      let totalPrompts = 0
      let enabledPrompts = 0
      const groupStats: Array<{ name: string; enabled: boolean; promptCount: number }> = []

      for (const [groupName, group] of Object.entries(registry.data.groups)) {
        const promptCount = group.prompts.length
        totalPrompts += promptCount
        if (group.enabled) {
          enabledPrompts += promptCount
        }
        groupStats.push({
          name: groupName,
          enabled: group.enabled,
          promptCount
        })
      }

      // Count partials
      const partialsEnabled = registry.data.partials?.enabled ?? false
      const partialsPath = registry.data.partials?.path ?? 'partials'
      const partials = partialsEnabled ? validatePartials(resolvedPath, partialsPath) : []
      const partialCount = partials.length

      const stats = {
        repository: {
          path: resolvedPath,
          version: registry.data.version
        },
        groups: {
          total: Object.keys(registry.data.groups).length,
          enabled: groupStats.filter(g => g.enabled).length,
          disabled: groupStats.filter(g => !g.enabled).length,
          details: groupStats
        },
        prompts: {
          total: totalPrompts,
          enabled: enabledPrompts,
          disabled: totalPrompts - enabledPrompts
        },
        partials: {
          enabled: partialsEnabled,
          path: partialsPath,
          count: partialCount
        }
      }

      spinner.succeed('Statistics collected!')

      if (options.format === 'json') {
        writeOutput(stats, options)
      } else {
        // eslint-disable-next-line no-console
        console.log('\nRepository Statistics:')
        // eslint-disable-next-line no-console
        console.log(`  Path: ${stats.repository.path}`)
        // eslint-disable-next-line no-console
        console.log(`  Version: ${stats.repository.version}`)
        // eslint-disable-next-line no-console
        console.log('\nGroups:')
        // eslint-disable-next-line no-console
        console.log(`  Total: ${stats.groups.total}`)
        // eslint-disable-next-line no-console
        console.log(`  Enabled: ${stats.groups.enabled}`)
        // eslint-disable-next-line no-console
        console.log(`  Disabled: ${stats.groups.disabled}`)
        // eslint-disable-next-line no-console
        console.log('\nPrompts:')
        // eslint-disable-next-line no-console
        console.log(`  Total: ${stats.prompts.total}`)
        // eslint-disable-next-line no-console
        console.log(`  Enabled: ${stats.prompts.enabled}`)
        // eslint-disable-next-line no-console
        console.log(`  Disabled: ${stats.prompts.disabled}`)
        // eslint-disable-next-line no-console
        console.log('\nPartials:')
        // eslint-disable-next-line no-console
        console.log(`  Enabled: ${stats.partials.enabled ? 'Yes' : 'No'}`)
        if (stats.partials.enabled) {
          // eslint-disable-next-line no-console
          console.log(`  Path: ${stats.partials.path}`)
          // eslint-disable-next-line no-console
          console.log(`  Count: ${stats.partials.count}`)
        }
      }

      process.exit(0)
    } catch (error) {
      spinner.fail('Statistics collection error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

