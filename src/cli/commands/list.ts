import { Command } from 'commander'
import path from 'path'
import fs from 'fs'
import { validateRegistry } from '../../validators/validateRegistry'
import { writeOutput, OutputFormat } from '../utils/output'
import { Logger } from '../utils/logger'
import ora from 'ora'

export const listCommand = new Command('list')
  .description('List prompt repository components')

listCommand
  .command('prompts')
  .description('List all prompts')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-g, --group <group-name>', 'Filter by group name')
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('--enabled-only', 'Show only enabled prompts', false)
  .action((repoPath: string, options: { group?: string; format: OutputFormat; enabledOnly: boolean }) => {
    const spinner = ora('Loading prompts...').start()

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
        Logger.error('Cannot list prompts: registry is invalid')
        process.exit(1)
      }

      const prompts: Array<{ group: string; file: string; enabled: boolean }> = []

      for (const [groupName, group] of Object.entries(registry.data.groups)) {
        if (options.group && groupName !== options.group) continue
        if (options.enabledOnly && !group.enabled) continue

        for (const file of group.prompts) {
          prompts.push({
            group: groupName,
            file,
            enabled: group.enabled
          })
        }
      }

      spinner.succeed(`Found ${prompts.length} prompt(s)!`)

      if (options.format === 'json') {
        writeOutput({ prompts, count: prompts.length }, options)
      } else {
        if (prompts.length === 0) {
          Logger.info('No prompts found')
        } else {
          // eslint-disable-next-line no-console
          console.log('\nPrompts:')
          for (const prompt of prompts) {
            const status = prompt.enabled ? '✓' : '✗'
            // eslint-disable-next-line no-console
            console.log(`  ${status} [${prompt.group}] ${prompt.file}`)
          }
        }
      }

      process.exit(0)
    } catch (error) {
      spinner.fail('List error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

listCommand
  .command('groups')
  .description('List all groups')
  .argument('[path]', 'Repository root path', process.cwd())
  .option('-f, --format <format>', 'Output format (text|json)', 'text')
  .option('--enabled-only', 'Show only enabled groups', false)
  .action((repoPath: string, options: { format: OutputFormat; enabledOnly: boolean }) => {
    const spinner = ora('Loading groups...').start()

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
        Logger.error('Cannot list groups: registry is invalid')
        process.exit(1)
      }

      const groups = Object.entries(registry.data.groups)
        .filter(([, group]) => !options.enabledOnly || group.enabled)
        .map(([name, group]) => ({
          name,
          path: group.path,
          enabled: group.enabled,
          promptCount: group.prompts.length
        }))

      spinner.succeed(`Found ${groups.length} group(s)!`)

      if (options.format === 'json') {
        writeOutput({ groups, count: groups.length }, options)
      } else {
        if (groups.length === 0) {
          Logger.info('No groups found')
        } else {
          // eslint-disable-next-line no-console
          console.log('\nGroups:')
          for (const group of groups) {
            const status = group.enabled ? '✓' : '✗'
            // eslint-disable-next-line no-console
            console.log(`  ${status} ${group.name} (${group.promptCount} prompts) - ${group.path}`)
          }
        }
      }

      process.exit(0)
    } catch (error) {
      spinner.fail('List error occurred')
      Logger.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    }
  })

