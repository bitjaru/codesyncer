#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { updateCommand } from './commands/update';
import { addRepoCommand } from './commands/add-repo';
import { watchCommand } from './commands/watch';
import { validateCommand } from './commands/validate';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Read version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

/**
 * Format version output with system info
 */
function formatVersionOutput(): string {
  const nodeVersion = process.version;
  const platform = `${os.platform()} ${os.arch()}`;

  const lines = [
    `${chalk.bold.cyan('CodeSyncer')} ${chalk.green(`v${version}`)}`,
    '',
    chalk.gray(`Node.js:  ${nodeVersion}`),
    chalk.gray(`Platform: ${platform}`),
    '',
    chalk.bold('Supported AI Tools:'),
    `  ${chalk.green('✓')} Claude Code`,
    `  ${chalk.gray('○')} Cursor ${chalk.gray('(coming soon)')}`,
    `  ${chalk.gray('○')} GitHub Copilot ${chalk.gray('(coming soon)')}`,
    '',
    chalk.gray('Contributions welcome: https://github.com/bitjaru/codesyncer'),
  ];

  return lines.join('\n');
}

const program = new Command();

program
  .name('codesyncer')
  .description('AI-powered multi-repository collaboration system')
  .version(formatVersionOutput(), '-v, --version', 'Display version info')
  .addHelpText('after', `
${chalk.bold('Currently Supported AI Tools:')}
  ${chalk.green('✓')} Claude Code

${chalk.bold('Coming Soon (Community Contributions Welcome!):')}
  ${chalk.gray('○')} Cursor
  ${chalk.gray('○')} GitHub Copilot
  ${chalk.gray('○')} Continue.dev
  ${chalk.gray('○')} Codeium

${chalk.bold('Examples:')}
  $ codesyncer init              ${chalk.gray('# Initialize collaboration system')}
  $ codesyncer update            ${chalk.gray('# Update project structure')}
  $ codesyncer watch             ${chalk.gray('# Real-time file monitoring')}
  $ codesyncer validate          ${chalk.gray('# Validate setup and report issues')}
  $ codesyncer add-repo          ${chalk.gray('# Add new repository to workspace')}
  `);

program
  .command('init')
  .description('Initialize CodeSyncer collaboration system in current directory')
  .option('-l, --lang <language>', 'Language (en/ko)', 'en')
  .option('-a, --ai <tool>', 'AI tool (currently: claude only)', 'claude')
  .action(initCommand);

program
  .command('update')
  .description('Update project structure and documentation')
  .option('-a, --ai <tool>', 'AI tool (currently: claude only)', 'claude')
  .option('--hard', 'Deep scan and update all existing files (not just missing files)')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(updateCommand);

program
  .command('add-repo')
  .description('Add a new repository to the workspace')
  .option('-l, --lang <language>', 'Language (en/ko)', 'en')
  .option('-a, --ai <tool>', 'AI tool (currently: claude only)', 'claude')
  .action(addRepoCommand);

program
  .command('watch')
  .description('Watch for file changes and sync @codesyncer-* tags to documentation')
  .option('--log', 'Save logs to .codesyncer/watch-{date}.log')
  .action(watchCommand);

program
  .command('validate')
  .description('Validate CodeSyncer setup and report issues')
  .option('--verbose', 'Show detailed output including file paths')
  .action(validateCommand);

program.parse(process.argv);
