/**
 * Basic Example: Validate Registry File
 * 
 * This example demonstrates how to validate a registry.yaml file
 * and check if all referenced files exist.
 */

import { validateRegistry } from '@carllee1983/prompt-toolkit'

const registryPath = './registry.yaml'
const repoRoot = '.'

const result = validateRegistry(registryPath, repoRoot)

if (result.success) {
  console.log('✅ Registry is valid!')
  console.log('Version:', result.data.version)
  console.log('Groups:', Object.keys(result.data.groups))
  
  // Count prompts
  let totalPrompts = 0
  for (const group of Object.values(result.data.groups)) {
    if (group.enabled) {
      totalPrompts += group.prompts.length
    }
  }
  console.log('Total enabled prompts:', totalPrompts)
} else {
  console.error('❌ Registry validation failed!')
  result.errors?.forEach(err => {
    console.error(`  [${err.severity.toUpperCase()}] ${err.code}: ${err.message}`)
    if (err.file) {
      console.error(`    File: ${err.file}`)
    }
    if (err.hint) {
      console.error(`    Hint: ${err.hint}`)
    }
  })
  process.exit(1)
}

