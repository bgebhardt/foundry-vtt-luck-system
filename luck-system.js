// luck-system.js
// Ensure Luck Points resource exists and attach a click -> dialog handler on the "Luck Points" Favorite

Hooks.on("ready", async () => {
  // Ensure every character actor has the primary resource labelled "Luck Points"
  for (const actor of game.actors.contents) {
    if (actor.type !== "character") continue;

    const res = actor.system.resources.primary;
    if (!res?.label || res.label === "") {
      await actor.update({
        "system.resources.primary.label": "Luck Points",
        "system.resources.primary.value": 0,
        "system.resources.primary.max": 5
      });
    }
  }
});

// Open the Spend Luck dialog. sheetApp is optional but used to re-render the sheet after spending.
async function openLuckDialog(actor, sheetApp = null) {
  const luck = actor.system.resources.primary?.value ?? 0;

  new Dialog({
    title: `Spend Luck Points — ${actor.name}`,
    content: `
      <p>${actor.name} has <strong>${luck}</strong> Luck Point${luck === 1 ? "" : "s"}.</p>
      <p>Choose how to spend them:</p>
    `,
    buttons: {
      spend1: {
        label: "Spend 1 ( +1 to a d20 roll )",
        callback: async () => {
          if (luck < 1) return ui.notifications.warn("Not enough Luck Points!");
          const newVal = Math.max(0, luck - 1);
          await actor.update({ "system.resources.primary.value": newVal });
          ui.notifications.info(`${actor.name} spends 1 Luck Point.`);
          // Re-render sheet to update UI (favorites count, etc.)
          if (sheetApp) sheetApp.render();
        }
      },
      spend3: {
        label: "Spend 3 ( Reroll a d20 )",
        callback: async () => {
          if (luck < 3) return ui.notifications.warn("Not enough Luck Points!");
          const newVal = Math.max(0, luck - 3);
          await actor.update({ "system.resources.primary.value": newVal });
          ui.notifications.info(`${actor.name} spends 3 Luck Points to reroll.`);
          // You can add automatic reroll logic here later.
          if (sheetApp) sheetApp.render();
        }
      },
      cancel: {
        label: "Cancel"
      }
    },
    default: "cancel"
  }).render(true);
}

// Attach a click handler to the "Luck Points" Favorites entry on the character sheet.
// This tries to be robust: it first looks in the Favorites area, then falls back to any element containing the label text.
Hooks.on("renderActorSheet5eCharacter", (app, html) => {
  // Clean up any previous markers so we don't double-bind
  html.find(".luck-fav-bind").removeClass("luck-fav-bind").off("click");

  const actor = app.actor;

  // Helper: try to find the favorites region first (UI can differ by sheet)
  let targets = html.find(".sidebar .favorites, .favorites, .favorite-list, .player-side .favorites");

  // If found, search inside it for nodes containing "Luck Points"
  let luckNodes = $();
  if (targets.length) {
    targets.each((i, t) => {
      // find any child element that contains the label text
      const found = $(t).find(":contains('Luck Points')").filter(function() {
        // only keep elements with direct text content (avoid picking huge wrappers)
        const txt = $(this).text().trim();
        return txt && txt.match(/Luck Points/);
      });
      luckNodes = luckNodes.add(found);
    });
  }

  // Fallback: search entire sheet for the label if we didn't find anything in Favorites
  if (luckNodes.length === 0) {
    const fallback = html.find(":contains('Luck Points')").filter(function() {
      const txt = $(this).text().trim();
      return txt && txt.match(/Luck Points/);
    });
    luckNodes = luckNodes.add(fallback);
  }

  // For each matched node, climb to a clickable parent (anchor/button/.item/etc) and bind the click.
  luckNodes.each((i, node) => {
    const $node = $(node);

    // Prefer a clickable ancestor: a, button, .directory-item, .item, .favorite, .resource, or the immediate parent
    let $clickTarget = $node.closest("a, button, .directory-item, .item, .favorite, .resource, .entity, .resource-primary");

    if ($clickTarget.length === 0) {
      $clickTarget = $node.parent();
    }

    // If still nothing, just attach directly to the node
    if ($clickTarget.length === 0) $clickTarget = $node;

    // Avoid double-binding
    if ($clickTarget.data("luck-bound")) return;
    $clickTarget.data("luck-bound", true);

    // Add a small class for debugging/visual cue if desired
    $clickTarget.addClass("luck-fav-bind");

    // Bind click
    $clickTarget.on("click", (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openLuckDialog(actor, app);
    });
  });
});
