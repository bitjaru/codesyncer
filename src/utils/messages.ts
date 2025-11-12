import { Language } from '../types';
import chalk from 'chalk';

export const messages = {
  ko: {
    // Header
    title: '🎵 CodeSyncer - AI 협업 시스템 설치',
    currentSupport: 'Claude Code만 지원',

    // Setup mode
    selectMode: '설치 모드를 선택하세요:',
    quickMode: '⚡ 퀵 설치',
    quickModeDesc: '레포 선택 + 기본 정보만 (빠른 시작, 나머지 자동 설정)',
    expertMode: '🔧 전문가 설치',
    expertModeDesc: '모든 옵션 세부 설정 (키워드, 기술스택 등)',

    // Quick setup
    quickTitle: '⚡ 퀵 설치 모드',
    quickDesc: '레포 선택과 기본 정보만 입력하세요. 나머지는 자동 설정됩니다.',

    // Expert setup
    expertTitle: '🔧 전문가 설치 모드',
    expertDesc: '모든 옵션을 세부적으로 설정할 수 있습니다.',

    // Common
    scanning: '레포지토리 스캔 중...',
    foundRepos: (count: number) => `${count}개의 레포지토리 발견`,
    noRepos: '현재 디렉토리에서 레포지토리를 찾을 수 없습니다.',
    noReposHint: '여러 레포지토리가 있는 워크스페이스에서 실행하세요.',
    foundReposTitle: '📁 발견된 레포지토리:',
    setupComplete: '(설정됨)',
    setupNew: '(신규)',

    // Repository selection
    selectRepos: 'CodeSyncer를 설정할 레포지토리 선택:',
    alreadySetup: '이미 설정됨',
    selectAtLeastOne: '최소 하나의 레포지토리를 선택하세요.',

    // Project info
    projectName: '프로젝트명:',
    projectNameRequired: '프로젝트명은 필수입니다',
    githubUsername: 'GitHub 사용자명:',
    githubUsernameRequired: 'GitHub 사용자명은 필수입니다',

    // Quick setup auto messages
    basicSetupComplete: '✓ 기본 설정 완료!',
    autoConfiguring: '🤖 나머지는 자동으로 설정 중...',
    autoProjectType: '  - 프로젝트 타입: 자동 감지',
    autoTechStack: '  - 기술 스택: 타입별 기본값',
    autoKeywords: '  - 의논 키워드: CRITICAL 등급만 활성화',

    // Expert setup
    repoDetailConfig: (name: string) => `📦 ${name} 상세 설정:`,
    description: '설명/역할:',
    projectType: '프로젝트 타입:',
    techStack: '기술 스택 (쉼표로 구분):',

    // Keywords
    keywordConfigTitle: '🔑 의논 필수 키워드 설정',
    keywordConfigDesc: '특정 키워드 감지 시 AI가 자동으로 작업을 중단하고 사용자와 의논합니다.',
    selectKeywordCategories: '활성화할 키워드 카테고리 선택:',
    addCustomKeywords: '커스텀 키워드를 추가하시겠습니까?',
    customKeywords: '커스텀 키워드 (쉼표로 구분):',
    customSeverity: '중요도:',
    customDescription: '설명:',

    // Generation
    generating: '📝 문서 생성 중...',
    settingUp: (name: string) => `${name} 설정 중...`,
    setupCompleted: (name: string) => `${name} 설정 완료`,

    // Success
    success: '✅ CodeSyncer 설정 완료!',
    createdStructure: '📁 생성된 구조:',
    masterSwitching: '(멀티 레포 전환 로직)',
    workspaceOverview: '(워크스페이스 개요)',
    codingRules: '(코딩 규칙)',
    commentGuide: '(주석 가이드)',
    projectStructure: '(프로젝트 구조)',
    decisionLog: '(의논 기록)',

    // Next steps
    nextSteps: '🚀 다음 단계:',
    step1: '이 워크스페이스에서 Claude Code 열기',
    step2: (name: string) => `Claude에게 말하기: "${name} 멀티 레포 모드 시작"`,
    step3: 'Claude가 자동으로 레포 간 전환합니다',

    // Tips
    quickTip: '💡 팁: 나중에 세부 설정을 변경하려면 각 레포의 .claude/CLAUDE.md를 수정하세요',
    tagCompatibility: '태그 호환성: @codesyncer-* 와 @claude-* 모두 사용 가능',

    // Overwrite
    overwriteWarning: 'CodeSyncer 마스터 설정이 이미 존재합니다. 덮어쓰시겠습니까?',
    setupCancelled: '설정이 취소되었습니다.',
  },

  en: {
    // Header
    title: '🎵 CodeSyncer - AI Collaboration System Setup',
    currentSupport: 'Currently supports: Claude Code only',

    // Setup mode
    selectMode: 'Select installation mode:',
    quickMode: '⚡ Quick Setup',
    quickModeDesc: 'Repository selection + basic info only (fast start, auto-configure the rest)',
    expertMode: '🔧 Expert Setup',
    expertModeDesc: 'Configure all options in detail (keywords, tech stack, etc.)',

    // Quick setup
    quickTitle: '⚡ Quick Setup Mode',
    quickDesc: 'Select repositories and enter basic info. Everything else will be configured automatically.',

    // Expert setup
    expertTitle: '🔧 Expert Setup Mode',
    expertDesc: 'Configure all options in detail.',

    // Common
    scanning: 'Scanning repositories...',
    foundRepos: (count: number) => `Found ${count} ${count === 1 ? 'repository' : 'repositories'}`,
    noRepos: 'No repositories found in current directory.',
    noReposHint: 'Make sure you run this command in a workspace with multiple repositories.',
    foundReposTitle: '📁 Found repositories:',
    setupComplete: '(configured)',
    setupNew: '(new)',

    // Repository selection
    selectRepos: 'Select repositories to set up CodeSyncer:',
    alreadySetup: 'Already configured',
    selectAtLeastOne: 'Please select at least one repository.',

    // Project info
    projectName: 'Project name:',
    projectNameRequired: 'Project name is required',
    githubUsername: 'GitHub username:',
    githubUsernameRequired: 'GitHub username is required',

    // Quick setup auto messages
    basicSetupComplete: '✓ Basic setup complete!',
    autoConfiguring: '🤖 Auto-configuring the rest...',
    autoProjectType: '  - Project type: Auto-detected',
    autoTechStack: '  - Tech stack: Default for each type',
    autoKeywords: '  - Discussion keywords: CRITICAL level only',

    // Expert setup
    repoDetailConfig: (name: string) => `📦 Configure ${name} in detail:`,
    description: 'Description/Role:',
    projectType: 'Project type:',
    techStack: 'Tech stack (comma-separated):',

    // Keywords
    keywordConfigTitle: '🔑 Discussion Keyword Configuration',
    keywordConfigDesc: 'When specific keywords are detected, AI will automatically pause and discuss with the user.',
    selectKeywordCategories: 'Select keyword categories to enable:',
    addCustomKeywords: 'Add custom keywords?',
    customKeywords: 'Custom keywords (comma-separated):',
    customSeverity: 'Severity:',
    customDescription: 'Description:',

    // Generation
    generating: '📝 Generating documentation...',
    settingUp: (name: string) => `Setting up ${name}...`,
    setupCompleted: (name: string) => `${name} setup completed`,

    // Success
    success: '✅ CodeSyncer setup complete!',
    createdStructure: '📁 Created structure:',
    masterSwitching: '(Multi-repo switching logic)',
    workspaceOverview: '(Workspace overview)',
    codingRules: '(Coding rules)',
    commentGuide: '(Comment guide)',
    projectStructure: '(Project structure)',
    decisionLog: '(Decision log)',

    // Next steps
    nextSteps: '🚀 Next steps:',
    step1: 'Open Claude Code in this workspace',
    step2: (name: string) => `Tell Claude: "${name} multi-repo mode start"`,
    step3: 'Start coding! Claude will automatically switch between repos',

    // Tips
    quickTip: '💡 Tip: To change detailed settings later, edit .claude/CLAUDE.md in each repository',
    tagCompatibility: 'Tag compatibility: Both @codesyncer-* and @claude-* tags are supported',

    // Overwrite
    overwriteWarning: 'CodeSyncer master setup already exists. Overwrite?',
    setupCancelled: 'Setup cancelled.',
  },
};

export function msg(lang: Language, key: string, ...args: string[]): string {
  const message = messages[lang][key as keyof typeof messages.ko];

  if (typeof message === 'function') {
    return (message as (...args: string[]) => string)(...args);
  }

  return message as string;
}
