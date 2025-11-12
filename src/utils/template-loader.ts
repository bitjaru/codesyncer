import * as fs from 'fs-extra';
import * as path from 'path';
import { Language, MasterDocConfig, RepoSetupConfig } from '../types';

/**
 * Load template file from templates directory
 */
export async function loadTemplate(templateName: string, lang: Language): Promise<string> {
  const templatePath = path.join(__dirname, '..', 'templates', lang, `${templateName}.md`);

  try {
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    throw new Error(`Template ${templateName} not found for language ${lang}`);
  }
}

/**
 * Replace variables in template with actual values
 */
export function replaceTemplateVars(template: string, vars: Record<string, string>): string {
  let result = template;

  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\[${key}\\]`, 'g');
    result = result.replace(regex, value);
  }

  // Replace [오늘 날짜] / [TODAY] with current date
  const today = new Date().toISOString().split('T')[0];
  result = result.replace(/\[오늘 날짜\]/g, today);
  result = result.replace(/\[TODAY\]/g, today);

  return result;
}

/**
 * Generate master document content
 */
export async function generateMasterDoc(config: MasterDocConfig): Promise<string> {
  const template = await loadTemplate('master', config.language);

  // Build repository table
  const repoTable = config.repositories
    .map((repo, index) => `| ${repo.name} | ${repo.folder} | ${repo.role} | ${repo.vibeSyncPath} |`)
    .join('\n');

  // Build keyword mapping
  const keywordMapping = config.repositories
    .map((repo) => {
      const keywords = getKeywordsForType(repo.type);
      return `| ${keywords} | ${repo.folder} | cd ${repo.folder} && cat CLAUDE.md |`;
    })
    .join('\n');

  const vars: Record<string, string> = {
    '프로젝트명': config.projectName,
    PROJECT_NAME: config.projectName,
    'GitHub username': config.githubUsername,
    GITHUB_USERNAME: config.githubUsername,
    REPO_TABLE: repoTable,
    KEYWORD_MAPPING: keywordMapping,
  };

  return replaceTemplateVars(template, vars);
}

/**
 * Generate repository-specific collaboration system docs
 */
export async function generateRepoDoc(
  docType: 'CLAUDE' | 'COMMENT_GUIDE' | 'ARCHITECTURE' | 'DECISIONS',
  config: RepoSetupConfig
): Promise<string> {
  const templateName = docType.toLowerCase();
  const template = await loadTemplate(templateName, config.language);

  const vars: Record<string, string> = {
    '프로젝트명': config.projectName,
    PROJECT_NAME: config.projectName,
    '기술 스택': config.techStack.join(', '),
    TECH_STACK: config.techStack.join(', '),
    PROJECT_TYPE: config.type,
    '프로젝트 타입': getProjectTypeKorean(config.type),
  };

  let result = replaceTemplateVars(template, vars);

  // For CLAUDE.md, add keywords and code templates
  if (docType === 'CLAUDE') {
    const keywords = formatKeywordsForDoc(config.keywordCategories, config.language);
    result = result.replace('[KEYWORDS]', keywords);

    const codeTemplates = generateCodeTemplates(config.techStack, config.language);
    result = result.replace('[TEMPLATES]', codeTemplates);
  }

  return result;
}

/**
 * Get keywords for project type
 */
function getKeywordsForType(type: 'frontend' | 'backend' | 'mobile' | 'fullstack'): string {
  const keywordMap = {
    backend: 'API, 서버, 엔드포인트, 백엔드, DB',
    frontend: '페이지, UI, 화면, 프론트, 컴포넌트',
    mobile: '앱, 모바일, 스크린',
    fullstack: '전체, 풀스택',
  };

  return keywordMap[type] || '';
}

/**
 * Get Korean translation for project type
 */
function getProjectTypeKorean(type: string): string {
  const typeMap: Record<string, string> = {
    frontend: '프론트엔드',
    backend: '백엔드',
    mobile: '모바일',
    fullstack: '풀스택',
  };

  return typeMap[type] || type;
}

/**
 * Format keyword categories for documentation
 */
function formatKeywordsForDoc(categories: any[], lang: Language): string {
  const enabledCategories = categories.filter((cat) => cat.enabled);

  return enabledCategories
    .map((cat) => {
      const name = lang === 'ko' ? cat.nameKo : cat.name;
      const desc = lang === 'ko' ? cat.descriptionKo : cat.description;
      const keywords = cat.keywords.slice(0, 10).join(', ');
      const moreIndicator = cat.keywords.length > 10 ? ', ...' : '';

      return `- **${name}** (${cat.severity}): ${keywords}${moreIndicator}\n  _${desc}_`;
    })
    .join('\n\n');
}

/**
 * Generate simple guidelines based on tech stack
 * Focus on comment tags and basic best practices only
 */
function generateCodeTemplates(techStack: string[], lang: Language): string {
  const hasJava = techStack.some((tech) => tech.toLowerCase().includes('java'));
  const hasPython = techStack.some((tech) => tech.toLowerCase().includes('python'));
  const hasReact = techStack.some((tech) => tech.toLowerCase().includes('react') || tech.toLowerCase().includes('next'));
  const hasTypeScript = techStack.some((tech) => tech.toLowerCase().includes('typescript'));

  if (hasJava) {
    return getJavaGuidelines(lang);
  } else if (hasPython) {
    return getPythonGuidelines(lang);
  } else if (hasReact) {
    return getReactGuidelines(lang);
  } else if (hasTypeScript) {
    return getTypeScriptGuidelines(lang);
  } else {
    return getGenericGuidelines(lang);
  }
}

/**
 * Java basic guidelines
 */
function getJavaGuidelines(lang: Language): string {
  if (lang === 'ko') {
    return `### ☕ Java 프로젝트 가이드

**주석 작성 예시:**
\`\`\`java
/**
 * 사용자 서비스
 *
 * @codesyncer-context 사용자 관리 비즈니스 로직
 * @codesyncer-rule 트랜잭션 관리 필수
 */
@Service
public class UserService {
    // @codesyncer-inference: BCrypt 사용 (보안 표준)
    private final PasswordEncoder passwordEncoder;

    // @codesyncer-todo: 이메일 중복 체크 추가 필요
    public User createUser(UserDto dto) {
        // @codesyncer-decision: [날짜] Soft Delete 방식 채택
        return userRepository.save(user);
    }
}
\`\`\`

**기본 원칙:**
- 모든 public 메서드에 JavaDoc 작성
- 추론한 내용은 \`@codesyncer-inference\` 태그로 명시
- 비즈니스 결정은 \`@codesyncer-decision\` 태그로 기록
- 확인 필요한 부분은 \`@codesyncer-todo\` 태그 추가`;
  } else {
    return `### ☕ Java Project Guidelines

**Comment Examples:**
\`\`\`java
/**
 * User service
 *
 * @codesyncer-context User management business logic
 * @codesyncer-rule Transaction management required
 */
@Service
public class UserService {
    // @codesyncer-inference: Using BCrypt (security standard)
    private final PasswordEncoder passwordEncoder;

    // @codesyncer-todo: Add email duplicate check
    public User createUser(UserDto dto) {
        // @codesyncer-decision: [DATE] Adopted soft delete pattern
        return userRepository.save(user);
    }
}
\`\`\`

**Basic Principles:**
- Write JavaDoc for all public methods
- Mark inferences with \`@codesyncer-inference\` tag
- Record decisions with \`@codesyncer-decision\` tag
- Use \`@codesyncer-todo\` for items needing confirmation`;
  }
}

