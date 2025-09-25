Hooks.on("ready", () => {
  for (let actor of game.actors.contents) {
    if (actor.type !== "character") continue;

    // Use the "primary" resource slot
    let res = actor.system.resources.primary;

    if (!res?.label || res.label === "") {
      actor.update({
        "system.resources.primary.label": "Luck Points",
        "system.resources.primary.value": 0,
        "system.resources.primary.max": 5
      });
    }
  }
});

// Replace Inspiration with Luck in Actor Sheets
Hooks.on("renderActorSheet5eCharacter", (app, html, data) => {
  // Find the inspiration element
  const inspEl = html.find(".header-actions .inspiration");
  if (!inspEl.length) return;

  const actor = app.actor;

  // Replace with Luck button
  const luckBtn = $(`<a class="luck-button" title="Spend Luck Points">
    <i class="fas fa-clover"></i> Luck
  </a>`);

  inspEl.replaceWith(luckBtn);

  luckBtn.on("click", async () => {
    const luckPoints = actor.system.resources.primary?.value ?? 0;

    if (luckPoints <= 0) {
      ui.notifications.warn(`${actor.name} has no Luck Points to spend!`);
      return;
    }

    new Dialog({
      title: "Spend Luck Points",
      content: `
        <p>You currently have <strong>${luckPoints}</strong> Luck Points.</p>
        <p>Choose how you want to spend them:</p>
      `,
      buttons: {
        onePoint: {
          label: "Spend 1 ( +1 to a d20 roll )",
          callback: async () => {
            if (luckPoints >= 1) {
              await actor.update({ "system.resources.primary.value": luckPoints - 1 });
              ui.notifications.info(`${actor.name} spends 1 Luck Point for +1 on a d20 roll!`);
            } else {
              ui.notifications.warn("Not enough Luck Points!");
            }
          }
        },
        threePoints: {
          label: "Spend 3 ( Reroll a d20 )",
          callback: async () => {
            if (luckPoints >= 3) {
              await actor.update({ "system.resources.primary.value": luckPoints - 3 });
              ui.notifications.info(`${actor.name} spends 3 Luck Points to reroll a d20!`);
              // You can trigger an actual reroll prompt here if desired
            } else {
              ui.notifications.warn("Not enough Luck Points!");
            }
          }
        },
        cancel: {
          label: "Cancel"
        }
      },
      default: "cancel"
    }).render(true);
  });
});
