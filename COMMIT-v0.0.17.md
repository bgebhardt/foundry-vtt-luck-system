# Git Commit Message for v0.0.17

```
Release v0.0.17 - UI improvements and help system

Add UI enhancements and in-game help documentation for luck point rules:
- Add minus button to decrease luck points manually
- Improve luck value visibility with red background matching D&D 5e sheet
- Add help button in spend dialog showing formatted luck point rules
- Reference Black Flag Roleplaying rules with link to source PDF

UI Changes:
- Added decrease luck point button with minus icon
- Updated luck value display with red background (#c53131) for better visibility
- Added white text and bold formatting to luck value
- Expanded button row to include minus, plus, and spend buttons

Help System:
- Created showLuckRules() function displaying formatted rules dialog
- Added help button with question mark icon to spend dialog
- Formatted rules with sections for gaining, losing, and spending luck
- Included attribution and link to Kobold Press Black Flag Roleplaying PDF

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## To commit:

```bash
git add module.json luck-system.js luck-system.css
git commit -m "$(cat <<'EOF'
Release v0.0.17 - UI improvements and help system

Add UI enhancements and in-game help documentation for luck point rules:
- Add minus button to decrease luck points manually
- Improve luck value visibility with red background matching D&D 5e sheet
- Add help button in spend dialog showing formatted luck point rules
- Reference Black Flag Roleplaying rules with link to source PDF

UI Changes:
- Added decrease luck point button with minus icon
- Updated luck value display with red background (#c53131) for better visibility
- Added white text and bold formatting to luck value
- Expanded button row to include minus, plus, and spend buttons

Help System:
- Created showLuckRules() function displaying formatted rules dialog
- Added help button with question mark icon to spend dialog
- Formatted rules with sections for gaining, losing, and spending luck
- Included attribution and link to Kobold Press Black Flag Roleplaying PDF

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```