/**
 * Python basic guidelines
 */
function getPythonGuidelines(lang: Language): string {
  if (lang === 'ko') {
    return `### 🐍 Python 프로젝트 가이드

**주석 작성 예시:**
\`\`\`python
"""
사용자 서비스

@codesyncer-context 사용자 관리 비즈니스 로직
@codesyncer-rule 모든 DB 작업은 async/await 사용
"""

class UserService:
    # @codesyncer-inference: bcrypt 사용 (보안 표준)
    def __init__(self, pwd_context: CryptContext):
        self.pwd_context = pwd_context

    async def create_user(self, data: CreateUserRequest):
        """
        사용자 생성

        @codesyncer-todo: 이메일 중복 체크 추가
        @codesyncer-decision: [날짜] Soft delete 패턴 채택
        """
        return await self.db.save(user)
\`\`\`

**기본 원칙:**
- 모든 함수/클래스에 docstring 작성
- 추론한 내용은 \`@codesyncer-inference\` 태그로 명시
- 비즈니스 결정은 \`@codesyncer-decision\` 태그로 기록
- 확인 필요한 부분은 \`@codesyncer-todo\` 태그 추가`;
  } else {
    return `### 🐍 Python Project Guidelines

**Comment Examples:**
\`\`\`python
"""
User service

@codesyncer-context User management business logic
@codesyncer-rule All DB operations use async/await
"""

class UserService:
    # @codesyncer-inference: Using bcrypt (security standard)
    def __init__(self, pwd_context: CryptContext):
        self.pwd_context = pwd_context

    async def create_user(self, data: CreateUserRequest):
        """
        Create user

        @codesyncer-todo: Add email duplicate check
        @codesyncer-decision: [DATE] Adopted soft delete pattern
        """
        return await self.db.save(user)
\`\`\`

**Basic Principles:**
- Write docstrings for all functions/classes
- Mark inferences with \`@codesyncer-inference\` tag
- Record decisions with \`@codesyncer-decision\` tag
- Use \`@codesyncer-todo\` for items needing confirmation`;
  }
}

/**
 * React basic guidelines
 */
