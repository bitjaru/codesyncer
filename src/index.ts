#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from './commands/init';
import { updateCommand } from './commands/update';
import { addRepoCommand } from './commands/add-repo';

const program = new Command();

program
  .name('codesyncer')
  .description('AI-powered multi-repository collaboration system')
  .version('1.0.0 (Currently supports: Claude Code only)\n\n' +
    chalk.gray('Want to add support for Cursor, GitHub Copilot, or other AI tools?\n') +
    chalk.gray('We welcome contributions! https://github.com/bitjaru/codesyncer-cli'))
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
  .action(updateCommand);

program
  .command('add-repo')
  .description('Add a new repository to the workspace')
  .option('-l, --lang <language>', 'Language (en/ko)', 'en')
  .option('-a, --ai <tool>', 'AI tool (currently: claude only)', 'claude')
  .action(addRepoCommand);

program.parse(process.argv);
