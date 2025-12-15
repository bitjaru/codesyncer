import inquirer from 'inquirer';
import { Language, InitOptions } from '../../types';

/**
 * Step 1: Language selection
 */
export async function selectLanguage(options: InitOptions): Promise<Language> {
  const { language } = await inquirer.prompt([
    {
      type: 'list',
      name: 'language',
      message: 'Select language / 언어 선택:',
      choices: [
        { name: '🇰🇷 한국어', value: 'ko' },
        { name: '🇺🇸 English', value: 'en' },
      ],
      default: options.lang || 'en',
    },
  ]);

  return language as Language;
}
