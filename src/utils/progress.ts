import chalk from 'chalk';
import { Language } from '../types';

export interface ProgressStep {
  id: string;
  label: {
    ko: string;
    en: string;
  };
}

const INIT_STEPS: ProgressStep[] = [
  { id: 'language', label: { ko: '언어 선택', en: 'Language' } },
  { id: 'project', label: { ko: '프로젝트 정보', en: 'Project Info' } },
  { id: 'scan', label: { ko: '워크스페이스 스캔', en: 'Workspace Scan' } },
  { id: 'select', label: { ko: '레포 선택', en: 'Select Repos' } },
  { id: 'generate', label: { ko: '파일 생성', en: 'Generate Files' } },
];

/**
 * Display progress bar for init steps
 */
export function displayProgress(currentStep: number, lang: Language = 'en'): void {
  const steps = INIT_STEPS;
  const total = steps.length;

  const progressParts: string[] = [];

  for (let i = 0; i < total; i++) {
    const step = steps[i];
    const label = lang === 'ko' ? step.label.ko : step.label.en;

    if (i < currentStep) {
      // Completed step
      progressParts.push(chalk.green(`✓ ${label}`));
    } else if (i === currentStep) {
      // Current step
      progressParts.push(chalk.cyan.bold(`● ${label}`));
    } else {
      // Future step
      progressParts.push(chalk.gray(`○ ${label}`));
    }
  }

  // Calculate progress percentage
  const percent = Math.round((currentStep / total) * 100);
  const progressBar = createProgressBar(percent);

  console.log();
  console.log(chalk.gray('─'.repeat(60)));
  console.log(`  ${progressBar} ${chalk.gray(`${percent}%`)}`);
  console.log(`  ${progressParts.join(chalk.gray(' → '))}`);
  console.log(chalk.gray('─'.repeat(60)));
  console.log();
}

/**
 * Create a visual progress bar
 */
function createProgressBar(percent: number): string {
  const width = 20;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  const filledBar = chalk.green('█'.repeat(filled));
  const emptyBar = chalk.gray('░'.repeat(empty));

  return `[${filledBar}${emptyBar}]`;
}

/**
 * Display step header
 */
export function displayStepHeader(stepNumber: number, totalSteps: number, title: string): void {
  console.log(chalk.bold.cyan(`\n[${stepNumber}/${totalSteps}] ${title}\n`));
}
