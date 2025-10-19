# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Foundry VTT module that replaces the D&D 5e Inspiration system with a Luck Point system based on Tales of the Valiant rules. The module:
- Hijacks the Inspiration UI element on character sheets and replaces it with a Luck Point tracker
- Uses Foundry actor flags for data persistence (`flags.luck-system.luckPoints` and `flags.luck-system.maxLuck`)
- Provides GM and player UI for adding/spending luck points
- Implements the "luck burst" mechanic (6th point rolls 1d4 for new total)

## Architecture

### No Build Process
This module requires **no build step**. It's pure JavaScript and CSS - what you see is what ships. To test changes:
1. Copy/symlink the module files to `[FoundryData]/Data/modules/luck-system/`
2. Refresh Foundry (F5) to reload
3. Check browser console for errors

### Core Components

**Data Layer:**
- `getLuckPoints(actor)` - Single source of truth for reading luck point values from actor flags
- All state stored in actor flags, no global state
- Initialization happens in `ready` hook for GM users only

**UI Injection:**
- `injectLuckUI(app, html)` - Replaces inspiration element with luck UI
- Registered on multiple hooks (`renderActorSheet5eCharacter`, `renderActorSheet5eCharacter2`, `renderCharacterActorSheet`, `renderActorSheet`) for cross-version compatibility
- Uses cascading selector fallbacks to find inspiration element across different D&D 5e system versions

**Core Logic:**
- `addLuckPoint(actor)` - Handles adding luck + burst mechanic (6th point → 1d4 roll)
- `openLuckDialog(actor)` - Modal dialog for spending luck points with inline form submission
- All chat messages for GM actions are whispered to GM only

### Key Design Patterns

**Multi-Hook Registration:** The module registers the same UI injection function across 4 different hooks to ensure compatibility with Foundry V12 and V13, plus different D&D 5e system versions.

**Selector Fallbacks:** UI injection tries multiple CSS selectors in sequence to locate the inspiration element, failing gracefully with console warnings if not found.

**jQuery/Native Hybrid:** Handles both jQuery objects (from older hooks) and native elements (from newer hooks) via `const htmlElement = html[0] || html`.

## Compatibility

**Current Target:**
- Foundry VTT: V12+ (verified on V12 and V13)
- D&D 5e System: v3.3.1+ (specified in `module.json` relationships)

**Compatibility Strategy:**
The module is designed to work across multiple Foundry/system versions simultaneously by:
1. Registering multiple hook types (V12, V13, and generic fallbacks)
2. Using cascading CSS selectors for UI elements
3. Using stable Foundry APIs (flags, Actor.updateDocuments, Dialog, ChatMessage)

See `COMPATIBILITY-V12.md` for detailed compatibility considerations.

## Common Development Tasks

### Testing Changes
1. Edit `luck-system.js` or `luck-system.css`
2. Press F5 in Foundry to reload
3. Check console for version info and warnings:
   ```
   luck-system | Module initialized
   luck-system | Foundry VTT version: X.XXX
   luck-system | D&D 5e system version: X.X.X
   ```

### Creating a Release
See `BUILD.md` for full release process. Key steps:
1. Update `version` in `module.json`
2. Test in both V12 and V13 if possible
3. Commit and create git tag: `git tag v0.0.X`
4. Create ZIP: `zip -r luck-system.zip module.json luck-system.js luck-system.css`
5. Update `download` URL in `module.json` to point to GitHub release

### Debugging UI Injection Issues
If the luck UI doesn't appear on character sheets:
1. Check console for: `luck-system | Could not find inspiration element in character sheet for [ActorName]`
2. Open browser DevTools and inspect the character sheet HTML structure
3. Look for elements with class `.inspiration` or `[data-attribute="inspiration"]`
4. Add new fallback selectors to `injectLuckUI()` if needed
5. Consider adding a new hook registration if the sheet type changed

## File Structure

- `module.json` - Foundry module manifest with compatibility settings and system relationships
- `luck-system.js` - All module logic (~240 lines, no dependencies)
- `luck-system.css` - UI styling for luck point display and buttons (~37 lines)

Documentation files (not loaded by Foundry):
- `README.md` - User-facing feature description
- `BUILD.md` - Installation and release process
- `COMPATIBILITY-V12.md` - Detailed V12 compatibility notes
- `LICENSE` - MIT license

## Important Constraints

**GM-Only Flag Initialization:** The `ready` hook only runs for GM users to prevent race conditions when initializing actor flags. Non-GM users read flags but never initialize them.

**Whispered Messages:** GM-triggered actions (like adding luck points) whisper to GM only via `ChatMessage.getWhisperRecipients("GM")` to keep meta-information private.

**Max 5 Luck Points:** The dialog form enforces a max of 5 points spent at once. The burst mechanic (6th point) is automatic when adding points beyond the max.

**Element Replacement:** The module uses `replaceWith()` to swap the inspiration element, which means it only runs once per sheet render. Sheet re-renders will re-inject the UI.

## Game Mechanics Reference

When modifying core logic, remember the Tales of the Valiant mechanics:
- Gain 1 LP on missed attack/save (manual GM action via UI, not automated)
- Max 5 LPs normally
- 6th LP triggers burst: roll 1d4, result becomes new total
- Spend 1-5 LP for +1 to +5 bonus on a d20 roll
- Spend 3 LP to reroll a d20 check
