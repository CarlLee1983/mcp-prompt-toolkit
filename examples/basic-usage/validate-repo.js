/**
 * Basic Example: Validate a Prompt Repository
 * 
 * This example demonstrates how to use the programmatic API
 * to validate an entire prompt repository.
 */

import { validatePromptRepo } from '@carllee1983/prompt-toolkit'

// Validate the repository
const result = validatePromptRepo('./my-prompt-repo')

if (result.passed) {
  console.log('✅ Repository validation passed!')
  console.log('Summary:', result.summary)
} else {
  console.error('❌ Repository validation failed!')
  console.error(`Found ${result.errors.length} error(s)`)
  
  // Display errors grouped by severity
  const fatalErrors = result.errors.filter(e => e.severity === 'fatal')
  const errorErrors = result.errors.filter(e => e.severity === 'error')
  const warnings = result.errors.filter(e => e.severity === 'warning')
  
  if (fatalErrors.length > 0) {
    console.error('\n🔴 Fatal Errors:')
    fatalErrors.forEach(err => {
      console.error(`  - ${err.code}: ${err.message}`)
      if (err.hint) console.error(`    Hint: ${err.hint}`)
    })
  }
  
  if (errorErrors.length > 0) {
    console.error('\n❌ Errors:')
    errorErrors.forEach(err => {
      console.error(`  - ${err.code}: ${err.message}`)
      if (err.file) console.error(`    File: ${err.file}`)
    })
  }
  
  if (warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    warnings.forEach(err => {
      console.warn(`  - ${err.code}: ${err.message}`)
    })
  }
  
  console.error('\nSummary:', result.summary)
  process.exit(1)
}

