/**
 * Hook to set up the "Luck Points" resource for all characters when the world is ready.
 */
Hooks.on("ready", () => {
  // Loop through all actors in the world
  for (let actor of game.actors.contents) {
    // Only apply this to player characters
    if (actor.type !== "character") continue;

    const res = actor.system.resources.primary;

    // If the primary resource isn't set, initialize it as Luck Points
    if (!res?.label || res.label === "") {
      console.log(`Luck System | Initializing Luck Points for ${actor.name}`);
      actor.update({
        "system.resources.primary.label": "Luck Points",
        "system.resources.primary.value": 0,
        "system.resources.primary.max": 5
      });
    }
  }
});

/**
 * Hook to modify the character sheet after it has been rendered.
 * This is where we replace the Inspiration UI with our button.
 */
Hooks.on("renderActorSheet5eCharacter", (sheet, html, data) => {
  // Find the HTML element for the inspiration tracker
  const inspirationElement = html.find(".inspiration");
  const actor = sheet.actor;

  // Define the HTML for our new button
  const buttonHtml = `
    <button type="button" class="use-luck-points" title="Use Luck Points">
      <i class="fas fa-dice-d20"></i> Use Luck
    </button>
  `;

  // Replace the inspiration checkbox with our new button
  inspirationElement.html(buttonHtml);

  // Add a click event listener to our new button
  html.find(".use-luck-points").on("click", (event) => {
    // When clicked, open the spending dialog
    openLuckDialog(actor);
  });
});

/**
 * Opens a dialog window for the player to choose how to spend their luck points.
 * @param {Actor} actor The character actor spending the points.
 */
function openLuckDialog(actor) {
  const currentLuck = actor.system.resources.primary.value;

  // Create and render the Dialog
  new Dialog({
    title: "Spend Luck Points",
    content: `<p>You have <b>${currentLuck}</b> Luck Point(s). How would you like to use them?</p>`,
    buttons: {
      // Button for spending 1 point
      spendOne: {
        icon: '<i class="fas fa-plus-circle"></i>',
        label: "Spend 1 Point (+1 Bonus)",
        callback: () => handleLuckSpend(actor, 1, "a +1 bonus to their roll")
      },
      // Button for spending 3 points
      spendThree: {
        icon: '<i class="fas fa-redo"></i>',
        label: "Spend 3 Points (Reroll)",
        callback: () => handleLuckSpend(actor, 3, "a reroll")
      },
      // Cancel button
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: "Cancel"
      }
    },
    default: "cancel"
  }).render(true);
}

/**
 * Handles the logic for subtracting luck points and notifying the chat.
 * @param {Actor} actor The actor spending the points.
 * @param {number} cost The number of points to spend.
 * @param {string} reason A description of what the points were spent on for the chat message.
 */
async function handleLuckSpend(actor, cost, reason) {
  const currentLuck = actor.system.resources.primary.value;

  // Check if the actor has enough points
  if (currentLuck < cost) {
    ui.notifications.warn("You don't have enough luck points for that!");
    return;
  }

  // Calculate the new total and update the actor
  const newLuckValue = currentLuck - cost;
  await actor.update({ "system.resources.primary.value": newLuckValue });
  ui.notifications.info(`You spent ${cost} luck point(s).`);

  // Create a message in the chat log to show what happened
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    content: `${actor.name} spends ${cost} luck point(s) to gain ${reason}!`
  });
}
