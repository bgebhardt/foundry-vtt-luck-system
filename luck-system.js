// luck-system.js

const MODULE_ID = "foundry-vtt-luck-system"; // Define your module ID for flags and settings

/********************************************************************************
 * Data Management: Initialization and Getters
 ********************************************************************************/

/**
 * Initializes the luck point data as an Actor flag on all 'character' type Actors.
 * Using a flag prevents it from appearing as a standard resource on the D&D 5e sheet.
 */
Hooks.on("ready", async () => {
    // Only run setup for the GM.
    if (!game.user.isGM) return;

    console.log(`${MODULE_ID} | Initializing Luck Points on Actors.`);

    const updates = [];

    // Loop through all Actors in the game world
    for (const actor of game.actors.contents) {
        // Only apply to player characters
        if (actor.type !== "character") continue;

        // Check if the flag does not exist (first time running)
        const currentLuck = actor.getFlag(MODULE_ID, "luckPoints");

        if (currentLuck === undefined) {
            updates.push({
                _id: actor.id,
                // Set initial value and max
                flags: {
                    [MODULE_ID]: {
                        luckPoints: 0,
                        maxLuck: 5
                    }
                }
            });
        }
    }

    // Apply all updates in a single database operation for efficiency
    if (updates.length > 0) {
        await Actor.updateDocuments(updates);
        console.log(`${MODULE_ID} | Updated ${updates.length} Actors with Luck Points flag.`);
    }
});

/**
 * Helper function to retrieve an Actor's luck points.
 * @param {Actor} actor The Actor document.
 * @returns {{value: number, max: number}}
 */
function getLuckPoints(actor) {
    // The ?? operator provides a default value if the flag is null or undefined
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

/**
 * Open the Spend Luck dialog. sheetApp is optional but used to re-render the sheet after spending.
 * @param {Actor} actor The actor spending luck.
 * @param {Application} [sheetApp=null] The sheet application to re-render.
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
                label: "Spend 1 ( +1 to a d20 roll )",
                callback: async () => {
                    if (luck < 1) return ui.notifications.warn("Not enough Luck Points!");
                    
                    // Update the flag value
                    const newVal = Math.max(0, luck - 1);
                    await actor.setFlag(MODULE_ID, "luckPoints", newVal);
                    
                    ui.notifications.info(`${actor.name} spends 1 Luck Point for +1 to a roll.`);
                    if (sheetApp) sheetApp.render();
                }
            },
            spend3: {
                label: "Spend 3 ( Re-roll a d20 )",
                callback: async () => {
                    if (luck < 3) return ui.notifications.warn("Not enough Luck Points!");
                    
                    // Update the flag value
                    const newVal = Math.max(0, luck - 3);
                    await actor.setFlag(MODULE_ID, "luckPoints", newVal);

                    ui.notifications.info(`${actor.name} spends 3 Luck Points to re-roll.`);
                    // You will add automatic reroll logic here later.
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
 * Replaces the Inspiration button on the D&D 5e sheet with the Luck Points display.
 */
Hooks.on("renderActorSheet5eCharacter", (app, [html]) => {
    const actor = app.actor;

    // 1. Find the Inspiration element
    // The Inspiration toggle is an anchor tag with the data-action="inspiration" attribute.
    const $inspiration = html.find('a[data-action="inspiration"]');

    if ($inspiration.length === 0) {
        console.warn(`${MODULE_ID} | Could not find Inspiration element on the sheet.`);
        return;
    }
    
    // Check if the element has already been replaced to prevent double-binding
    if ($inspiration.hasClass("luck-system-replaced")) return;

    // 2. Get the current Luck Points data
    const { value: luck, max } = getLuckPoints(actor);
    const label = `${luck} / ${max}`;
    const title = `Luck Points: ${luck} / ${max}`;

    // 3. Replace the HTML content and attributes
    // We keep the <a class="inspiration-button"> structure but change the content and behavior.
    // The original Inspiration button looks like this: <a class="inspiration-button" data-action="inspiration"></a>
    
    $inspiration.removeClass("inspiration-button") // Remove the inspiration-specific class
        .addClass("luck-points-button luck-system-replaced") // Add our classes
        .attr("title", title) // Set the hover title
        .removeAttr("data-action") // Remove the default inspiration action
        .html(`
            <span class="luck-value">${label}</span>
            <span class="luck-label">Luck</span>
        `); // Inject our custom HTML structure

    // 4. Bind the click handler to open the dialog
    $inspiration.off("click").on("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLuckDialog(actor, app);
    });
});