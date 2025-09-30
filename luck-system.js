// luck-system.js

// CORRECT: This ID must match the "id" field in your module.json
const MODULE_ID = "luck-system"; 

/********************************************************************************
 * Data Management and Initialization
 ********************************************************************************/

/**
 * Initializes the luck point data as a flag on all 'character' type Actors.
 * This ensures that actors created before the module was active have the data.
 */
Hooks.on("ready", async () => {
    // Only run this setup once for the GM user.
    if (!game.user.isGM) return;

    console.log(`${MODULE_ID} | Ensuring Luck Points flag exists on all character Actors.`);

    const updates = [];
    const actorsToUpdate = game.actors.filter(actor => actor.type === "character");

    for (const actor of actorsToUpdate) {
        // Get the current luck points flag
        const currentLuck = actor.getFlag(MODULE_ID, "luckPoints");

        // If the flag is undefined, it means this actor has never had luck points set.
        if (currentLuck === undefined) {
            updates.push({
                _id: actor.id,
                [`flags.${MODULE_ID}.luckPoints`]: 0,
                [`flags.${MODULE_ID}.maxLuck`]: 5
            });
        }
    }

    if (updates.length > 0) {
        await Actor.updateDocuments(updates);
        console.log(`${MODULE_ID} | Initialized luck points for ${updates.length} Actors.`);
    }
});


/**
 * Helper function to retrieve an Actor's luck points.
 * Provides default values if the flags are not yet set on the document.
 * @param {Actor} actor The Actor document.
 * @returns {{value: number, max: number}}
 */
function getLuckPoints(actor) {
    const luckData = actor.getFlag(MODULE_ID, "luckPoints");
    const maxData = actor.getFlag(MODULE_ID, "maxLuck");
    
    return {
        value: luckData ?? 0, // Use 0 if the flag isn't set
        max: maxData ?? 5    // Use 5 if the flag isn't set
    };
}


/********************************************************************************
 * UI Logic: Dialogs and Sheet Replacement
 ********************************************************************************/

/**
 * Opens a dialog window to spend Luck Points.
 * @param {Actor} actor The actor spending luck.
 * @param {Application} [sheetApp=null] The sheet application to re-render after an update.
 */
async function openLuckDialog(actor, sheetApp = null) {
    const { value: luck, max } = getLuckPoints(actor);

    new Dialog({
        title: `Spend Luck Points — ${actor.name}`,
        content: `
            <p>${actor.name} has <strong>${luck}</strong> Luck Point${luck === 1 ? "" : "s"} (Max ${max}).</p>
            <p>Choose how to spend them:</p>
        `,
        buttons: {
            spend1: {
                label: "Spend 1 (+1 to a d20 roll)",
                condition: luck >= 1, // The button is only enabled if the condition is met
                callback: async () => {
                    const newVal = Math.max(0, luck - 1);
                    await actor.setFlag(MODULE_ID, "luckPoints", newVal);
                    ui.notifications.info(`${actor.name} spends 1 Luck Point for +1 to a roll.`);
                    if (sheetApp) sheetApp.render();
                }
            },
            spend3: {
                label: "Spend 3 (Re-roll a d20)",
                condition: luck >= 3,
                callback: async () => {
                    const newVal = Math.max(0, luck - 3);
                    await actor.setFlag(MODULE_ID, "luckPoints", newVal);
                    ui.notifications.info(`${actor.name} spends 3 Luck Points to re-roll.`);
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

/**
 * Replaces the Inspiration button on the D&D 5e character sheet with the Luck Points display.
 */
Hooks.on("renderActorSheet5eCharacter", (app, [html]) => {
    const actor = app.actor;

    // Find the Inspiration element
    const inspirationElement = html.querySelector('a[data-action="inspiration"]');
    if (!inspirationElement) return;

    // Avoid re-rendering if we've already replaced it.
    if (inspirationElement.classList.contains("luck-system-replaced")) return;

    const { value: luck, max } = getLuckPoints(actor);

    // Prepare the new element's content and attributes
    const luckDisplay = document.createElement("a");
    luckDisplay.className = "luck-points-button luck-system-replaced";
    luckDisplay.title = `Luck Points: ${luck} / ${max}`;
    luckDisplay.innerHTML = `
        <span class="luck-value">${luck} / ${max}</span>
        <span class="luck-label">Luck</span>
    `;

    // Add a click listener to our new element
    luckDisplay.addEventListener("click", (event) => {
        event.preventDefault();
        openLuckDialog(actor, app);
    });

    // Replace the old inspiration element with our new luck display
    inspirationElement.replaceWith(luckDisplay);
});