# VHS Demo Script for CodeSyncer
# https://github.com/charmbracelet/vhs

Output demo.gif
Output demo.mp4

Set FontSize 16
Set Width 1000
Set Height 600
Set Theme "Dracula"
Set Padding 20
Set Shell "bash"

# Setup: Create and enter test directory
Hide
Type "cd /tmp && rm -rf codesyncer-demo && mkdir codesyncer-demo && cd codesyncer-demo && git init -q"
Enter
Sleep 500ms
Type "clear"
Enter
Show
Sleep 500ms

# Title
Type "# CodeSyncer - AI Coding Assistant Memory System"
Enter
Sleep 1s

# Show version
Type "codesyncer -v"
Enter
Sleep 2s

# Init command
Type "codesyncer init"
Enter
Sleep 2s

# Select English (default is already English, just press Enter)
Enter
Sleep 1s

# Project name (Enter for default)
Enter
Sleep 500ms

# GitHub username (type demo username)
Type "demo-user"
Enter
Sleep 2s

# Show result
Type "# ✅ Setup complete! Let's check the files:"
Enter
Sleep 1s

Type "ls -la .claude/"
Enter
Sleep 2s

Type "head -30 CLAUDE.md"
Enter
Sleep 3s

# Final step - show what to do next
Type "# Next step: Run 'claude' and type:"
Enter
Sleep 500ms
Type "# Read .claude/SETUP_GUIDE.md and follow the instructions"
Enter
Sleep 3s
