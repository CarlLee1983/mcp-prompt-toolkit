/**
 * Advanced Example: Custom Error Handler
 * 
 * This example demonstrates how to implement custom error handling
 * and filtering based on severity levels.
 */

import { validatePromptRepo, ERROR_CODE_CONSTANTS } from '@carllee1983/prompt-toolkit'

// Custom error handler with severity filtering
function handleValidationErrors(result, options = {}) {
  const {
    minSeverity = 'error',
    onFatal,
    onError,
    onWarning,
    onInfo
  } = options

  const severityLevels = {
    fatal: -1,
    error: 0,
    warning: 1,
    info: 2
  }

  const minLevel = severityLevels[minSeverity]

  // Filter errors by minimum severity
  const filteredErrors = result.errors.filter(
    err => severityLevels[err.severity] <= minLevel
  )

  // Group errors by severity
  const errorsBySeverity = {
    fatal: filteredErrors.filter(e => e.severity === 'fatal'),
    error: filteredErrors.filter(e => e.severity === 'error'),
    warning: filteredErrors.filter(e => e.severity === 'warning'),
    info: filteredErrors.filter(e => e.severity === 'info')
  }

  // Handle fatal errors
  if (errorsBySeverity.fatal.length > 0) {
    console.error('🔴 Fatal errors detected:')
    errorsBySeverity.fatal.forEach(err => {
      console.error(`  - ${err.code}: ${err.message}`)
      if (err.hint) console.error(`    💡 ${err.hint}`)
    })
    if (onFatal) onFatal(errorsBySeverity.fatal)
    return false
  }

  // Handle regular errors
  if (errorsBySeverity.error.length > 0) {
    console.error('❌ Validation errors:')
    errorsBySeverity.error.forEach(err => {
      console.error(`  - ${err.code}: ${err.message}`)
      if (err.file) console.error(`    📄 ${err.file}`)
    })
    if (onError) onError(errorsBySeverity.error)
  }

  // Handle warnings
  if (errorsBySeverity.warning.length > 0) {
    console.warn('⚠️  Warnings:')
    errorsBySeverity.warning.forEach(err => {
      console.warn(`  - ${err.code}: ${err.message}`)
    })
    if (onWarning) onWarning(errorsBySeverity.warning)
  }

  // Handle info messages
  if (errorsBySeverity.info.length > 0) {
    console.info('ℹ️  Info:')
    errorsBySeverity.info.forEach(err => {
      console.info(`  - ${err.code}: ${err.message}`)
    })
    if (onInfo) onInfo(errorsBySeverity.info)
  }

  return errorsBySeverity.error.length === 0
}

// Example usage
const result = validatePromptRepo('./my-prompt-repo', {
  minSeverity: 'warning' // Include warnings and errors
})

const isValid = handleValidationErrors(result, {
  minSeverity: 'error',
  onFatal: (errors) => {
    console.error('Fatal errors require immediate attention!')
    // Send alert, log to monitoring system, etc.
  },
  onError: (errors) => {
    console.error('Errors need to be fixed before deployment')
    // Log to error tracking system
  },
  onWarning: (warnings) => {
    console.warn('Warnings should be reviewed')
    // Log to review system
  }
})

if (!isValid) {
  process.exit(1)
}

console.log('✅ Validation passed!')
console.log('Summary:', result.summary)

