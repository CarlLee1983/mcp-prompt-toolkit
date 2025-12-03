/**
 * Advanced Example: Error Code Checker
 * 
 * This example demonstrates how to check for specific error codes
 * and handle them programmatically.
 */

import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

const result = validatePromptRepo('./my-prompt-repo')

if (!result.passed) {
  // Check for specific error codes
  const registryNotFound = result.errors.some(
    e => e.code === ERROR_CODE_CONSTANTS.REGISTRY_FILE_NOT_FOUND
  )
  
  const missingPartials = result.errors.filter(
    e => e.code === ERROR_CODE_CONSTANTS.PARTIAL_NOT_FOUND
  )
  
  const circularDeps = result.errors.filter(
    e => e.code === ERROR_CODE_CONSTANTS.PARTIAL_CIRCULAR_DEPENDENCY
  )
  
  const schemaErrors = result.errors.filter(
    e => e.code === ERROR_CODE_CONSTANTS.PROMPT_SCHEMA_INVALID ||
         e.code === ERROR_CODE_CONSTANTS.REGISTRY_SCHEMA_INVALID
  )

  // Handle specific error types
  if (registryNotFound) {
    console.error('❌ Registry file is missing!')
    console.error('Please create a registry.yaml file in the repository root.')
    process.exit(1)
  }

  if (missingPartials.length > 0) {
    console.error(`❌ Found ${missingPartials.length} missing partial(s):`)
    missingPartials.forEach(err => {
      console.error(`  - ${err.meta?.partial}`)
      if (err.hint) console.error(`    ${err.hint}`)
    })
  }

  if (circularDeps.length > 0) {
    console.error(`❌ Found ${circularDeps.length} circular dependency(ies):`)
    circularDeps.forEach(err => {
      console.error(`  - ${err.message}`)
      if (err.meta?.chain) {
        console.error(`    Chain: ${err.meta.chain.join(' → ')}`)
      }
    })
  }

  if (schemaErrors.length > 0) {
    console.error(`❌ Found ${schemaErrors.length} schema validation error(s)`)
    schemaErrors.forEach(err => {
      console.error(`  - ${err.message}`)
      if (err.file) console.error(`    File: ${err.file}`)
    })
  }

  // Exit with appropriate code based on severity
  const hasFatal = result.summary.fatal > 0
  const hasErrors = result.summary.error > 0
  
  if (hasFatal) {
    console.error('\n🔴 Fatal errors detected. Cannot proceed.')
    process.exit(1)
  } else if (hasErrors) {
    console.error('\n❌ Validation errors found. Please fix before proceeding.')
    process.exit(1)
  } else {
    console.warn('\n⚠️  Only warnings found. Proceeding with caution.')
  }
} else {
  console.log('✅ All validations passed!')
  console.log('Summary:', result.summary)
}

