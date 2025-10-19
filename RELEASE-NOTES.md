# Release Notes

## Version 0.0.19 - Improved Visual Contrast

### What's New

- **Enhanced Visibility**: Luck container now has dark background with white text for better readability
- **Professional Styling**: Added padding, rounded corners, and subtle border
- **Better Contrast**: Dark gray background (`#1a1a1a`) easier on the eyes than pure black
- **Maintained Red Highlight**: Luck value keeps red background for emphasis

### Technical Details

- Container: Dark gray background with white text, 5px padding, 4px border radius
- Border: Subtle `#444` gray border for definition
- Luck value: Red background (`#c53131`) maintained for visibility
- Overall: More polished, professional appearance on character sheet

### Upgrade Notes

No breaking changes - simply update and existing luck point data will work unchanged.

---

## Version 0.0.18 - Help Button UX Improvement

### What's New

- **Compact Help Button**: Moved help button to top-right of spend dialog as a small question mark icon
- **Better Dialog Layout**: Help no longer takes up space in the bottom button row
- **Improved UX**: Help button stays visible while using the dialog, doesn't require reopening

### Technical Details

- Moved help button from dialog buttons to inline content area
- Styled as minimal icon button (18px, red color, no background)
- Added hover tooltip "Show Luck Rules"
- Help dialog opens without closing the spend dialog

### Upgrade Notes

No breaking changes - simply update and existing luck point data will work unchanged.

---

## Version 0.0.17 - UI Improvements and Help System

### What's New

- **Minus Button**: Added button to manually decrease luck points (GM control)
- **Better Visibility**: Luck value now has red background matching D&D 5e character sheet
- **In-Game Help**: Added help button in spend dialog showing formatted luck point rules
- **Rules Reference**: Linked to Black Flag Roleplaying PDF for official rules documentation

### Technical Details

- Added `decreaseLuckPoint()` function with validation to prevent negative luck points
- Updated CSS with red background (`#c53131`), white text, and better formatting
- Created `showLuckRules()` function displaying comprehensive rules dialog
- Three-button UI: minus, plus, and spend

### Upgrade Notes

No breaking changes - simply update and existing luck point data will work unchanged.

---

## Version 0.0.16 - Foundry V12 Compatibility Release

### What's New

- **Foundry V12 Support**: Module now compatible with Foundry VTT V12 and V13
- **D&D 5e v3.3.1+ Support**: Works with D&D 5e system v3.3.1 and newer versions
- **Multi-Hook Registration**: Registers with multiple character sheet hooks for broader compatibility across system versions
- **Robust UI Injection**: Added fallback selectors to find inspiration element in different sheet structures
- **Better Debugging**: Added version logging and improved console warnings
- **New Documentation**: Added BUILD.md, COMPATIBILITY-V12.md, and CLAUDE.md for developers

### Upgrade Notes

No breaking changes - simply update and existing luck point data will work unchanged.

### Credits

- Original module: **sgeep** (vibe coded with Gemini)
- V12 compatibility fork: **bgebhardt** (vibe coded with Claude)
