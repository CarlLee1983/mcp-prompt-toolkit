/**
 * Basic Example: Validate a Single Prompt File
 * 
 * This example demonstrates how to validate a single prompt YAML file.
 */

import { validatePromptFile } from '@carllee1983/prompt-toolkit'

// Validate a single prompt file
const result = validatePromptFile('./my-prompt.yaml')

if (result.success) {
  console.log('✅ Prompt file is valid!')
  console.log('Prompt ID:', result.data.id)
  console.log('Title:', result.data.title)
  console.log('Description:', result.data.description)
  console.log('Arguments:', Object.keys(result.data.args))
} else {
  console.error('❌ Prompt file validation failed!')
  result.errors?.forEach(err => {
    console.error(`  [${err.severity.toUpperCase()}] ${err.code}: ${err.message}`)
    if (err.hint) {
      console.error(`    Hint: ${err.hint}`)
    }
    if (err.meta) {
      console.error('    Details:', err.meta)
    }
  })
  process.exit(1)
}

