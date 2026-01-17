# VHS Demo Script for CodeSyncer v3.0 (한국어)
# Run: vhs demo-ko.tape

Output demo-ko.gif
Output demo-ko.mp4

Set FontSize 20
Set Width 800
Set Height 550
Set Theme "Dracula"
Set Padding 40
Set Shell "bash"
Set TypingSpeed 80ms

# ============================================
# Setup (hidden)
# ============================================

Hide
Type "cd /tmp && rm -rf demo-project && mkdir demo-project && cd demo-project && git init -q && echo '{}' > package.json && clear"
Enter
Sleep 500ms
Show
Sleep 1.5s

# ============================================
# 1단계: 설치
# ============================================

Type "# 1단계: 설치"
Enter
Sleep 2s

Type "npm install -g codesyncer"
Enter
Sleep 3s

# ============================================
# 2단계: 초기화
# ============================================

Type "# 2단계: 초기화"
Enter
Sleep 2s

Type "codesyncer init"
Enter
Sleep 4s

# 언어 선택: 기본값 English에서 Up으로 한국어 선택
Up
Sleep 500ms
Enter
Sleep 3s

# 설정 시작? 예
Enter
Sleep 2s

# 프로젝트 이름: 기본값
Enter
Sleep 1s

# GitHub 사용자명
Type "your-name"
Enter
Sleep 5s

# ============================================
# 3단계: 완료!
# ============================================

Sleep 2s

Type "# 완료! Claude에게: 'CLAUDE.md 읽어줘'"
Enter
Sleep 4s
