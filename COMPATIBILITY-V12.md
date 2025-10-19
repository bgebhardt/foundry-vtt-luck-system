# Foundry V12 & D&D 5e v3.3.1 Compatibility Guide

This document outlines the changes required to make the Luck System module compatible with Foundry Virtual Tabletop V12 and D&D 5e system version 3.3.1.

## Required Changes

### 1. Module Manifest (module.json)

**Current Configuration:**
```json
"compatibility": {
  "minimum": "13",
  "verified": "13"
}
```

**Required Changes:**
- Change `compatibility.minimum` from `"13"` to `"12"`
- Change `compatibility.verified` from `"13"` to `"12"`
- Add D&D 5e system dependency with version requirement

**Updated Configuration:**
```json
"compatibility": {
  "minimum": "12",
  "verified": "12"
},
"relationships": {
  "systems": [{
    "id": "dnd5e",
    "type": "system",
    "compatibility": {
      "minimum": "3.3.1",
      "verified": "3.3.1"
    }
  }]
}
```

### 2. Character Sheet Hook (luck-system.js:170)

**Current Implementation:**
```javascript
Hooks.on("renderCharacterActorSheet", (app, html) => {
```

**Potential Issue:**
The hook name `renderCharacterActorSheet` may need adjustment depending on the D&D 5e system version.

**Recommended Approach:**
Support multiple sheet types for broader compatibility:

```javascript
// Option 1: Support multiple specific hooks
Hooks.on("renderActorSheet5eCharacter", injectLuckUI);
Hooks.on("renderActorSheet5eCharacter2", injectLuckUI);

function injectLuckUI(app, html) {
  // existing code
}

// Option 2: Use generic hook with type checking
Hooks.on("renderActorSheet", (app, html) => {
  if (app.actor.type !== "character") return;
  if (game.system.id !== "dnd5e") return;
  // existing code
});
```

### 3. CSS Selector (luck-system.js:171)

**Current Implementation:**
```javascript
const inspirationContainer = html.querySelector('header.sheet-header .inspiration');
```

**Potential Issue:**
The selector `'header.sheet-header .inspiration'` relies on the D&D 5e sheet HTML structure, which may have changed between system versions.

**Recommended Approach:**
Add fallback selectors to handle different sheet structures:

```javascript
// Try multiple possible selectors
let inspirationContainer = html.querySelector('header.sheet-header .inspiration');
if (!inspirationContainer) {
  inspirationContainer = html.querySelector('.inspiration');
}
if (!inspirationContainer) {
  inspirationContainer = html.querySelector('[data-attribute="inspiration"]');
}
if (!inspirationContainer) {
  console.warn(`${MODULE_ID} | Could not find inspiration element in character sheet`);
  return;
}
```

### 4. Roll API (luck-system.js:62-63)

**Current Implementation:**
```javascript
const roll = new Roll("1d4");
await roll.evaluate({ async: true });
```

**Compatibility Status:**
✅ This syntax is correct for Foundry V11+ and should work fine in V12.

**Note:**
In V12, the `{ async: true }` parameter is the standard approach. No changes needed.

### 5. Document Updates

**Current Implementation:**
```javascript
await Actor.updateDocuments(updates);
```

**Compatibility Status:**
✅ This API is stable and should work in V12 without changes.

## Testing Checklist

Before releasing a V12-compatible version, test the following:

- [ ] Module loads without errors in Foundry V12
- [ ] Module loads without errors with D&D 5e v3.3.1
- [ ] Character sheet UI injection works correctly
- [ ] Inspiration element is found and replaced with luck UI
- [ ] Add luck point button functions correctly
- [ ] Spend luck point dialog opens and displays properly
- [ ] Luck point spending (for bonus) works correctly
- [ ] Luck point spending (for reroll) works correctly
- [ ] "Luck burst" mechanic (6th point) triggers properly
- [ ] Flag initialization runs on first load
- [ ] Existing characters with luck flags load correctly
- [ ] Chat messages post correctly (both public and whispered)
- [ ] Roll evaluation and display works properly
- [ ] CSS styling displays correctly on character sheet
- [ ] Dialog form validation works
- [ ] GM-only whispers function correctly

## Potential Compatibility Issues

### 1. Sheet Structure (HIGH RISK)
The biggest compatibility risk is that D&D 5e v3.3.1 may have a different HTML structure for character sheets compared to what the module expects in V13.

**Impact:** UI injection may fail silently if the inspiration element isn't found.

**Mitigation:** Implement fallback selectors (see Section 3).

### 2. Hook Names (MEDIUM RISK)
The specific sheet rendering hook name might differ between system versions.

**Impact:** The module may not inject its UI at all.

**Mitigation:** Support multiple hook types (see Section 2).

### 3. Document Model (LOW RISK)
V12 to V13 had some changes in how documents are handled, though the current code looks fairly compatible.

**Impact:** Minor issues with flag management or actor updates.

**Mitigation:** Test thoroughly; likely no changes needed.

### 4. Dialog API (LOW RISK)
The Dialog API is relatively stable across versions.

**Impact:** Unlikely to cause issues.

**Mitigation:** Test dialog rendering and form submission.

## What Likely Works Without Changes

The following components should be compatible with V12 without modifications:

- ✅ Flag management (`getFlag`, `setFlag`)
- ✅ `Actor.updateDocuments()`
- ✅ Dialog API
- ✅ ChatMessage API
- ✅ Roll creation and evaluation
- ✅ CSS styling (unless sheet structure changed dramatically)
- ✅ Event listeners and form handling
- ✅ jQuery usage in dialog render hook

## Implementation Plan

1. **Update module.json** with V12 compatibility and system relationships
2. **Add fallback selectors** for finding the inspiration element
3. **Consider multi-hook support** for different sheet types
4. **Test thoroughly** in a V12 environment with D&D 5e v3.3.1
5. **Document any system-specific quirks** discovered during testing
6. **Consider maintaining separate versions** if significant code changes are needed

## Additional Recommendations

### Version Strategy
Consider one of these approaches:

1. **Single Version:** Maintain one codebase that supports both V12 and V13
2. **Separate Branches:** Maintain separate branches for V12 and V13 compatibility
3. **Conditional Code:** Use version detection to run different code paths

### Version Detection Example
```javascript
const foundryVersion = game.version;
const isV12 = foundryVersion.startsWith("12");
const isV13 = foundryVersion.startsWith("13");

if (isV12) {
  // V12-specific code
} else if (isV13) {
  // V13-specific code
}
```

### System Version Detection
```javascript
const systemVersion = game.system.version;
console.log(`${MODULE_ID} | Running on D&D 5e v${systemVersion}`);
```

## Resources

- [Foundry VTT V12 Release Notes](https://foundryvtt.com/releases/12.0.0)
- [D&D 5e System Changelog](https://github.com/foundryvtt/dnd5e/releases)
- [Foundry VTT API Documentation](https://foundryvtt.com/api/)

## Conclusion

The Luck System module appears to be well-structured and uses stable Foundry APIs. The main compatibility concerns are:

1. Sheet HTML structure changes (easily mitigated with fallback selectors)
2. Hook naming differences (easily mitigated with multi-hook support)

With the recommended changes, the module should be fully compatible with Foundry V12 and D&D 5e v3.3.1.