function getReactGuidelines(lang: Language): string {
  if (lang === 'ko') {
    return `### ⚛️ React 프로젝트 가이드

**주석 작성 예시:**
\`\`\`tsx
/**
 * 사용자 목록 컴포넌트
 *
 * @codesyncer-context 사용자 관리 페이지
 * @codesyncer-inference React Query 사용 (데이터 페칭 표준)
 */
export default function UserList() {
  // @codesyncer-inference: 페이지 크기 20 (일반적인 UX)
  const [page, setPage] = useState(1);

  // @codesyncer-todo: 필터링 기능 추가 필요
  const { data } = useQuery(['users', page], fetchUsers);

  // @codesyncer-decision: [날짜] 테이블 레이아웃 채택 (UX팀 결정)
  return <UserTable data={data} />;
}
\`\`\`

**기본 원칙:**
- 모든 컴포넌트에 JSDoc 작성
- 추론한 내용은 \`@codesyncer-inference\` 태그로 명시
- 비즈니스 결정은 \`@codesyncer-decision\` 태그로 기록
- 확인 필요한 부분은 \`@codesyncer-todo\` 태그 추가`;
  } else {
    return `### ⚛️ React Project Guidelines

**Comment Examples:**
\`\`\`tsx
/**
 * User list component
 *
 * @codesyncer-context User management page
 * @codesyncer-inference Using React Query (data fetching standard)
 */
export default function UserList() {
  // @codesyncer-inference: Page size 20 (common UX)
  const [page, setPage] = useState(1);

  // @codesyncer-todo: Need to add filtering feature
  const { data } = useQuery(['users', page], fetchUsers);

  // @codesyncer-decision: [DATE] Adopted table layout (UX team decision)
  return <UserTable data={data} />;
}
\`\`\`

**Basic Principles:**
- Write JSDoc for all components
- Mark inferences with \`@codesyncer-inference\` tag
- Record decisions with \`@codesyncer-decision\` tag
- Use \`@codesyncer-todo\` for items needing confirmation`;
  }
}

/**
 * TypeScript basic guidelines
 */
function getTypeScriptGuidelines(lang: Language): string {
  if (lang === 'ko') {
    return `### 📘 TypeScript 프로젝트 가이드

**주석 작성 예시:**
\`\`\`typescript
/**
 * 사용자 서비스
 *
 * @codesyncer-context 사용자 관리 비즈니스 로직
 * @codesyncer-rule 모든 함수는 명시적 타입 정의
 */
export class UserService {
  // @codesyncer-inference: 싱글톤 패턴 사용 (리소스 관리)
  private static instance: UserService;

  // @codesyncer-todo: 에러 핸들링 개선 필요
  async createUser(data: CreateUserDto): Promise<User> {
    // @codesyncer-decision: [날짜] Prisma ORM 채택
    return await prisma.user.create({ data });
  }
}
\`\`\`

**기본 원칙:**
- 모든 함수에 타입 정의 및 JSDoc 작성
- 추론한 내용은 \`@codesyncer-inference\` 태그로 명시
- 비즈니스 결정은 \`@codesyncer-decision\` 태그로 기록
- 확인 필요한 부분은 \`@codesyncer-todo\` 태그 추가`;
  } else {
    return `### 📘 TypeScript Project Guidelines

**Comment Examples:**
\`\`\`typescript
/**
 * User service
 *
 * @codesyncer-context User management business logic
 * @codesyncer-rule All functions must have explicit types
 */
export class UserService {
  // @codesyncer-inference: Using singleton pattern (resource management)
  private static instance: UserService;

  // @codesyncer-todo: Need to improve error handling
  async createUser(data: CreateUserDto): Promise<User> {
    // @codesyncer-decision: [DATE] Adopted Prisma ORM
    return await prisma.user.create({ data });
  }
}
\`\`\`

**Basic Principles:**
- Write type definitions and JSDoc for all functions
- Mark inferences with \`@codesyncer-inference\` tag
- Record decisions with \`@codesyncer-decision\` tag
- Use \`@codesyncer-todo\` for items needing confirmation`;
  }
}

/**
 * Generic guidelines
 */
function getGenericGuidelines(lang: Language): string {
  if (lang === 'ko') {
    return `### 📝 코딩 가이드

**주석 작성 예시:**
\`\`\`
/**
 * 함수/클래스 설명
 *
 * @codesyncer-context 비즈니스 맥락 설명
 * @codesyncer-rule 특별한 규칙이 있다면 명시
 */

// @codesyncer-inference: 추론한 내용 (근거 포함)
// @codesyncer-decision: [날짜] 결정 사항 (이유 포함)
// @codesyncer-todo: 확인 필요한 내용
\`\`\`

**기본 원칙:**
- 모든 함수/클래스에 설명 주석 작성
- 추론한 내용은 \`@codesyncer-inference\` 태그로 명시
- 비즈니스 결정은 \`@codesyncer-decision\` 태그로 기록
- 확인 필요한 부분은 \`@codesyncer-todo\` 태그 추가`;
  } else {
    return `### 📝 Coding Guidelines

**Comment Examples:**
\`\`\`
/**
 * Function/Class description
 *
 * @codesyncer-context Business context explanation
 * @codesyncer-rule Specify special rules if any
 */

// @codesyncer-inference: Inferred content (with rationale)
// @codesyncer-decision: [DATE] Decision made (with reason)
// @codesyncer-todo: Items needing confirmation
\`\`\`

**Basic Principles:**
- Write descriptive comments for all functions/classes
- Mark inferences with \`@codesyncer-inference\` tag
- Record decisions with \`@codesyncer-decision\` tag
- Use \`@codesyncer-todo\` for items needing confirmation`;
  }
}
