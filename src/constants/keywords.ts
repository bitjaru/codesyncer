import { KeywordCategory, KeywordSeverity, ProjectType } from '../types';

/**
 * Default keyword configurations for discussion triggers
 * Organized by category and severity level
 */

export const DEFAULT_KEYWORD_CATEGORIES: KeywordCategory[] = [
  {
    name: 'Payment & Billing',
    nameKo: '결제/과금',
    severity: 'CRITICAL',
    keywords: ['payment', 'pay', 'purchase', 'checkout', 'billing', 'subscription', 'charge', 'refund', 'cancel', '결제', '구매', '입금', '환불', '취소', '과금', '구독'],
    description: 'Payment processing and billing operations',
    descriptionKo: '결제 처리 및 과금 작업',
    applicableTo: ['backend', 'frontend', 'fullstack'],
    enabled: true,
  },
  {
    name: 'Authentication & Authorization',
    nameKo: '인증/권한',
    severity: 'CRITICAL',
    keywords: ['auth', 'login', 'logout', 'signin', 'signup', 'permission', 'role', 'access', 'admin', 'superuser', '인증', '로그인', '회원가입', '권한', '역할', '관리자'],
    description: 'User authentication and authorization',
    descriptionKo: '사용자 인증 및 권한 관리',
    applicableTo: ['backend', 'frontend', 'mobile', 'fullstack'],
    enabled: true,
  },
  {
    name: 'Security & Encryption',
    nameKo: '보안/암호화',
    severity: 'CRITICAL',
    keywords: ['security', 'encrypt', 'decrypt', 'hash', 'secret', 'key', 'token', 'cors', 'csrf', 'jwt', 'oauth', '암호화', '비밀키', 'session', '세션'],
    description: 'Security configurations and encryption',
    descriptionKo: '보안 설정 및 암호화',
    applicableTo: ['backend', 'fullstack'],
    enabled: true,
  },
  {
    name: 'Data Deletion & Migration',
    nameKo: '데이터 삭제/마이그레이션',
    severity: 'CRITICAL',
    keywords: ['delete', 'remove', 'destroy', 'drop', 'truncate', 'migrate', 'migration', 'schema', 'alter table', '삭제', '제거', '마이그레이션', '스키마 변경'],
    description: 'Data deletion and schema changes',
    descriptionKo: '데이터 삭제 및 스키마 변경',
    applicableTo: ['backend', 'fullstack'],
    enabled: true,
  },
  {
    name: 'Privacy & Compliance',
    nameKo: '개인정보/법적 규정',
    severity: 'CRITICAL',
    keywords: ['personal data', 'GDPR', 'privacy', 'PII', 'terms', 'policy', 'agreement', 'compliance', 'regulation', '개인정보', '약관', '정책', '규정', '준수'],
    description: 'Privacy and legal compliance',
    descriptionKo: '개인정보 및 법적 규정 준수',
    applicableTo: ['backend', 'frontend', 'mobile', 'fullstack'],
    enabled: true,
  },
  {
    name: 'Pricing & Business Logic',
    nameKo: '가격/비즈니스 로직',
    severity: 'IMPORTANT',
    keywords: ['price', 'cost', 'fee', 'rate', 'order', 'transaction', 'inventory', 'stock', 'quantity', 'limit', 'quota', 'threshold', '가격', '비용', '수수료', '요금', '주문', '거래', '재고', '수량', '한도', '제한'],
    description: 'Pricing and core business logic',
    descriptionKo: '가격 및 핵심 비즈니스 로직',
    applicableTo: ['backend', 'frontend', 'fullstack'],
    enabled: false,  // Optional in quick setup
  },
  {
    name: 'External Integration',
    nameKo: '외부 연동',
    severity: 'IMPORTANT',
    keywords: ['third-party', 'external API', 'integration', 'webhook', 'callback', 'notification', 'email', 'SMS', 'push notification', '외부 연동', '웹훅', '콜백', '이메일', '문자', '푸시'],
    description: 'Third-party API and external services',
    descriptionKo: '외부 API 및 서비스 연동',
    applicableTo: ['backend', 'fullstack'],
    enabled: false,
  },
  {
    name: 'Deployment & Infrastructure',
    nameKo: '배포/인프라',
    severity: 'IMPORTANT',
    keywords: ['deploy', 'deployment', 'release', 'production', 'environment', 'config', 'env variable', 'database config', 'DB setup', 'connection', '배포', '프로덕션', '환경변수', '설정', '데이터베이스 설정'],
    description: 'Deployment and infrastructure changes',
    descriptionKo: '배포 및 인프라 변경',
    applicableTo: ['backend', 'fullstack'],
    enabled: false,
  },
];

/**
 * Quick setup preset - includes ALL keyword categories (auto-enabled)
 */
export function getQuickSetupKeywords(projectType: ProjectType): KeywordCategory[] {
  return DEFAULT_KEYWORD_CATEGORIES
    .filter(cat => cat.applicableTo.includes(projectType))
    .map(cat => ({ ...cat, enabled: true })); // Force enable all for quick setup
}

/**
 * Expert setup - user can select categories and add custom keywords
 */
export function getExpertSetupKeywords(projectType: ProjectType): KeywordCategory[] {
  return DEFAULT_KEYWORD_CATEGORIES
    .filter(cat => cat.applicableTo.includes(projectType));
}

/**
 * Format keywords for template insertion
 */
export function formatKeywordsForTemplate(categories: KeywordCategory[], lang: 'ko' | 'en'): string {
  const enabledCategories = categories.filter(cat => cat.enabled);

  return enabledCategories.map(cat => {
    const name = lang === 'ko' ? cat.nameKo : cat.name;
    const desc = lang === 'ko' ? cat.descriptionKo : cat.description;
    const keywords = cat.keywords.slice(0, 10).join(', '); // Limit display for readability

    return `- **${name}** (${cat.severity}): ${keywords}${cat.keywords.length > 10 ? ', ...' : ''}\n  _${desc}_`;
  }).join('\n\n');
}

/**
 * Get default tech stack by project type
 */
export function getDefaultTechStack(type: ProjectType): string[] {
  const techStackMap: Record<ProjectType, string[]> = {
    frontend: ['React', 'TypeScript', 'Vite'],
    backend: ['Node.js', 'Express', 'TypeScript'],
    mobile: ['React Native', 'TypeScript'],
    fullstack: ['Next.js', 'TypeScript', 'Prisma'],
  };

  return techStackMap[type] || ['TypeScript'];
}
