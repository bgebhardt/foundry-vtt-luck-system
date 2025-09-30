// luck-system.js

const MODULE_ID = "foundry-vtt-luck-system"; // Define your module ID for flags and settings

/********************************************************************************
 * Data Management: Flag Registration and Initialization
 ********************************************************************************/

/**
 * Register all settings and flags for the module.
 * This MUST happen in the 'init' hook to ensure the flag scope is active.
 */
Hooks.on("init", () => {
    console.log(`${MODULE_ID} | Initializing module flags.`);

    /**
     * Register the 'luckPoints' flag on the Actor document.
     * This is required before 'getFlag' or 'setFlag' can be called.
     */
    game.modules.get(MODULE_ID).api.registerFlag("Actor", "luckPoints", {
        name: "Luck Points Value",
        hint: "The current number of Luck Points the character has.",
        scope: "world", // Stored in the database, viewable by all.
        config: false, // Don't show in Foundry's default settings menu.
        type: Number,
        default: 0
    });

    /**
     * Register the 'maxLuck' flag on the Actor document.
     */
    game.modules.get(MODULE_ID).api.registerFlag("Actor", "maxLuck", {
        name: "Max Luck Points",
        hint: "The maximum number of Luck Points the character can hold.",
        scope: "world",
        config: false,
        type: Number,
        default: 5
    });
    
    // Note: The above is a modern way to register flags as of Foundry V13.
    // If you encounter an error with 'game.modules.get(MODULE_ID).api.registerFlag', 
    // you may need to fallback to:
    // CONFIG.Actor.documentClass.metadata.flags[MODULE_ID] = {
    //     luckPoints: {name: "Luck Points Value", scope: "world", type: Number, default: 0},
    //     maxLuck: {name: "Max Luck Points", scope: "world", type: Number, default: 5}
    // };
});


/**
 * Initializes the luck point data as an Actor flag on all 'character' type Actors.
 * This is where we ensure every existing Actor has the initial flag data.
 */
Hooks.on("ready", async () => {
    // Only run setup for the GM.
    if (!game.user.isGM) return;

    console.log(`${MODULE_ID} | Ensuring Luck Points flag exists on Actors.`);

    const updates = [];

    // Loop through all Actors in the game world
    for (const actor of game.actors.contents) {
        // Only apply to player characters
        if (actor.type !== "character") continue;

        // Check if the flag does not exist (first time running)
        // getFlag is now safe to call because the flag was registered in 'init'.
        const currentLuck = actor.getFlag(MODULE_ID, "luckPoints");

        // The flag will return the default (0) if it's set, so we check for an explicit undefined 
        // which would only happen if the document was created before the flag was registered.
        // A simpler approach now that we have defaults is to rely on them, but for existing documents, 
        // we might still prefer an explicit initial update if defaults aren't enough.
        // For simplicity and relying on the registered defaults:
        
        // This 'ready' block can actually be removed because the flags are now registered 
        // with default values. The `getLuckPoints` function will handle the defaults. 
        // We only need to keep it if we wanted to enforce the data structure with `updateDocuments`,
        // but since we registered defaults, we'll keep the logic simple.
        
        // **I've commented out the heavy update loop, as registration with defaults is often enough:**
        /*
        if (currentLuck === undefined) { 
            // If we still want to enforce the update (e.g., if we had a non-default setup):
            updates.push({
                _id: actor.id,
                flags: {
                    [MODULE_ID]: {
                        luckPoints: 0,
                        maxLuck: 5
                    }
                }
            });
        }
        */
    }

    // if (updates.length > 0) {
    //     await Actor.updateDocuments(updates);
    //     console.log(`${MODULE_ID} | Updated ${updates.length} Actors with Luck Points flag.`);
    // }
});


/**
 * Helper function to retrieve an Actor's luck points.
 * @param {Actor} actor The Actor document.
 * @returns {{value: number, max: number}}
 */
function getLuckPoints(actor) {
    // getFlag automatically returns the registered default value (0 and 5) if the flag is not set.
    const luckData = actor.getFlag(MODULE_ID, "luckPoints");
    const maxData = actor.getFlag(MODULE_ID, "maxLuck");
    return {
        value: luckData ?? 0, // Fallback safety, though getFlag should return default
        max: maxData ?? 5    // Fallback safety
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
                    // Use setFlag to update the value
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
                    // Use setFlag to update the value
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
 * Replaces the Inspiration button on the D&D 5e sheet with the Luck Points display.
 */
Hooks.on("renderActorSheet5eCharacter", (app, [html]) => {
    const actor = app.actor;

    // 1. Find the Inspiration element (anchor tag with data-action="inspiration")
    const $inspiration = html.find('a[data-action="inspiration"]');

    if ($inspiration.length === 0) return;
    
    // Check if the element has already been replaced
    if ($inspiration.hasClass("luck-system-replaced")) return;

    // 2. Get the current Luck Points data
    const { value: luck, max } = getLuckPoints(actor);
    const label = `${luck} / ${max}`;
    const title = `Luck Points: ${luck} / ${max}`;

    // 3. Replace the HTML content and attributes
    $inspiration.removeClass("inspiration-button") 
        .addClass("luck-points-button luck-system-replaced") 
        .attr("title", title) 
        .removeAttr("data-action") 
        .html(`
            <span class="luck-value">${label}</span>
            <span class="luck-label">Luck</span>
        `); 

    // 4. Bind the click handler to open the dialog
    $inspiration.off("click").on("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openLuckDialog(actor, app);
    });
});