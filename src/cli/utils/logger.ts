import chalk from 'chalk'

export class Logger {
  static success(message: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.green(`✓ ${message}`))
  }

  static error(message: string) {
    // eslint-disable-next-line no-console
    console.error(chalk.red(`✗ ${message}`))
  }

  static warning(message: string) {
    // eslint-disable-next-line no-console
    console.warn(chalk.yellow(`⚠ ${message}`))
  }

  static info(message: string) {
    // eslint-disable-next-line no-console
    console.log(chalk.blue(`ℹ ${message}`))
  }

  static log(message: string) {
    // eslint-disable-next-line no-console
    console.log(message)
  }
}

