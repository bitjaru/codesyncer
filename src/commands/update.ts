import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs-extra';
import * as path from 'path';
import { UpdateOptions } from '../types';
import { scanForRepositories, hasMasterSetup } from '../utils/scanner';

export async function updateCommand(options: UpdateOptions) {
  console.log(chalk.bold.cyan('\n🔄 CodeSyncer - Update System\n'));

  const currentDir = process.cwd();

  // Check if master setup exists
  if (!(await hasMasterSetup(currentDir))) {
    console.log(chalk.red('✗ No CodeSyncer master setup found.'));
    console.log(chalk.gray('Run `codesyncer init` first.\n'));
    return;
  }

  const spinner = ora('Scanning for changes...').start();

  // Scan for repositories
  const foundRepos = await scanForRepositories(currentDir);

  // Read existing master doc to get current config
  const masterPath = path.join(currentDir, '.codesyncer', 'MASTER_CODESYNCER.md');
  let existingRepos: string[] = [];

  try {
    const masterContent = await fs.readFile(masterPath, 'utf-8');
    // Extract repository names from the master doc (simple parsing)
    const repoMatches = masterContent.match(/\|\s+([^|]+)\s+\|[^|]+\|[^|]+\|[^|]+\|/g);
    if (repoMatches) {
      existingRepos = repoMatches
        .slice(1) // Skip header
        .map((match) => match.split('|')[1].trim())
        .filter(Boolean);
    }
  } catch (error) {
    // Ignore if can't read
  }

  // Find new repositories
  const currentRepoNames = foundRepos.map((r) => r.name);
  const newRepos = foundRepos.filter((r) => !existingRepos.includes(r.name));
  const removedRepos = existingRepos.filter((name) => !currentRepoNames.includes(name));

  spinner.succeed('Scan complete');

  // Display changes
  if (newRepos.length === 0 && removedRepos.length === 0) {
    console.log(chalk.green('\n✓ Everything is up to date!\n'));
    console.log(chalk.gray(`  Total repositories: ${foundRepos.length}`));
    console.log(chalk.gray(`  With CodeSyncer setup: ${foundRepos.filter((r) => r.hasCodeSyncer).length}\n`));
    return;
  }

  console.log(chalk.bold('\n📊 Changes detected:\n'));

  if (newRepos.length > 0) {
    console.log(chalk.green(`  + ${newRepos.length} new repository(ies):`));
    newRepos.forEach((repo) => {
      console.log(chalk.gray(`    - ${repo.name} (${repo.type})`));
    });
    console.log();
  }

  if (removedRepos.length > 0) {
    console.log(chalk.yellow(`  - ${removedRepos.length} removed repository(ies):`));
    removedRepos.forEach((name) => {
      console.log(chalk.gray(`    - ${name}`));
    });
    console.log();
  }

  // Update workspace map
  const updateSpinner = ora('Updating WORKSPACE_MAP.md...').start();

  try {
    const workspaceMapPath = path.join(currentDir, '.codesyncer', 'WORKSPACE_MAP.md');
    const currentDate = new Date().toISOString().split('T')[0];

    // Simple update: add a note about the scan
    const updateNote = `\n## 🔄 Last Update: ${currentDate}\n\n`;
    const statsNote = `**Repositories found:** ${foundRepos.length}\n`;
    const newReposNote = newRepos.length > 0 ? `**New repositories:** ${newRepos.map((r) => r.name).join(', ')}\n` : '';

    // Append update info
    await fs.appendFile(workspaceMapPath, updateNote + statsNote + newReposNote);

    updateSpinner.succeed('Updated WORKSPACE_MAP.md');
  } catch (error) {
    updateSpinner.fail('Failed to update WORKSPACE_MAP.md');
  }

  console.log(chalk.bold.green('\n✅ Update complete!\n'));

  if (newRepos.length > 0) {
    console.log(chalk.bold('📝 Next steps:\n'));
    console.log(`  ${chalk.cyan('Run:')} codesyncer add-repo ${chalk.gray('(to set up new repositories)')}\n`);
  }
}
