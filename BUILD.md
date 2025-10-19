# Build and Installation Guide

This guide explains how to build and install the Luck System module for Foundry Virtual Tabletop.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Building the Module](#building-the-module)
- [Installation Methods](#installation-methods)
- [Development Setup](#development-setup)
- [Creating a Release](#creating-a-release)
- [Troubleshooting](#troubleshooting)

## Prerequisites

This module is a simple client-side module that requires no build process or compilation. You only need:

- Foundry Virtual Tabletop V12 or higher
- D&D 5e System v3.3.1 or higher
- Basic familiarity with file systems and directories

## Building the Module

**Good news:** This module requires **no build step**! It's pure JavaScript and CSS, ready to use as-is.

The module consists of only three essential files:
- `module.json` - Module manifest
- `luck-system.js` - Main module code
- `luck-system.css` - Styling

## Installation Methods

### Method 1: Manual Installation (Development/Testing)

1. **Locate your Foundry Data folder:**
   - **Windows:** `%localappdata%/FoundryVTT/Data`
   - **macOS:** `~/Library/Application Support/FoundryVTT/Data`
   - **Linux:** `~/.local/share/FoundryVTT/Data`

2. **Navigate to the modules directory:**
   ```bash
   cd [FoundryData]/Data/modules
   ```

3. **Create a directory for the module:**
   ```bash
   mkdir luck-system
   ```

4. **Copy the module files:**
   Copy these files from your repository into the `luck-system` directory:
   - `module.json`
   - `luck-system.js`
   - `luck-system.css`

   ```bash
   # From your repository directory:
   cp module.json luck-system.js luck-system.css [FoundryData]/Data/modules/luck-system/
   ```

5. **Restart Foundry VTT** (if it's running)

6. **Enable the module:**
   - Launch/create a world
   - Go to **Game Settings** → **Manage Modules**
   - Find "Luck System" and check the box to enable it
   - Click **Save Module Settings**

### Method 2: Install via Manifest URL (Recommended for Users)

1. **In Foundry VTT**, go to **Game Settings** → **Manage Modules**
2. Click **Install Module**
3. Paste the manifest URL in the field at the bottom:
   ```
   https://raw.githubusercontent.com/sgeep/foundry-vtt-luck-system/main/module.json
   ```
4. Click **Install**
5. Enable the module in your world

### Method 3: Symlink for Development (Advanced)

If you're actively developing the module, symlinks allow you to edit files in your repository and see changes immediately in Foundry.

**macOS/Linux:**
```bash
ln -s /path/to/your/foundry-vtt-luck-system ~/Library/Application\ Support/FoundryVTT/Data/modules/luck-system
```

**Windows (Command Prompt as Administrator):**
```cmd
mklink /D "%localappdata%\FoundryVTT\Data\modules\luck-system" "C:\path\to\your\foundry-vtt-luck-system"
```

**Windows (PowerShell as Administrator):**
```powershell
New-Item -ItemType SymbolicLink -Path "$env:LOCALAPPDATA\FoundryVTT\Data\modules\luck-system" -Target "C:\path\to\your\foundry-vtt-luck-system"
```

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/sgeep/foundry-vtt-luck-system.git
cd foundry-vtt-luck-system
```

### 2. Set Up Symlink (Optional but Recommended)

Follow the symlink instructions in [Method 3](#method-3-symlink-for-development-advanced) above.

### 3. Edit and Test

1. Make changes to `luck-system.js`, `luck-system.css`, or `module.json`
2. In Foundry VTT, press **F5** to reload the page
3. Changes should be reflected immediately

### 4. Debugging

- Open the browser console (**F12** or **Ctrl+Shift+I**)
- Look for messages prefixed with `luck-system |`
- Version information is logged on module initialization:
  ```
  luck-system | Module initialized
  luck-system | Foundry VTT version: 12.331
  luck-system | D&D 5e system version: 3.3.1
  ```

## Creating a Release

### Preparing a Release

1. **Update version number** in `module.json`:
   ```json
   "version": "0.0.16"
   ```

2. **Test thoroughly:**
   - Test in Foundry V12 and V13 (if possible)
   - Test with D&D 5e v3.3.1 and newer versions
   - Verify all features work:
     - Adding luck points
     - Spending luck points (bonus)
     - Spending luck points (reroll)
     - Luck burst mechanic
     - UI displays correctly

3. **Commit changes:**
   ```bash
   git add module.json luck-system.js luck-system.css
   git commit -m "Release v0.0.16"
   git push origin main
   ```

4. **Create a Git tag:**
   ```bash
   git tag v0.0.16
   git push origin v0.0.16
   ```

### GitHub Release (Recommended)

1. Go to your repository on GitHub
2. Click **Releases** → **Draft a new release**
3. Choose the tag you just created (e.g., `v0.0.16`)
4. Fill in release notes
5. Attach a ZIP file of the module files (see below)
6. Click **Publish release**

### Creating a Distribution ZIP

Create a ZIP file containing only the essential files:

```bash
# From the repository root:
zip -r luck-system-v0.0.16.zip module.json luck-system.js luck-system.css
```

Or manually:
1. Create a folder named `luck-system`
2. Copy `module.json`, `luck-system.js`, and `luck-system.css` into it
3. ZIP the folder
4. Rename to `luck-system-v0.0.16.zip`

### Update module.json Download URL

After creating a GitHub release, update the `download` URL in `module.json`:

```json
"download": "https://github.com/sgeep/foundry-vtt-luck-system/releases/download/v0.0.16/luck-system-v0.0.16.zip"
```

## File Structure

Your module directory should look like this:

```
luck-system/
├── module.json           # Module manifest (required)
├── luck-system.js        # Main module code (required)
├── luck-system.css       # Styling (required)
├── README.md             # Documentation (optional)
├── LICENSE               # License file (optional)
├── BUILD.md              # This file (optional)
└── COMPATIBILITY-V12.md  # Compatibility notes (optional)
```

**Required files for Foundry:**
- `module.json`
- `luck-system.js`
- `luck-system.css`

**Documentation files (not loaded by Foundry):**
- `README.md`
- `LICENSE`
- `BUILD.md`
- `COMPATIBILITY-V12.md`

## Troubleshooting

### Module Doesn't Appear in Foundry

**Problem:** The module doesn't show up in the module list.

**Solutions:**
1. Verify the folder name is exactly `luck-system` (matches the `id` in module.json)
2. Check that `module.json` is valid JSON (use a JSON validator)
3. Restart Foundry VTT completely
4. Check the browser console for errors

### UI Doesn't Appear on Character Sheet

**Problem:** The luck system UI doesn't show on the character sheet.

**Solutions:**
1. Verify you're using D&D 5e system v3.3.1+
2. Check the browser console for warnings like:
   ```
   luck-system | Could not find inspiration element in character sheet
   ```
3. Make sure you've enabled the module for the current world
4. Try refreshing the page (F5)

### Changes Don't Appear After Editing

**Problem:** Your code changes aren't reflected in Foundry.

**Solutions:**
1. Press **F5** to hard-refresh the page
2. Try **Ctrl+Shift+R** (or **Cmd+Shift+R** on macOS) for a cache-busting refresh
3. Check that you're editing the correct files (in the modules directory)
4. If using symlinks, verify the symlink is working

### Module.json Errors

**Problem:** Foundry shows errors about module.json.

**Solutions:**
1. Validate your JSON at [jsonlint.com](https://jsonlint.com/)
2. Check for:
   - Missing commas
   - Extra commas (especially after last item in arrays/objects)
   - Incorrect quotes (must use double quotes `"`)
   - Unclosed brackets or braces

### Version Compatibility Issues

**Problem:** Module doesn't work in V12 or V13.

**Solutions:**
1. Check the console for version information:
   ```
   luck-system | Foundry VTT version: X.XXX
   luck-system | D&D 5e system version: X.X.X
   ```
2. Verify `module.json` has correct compatibility settings
3. See [COMPATIBILITY-V12.md](COMPATIBILITY-V12.md) for detailed compatibility info

## Testing Checklist

Before releasing a new version, verify:

- [ ] Module loads without errors in Foundry V12
- [ ] Module loads without errors in Foundry V13
- [ ] Works with D&D 5e v3.3.1
- [ ] Luck UI appears on character sheet
- [ ] Add luck point button works
- [ ] Spend luck dialog opens and works
- [ ] Spending 1-5 points for bonus works
- [ ] Spending 3 points for reroll works
- [ ] Luck burst (6th point) mechanic works
- [ ] GM whisper messages work correctly
- [ ] Version information logs correctly
- [ ] No console errors
- [ ] `module.json` is valid JSON
- [ ] Version number updated in `module.json`

## Resources

- [Foundry VTT Module Development Guide](https://foundryvtt.com/article/module-development/)
- [Foundry VTT API Documentation](https://foundryvtt.com/api/)
- [D&D 5e System Repository](https://github.com/foundryvtt/dnd5e)
- [Module Manifest Documentation](https://foundryvtt.com/article/module-development/#manifest)

## Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/sgeep/foundry-vtt-luck-system.git

# Copy files to Foundry (macOS example)
cp module.json luck-system.js luck-system.css ~/Library/Application\ Support/FoundryVTT/Data/modules/luck-system/

# Create symlink (macOS)
ln -s $(pwd) ~/Library/Application\ Support/FoundryVTT/Data/modules/luck-system

# Create release ZIP
zip -r luck-system.zip module.json luck-system.js luck-system.css

# Create git tag
git tag v0.0.16
git push origin v0.0.16
```

## Support

If you encounter issues:

1. Check the browser console (F12) for error messages
2. Review the [COMPATIBILITY-V12.md](COMPATIBILITY-V12.md) guide
3. Verify all files are in the correct location
4. Check that the module is enabled in your world
5. Report issues at: https://github.com/sgeep/foundry-vtt-luck-system/issues
