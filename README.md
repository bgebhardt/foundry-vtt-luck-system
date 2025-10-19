# Luck System
A Foundry VTT module for the D&D 5e sheet that replaces the Inspiration system with Luck Points. Based on the Tales of the Valiant ruleset (and intended for 5e 2014 rules), it deactivates the Inspiration button and converts it to a player-spendable Luck Point tracker.

**Compatible with:** Foundry VTT V12+ and D&D 5e System v3.3.1+

Luck Point Mechanics:

* Gain 1 Luck Point (LP) on a missed attack or saving throw (max 5 LPs).

* If a player gains a sixth LP, roll a 1d4 - the outcome is their new LP total.

* Spend 1 LP for +1 to a d20 roll (after the roll).

* Spend 3 LPs to re-roll a d20 check.

## Installation

### Method 1: Install via Manifest URL (Recommended)

1. In Foundry VTT, go to **Game Settings** → **Manage Modules**
2. Click **Install Module**
3. Paste this manifest URL into the field at the bottom:
   ```
   https://raw.githubusercontent.com/bgebhardt/foundry-vtt-luck-system/main/module.json
   ```
4. Click **Install**
5. Enable the module in your world settings

### Method 2: Manual Installation

1. Download the [latest release](https://github.com/bgebhardt/foundry-vtt-luck-system/releases)
2. Extract the ZIP file to `[FoundryData]/Data/modules/luck-system/`
3. Restart Foundry VTT
4. Enable the module in **Game Settings** → **Manage Modules**

See [BUILD.md](BUILD.md) for more detailed installation instructions.

## Credits

Shamelessly vibe coded with Gemini for a group that I DM for. - **sgeep**

Forked and vibe coded more with Claude to add Foundry V12 and D&D 5e v3.3.1 compatibility. - **bgebhardt**
