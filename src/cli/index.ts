#!/usr/bin/env node

import { Command } from 'commander'
import { validateCommand } from './commands/validate'
import { checkCommand } from './commands/check'
import { listCommand } from './commands/list'
import { statsCommand } from './commands/stats'
import { readFileSync } from 'fs'
import { join } from 'path'

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf8')
)

const program = new Command()

program
  .name('prompt-toolkit')
  .description('Prompt repository governance toolkit for MCP')
  .version(packageJson.version)

// Register commands
program.addCommand(validateCommand)
program.addCommand(checkCommand)
program.addCommand(listCommand)
program.addCommand(statsCommand)

// Parse arguments
program.parse()

