// luck-system.js

const MODULE_ID = "luck-system"; 

/********************************************************************************
 * Data Management and Initialization
 ********************************************************************************/

Hooks.on("ready", async () => {
    if (!game.user.isGM) return;

    console.log(`${MODULE_ID} | Ensuring Luck Points flag exists on all character Actors.`);

    const updates = [];
    const actorsToUpdate = game.actors.filter(actor => actor.type === "character");

    for (const actor of actorsToUpdate) {
        const currentLuck = actor.getFlag(MODULE_ID, "luckPoints");
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
 * @param {Actor} actor The Actor document.
 * @returns {{value: number, max: number}}
 */
function getLuckPoints(actor) {
    const luckData = actor.getFlag(MODULE_ID, "luckPoints");
    const maxData = actor.getFlag(MODULE_ID, "maxLuck");
    
    return {
        value: luckData ?? 0,
        max: maxData ?? 5
    };
}


/********************************************************************************
 * UI Logic: Dialogs and Sheet Replacement
 ********************************************************************************/

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
                condition: luck >= 1,
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
Hooks.on("renderActorSheet5eCharacter", (app, html) => {
    // The 'html' variable is a jQuery object, so we must use jQuery methods to interact with it.
    const actor = app.actor;

    // 1. Find the inspiration button using jQuery's .find() method.
    const inspirationButton = html.find('a[data-action="inspiration"]');

    // 2. If the button doesn't exist on this sheet, or has already been replaced, do nothing.
    if (inspirationButton.length === 0) {
        return;
    }

    // 3. Get the actor's luck point data.
    const { value: luck, max } = getLuckPoints(actor);

    // 4. Create the new HTML for our luck display as a jQuery object.
    const luckDisplay = $(`
        <a class="luck-points-button" title="Luck Points: ${luck} / ${max}">
            <span class="luck-value">${luck} / ${max}</span>
            <span class="luck-label">Luck</span>
        </a>
    `);

    // 5. Add a click event listener to our new element.
    luckDisplay.on("click", (event) => {
        event.preventDefault();
        openLuckDialog(actor, app);
    });

    // 6. Replace the original inspiration button with our new luck display.
    inspirationButton.replaceWith(luckDisplay);
});