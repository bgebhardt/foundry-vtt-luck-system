// luck-system.js

const MODULE_ID = "luck-system"; 

/********************************************************************************
 * Data Management and Initialization
 ********************************************************************************/

Hooks.on("ready", async () => {
    if (!game.user.isGM) return;
    console.log(`${MODULE_ID} | Initializing flags if necessary.`);

    const updates = [];
    const actorsToUpdate = game.actors.filter(actor => actor.type === "character");

    for (const actor of actorsToUpdate) {
        if (actor.getFlag(MODULE_ID, "luckPoints") === undefined) {
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
 * @param {Actor} actor The Actor document.
 * @returns {{value: number, max: number}}
 */
function getLuckPoints(actor) {
    return {
        value: actor.getFlag(MODULE_ID, "luckPoints") ?? 0,
        max: actor.getFlag(MODULE_ID, "maxLuck") ?? 5
    };
}


/********************************************************************************
 * UI Logic: Dialogs and Sheet Replacement
 ********************************************************************************/

async function openLuckDialog(actor, sheetApp = null) {
    const { value: luck, max } = getLuckPoints(actor);
    new Dialog({
        title: `Spend Luck Points — ${actor.name}`,
        content: `<p>You have <strong>${luck}</strong> / ${max} Luck Points.</p>`,
        buttons: {
            spend1: {
                label: "Spend 1 (+1 to a d20 roll)",
                condition: luck >= 1,
                callback: async () => {
                    await actor.setFlag(MODULE_ID, "luckPoints", luck - 1);
                    if (sheetApp) sheetApp.render();
                }
            },
            spend3: {
                label: "Spend 3 (Re-roll a d20)",
                condition: luck >= 3,
                callback: async () => {
                    await actor.setFlag(MODULE_ID, "luckPoints", luck - 3);
                    if (sheetApp) sheetApp.render();
                }
            },
            cancel: { label: "Cancel" }
        },
        default: "cancel"
    }).render(true);
}

/**
 * Replaces the Inspiration button on the new D&D 5e character sheet.
 */
Hooks.on("renderCharacterActorSheet", (app, html) => {
    console.log(`Luck System | Hook fired for ${app.actor.name}. Attempting to replace inspiration.`);
    
    // Use .querySelector() on the standard HTML element.
    const inspirationContainer = html.querySelector('header.sheet-header .inspiration');
    
    // The check is now for a null value, not a length of 0.
    if (!inspirationContainer) {
        console.warn("Luck System | FAILED to find inspiration element. The sheet structure may have changed.");
        return;
    }

    const { value: luck, max } = getLuckPoints(app.actor);

    // Create the new element using standard JavaScript.
    const luckDisplay = document.createElement('a');
    luckDisplay.className = "luck-points-button inspiration";
    luckDisplay.title = `Luck Points: ${luck} / ${max}`;
    luckDisplay.innerHTML = `
        <span class="luck-value">${luck} / ${max}</span>
        <span class="luck-label">Luck</span>
    `;

    // Use .addEventListener() to attach the click behavior.
    luckDisplay.addEventListener("click", (event) => {
        event.preventDefault();
        openLuckDialog(app.actor, app);
    });

    // .replaceWith() works on standard elements, so this is fine.
    inspirationContainer.replaceWith(luckDisplay);
    console.log("Luck System | SUCCESS: Inspiration element replaced.");
});