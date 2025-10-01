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
 * Core Module Logic
 ********************************************************************************/

/**
 * Adds a luck point to a character, handling the "burst" mechanic.
 * @param {Actor5e} actor The actor to whom to add a luck point.
 */
async function addLuckPoint(actor) {
    const { value: currentLuck, max: maxLuck } = getLuckPoints(actor);
    let newLuck = currentLuck + 1;
    let messageContent = "";

    // Handle the "burst" mechanic if they gain a 6th point
    if (newLuck > maxLuck) {
        const roll = new Roll("1d4");
        await roll.evaluate({ async: true });
        newLuck = roll.total;
        messageContent = `${actor.name} was at the luck limit! Their new luck point total is: <strong>${newLuck}</strong>`;
        // Post the roll to chat
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: `${actor.name}'s Luck Bursts!`
        });
    } else {
        messageContent = `1 luck point has been added to ${actor.name} for a total of <strong>${newLuck}</strong>.`;
    }

    // Update the actor's flag with the new value
    await actor.setFlag(MODULE_ID, "luckPoints", newLuck);

    // Announce the change in chat
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: messageContent
    });
}


/**
 * Opens a dialog window for the player to spend their luck points.
 * @param {Actor5e} actor The actor spending luck.
 */
async function openLuckDialog(actor) {
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
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor }),
                        content: `${actor.name} spends 1 Luck Point for a +1 bonus.`
                    });
                }
            },
            spend3: {
                label: "Spend 3 (Re-roll a d20)",
                condition: luck >= 3,
                callback: async () => {
                    await actor.setFlag(MODULE_ID, "luckPoints", luck - 3);
                     ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor }),
                        content: `${actor.name} spends 3 Luck Points to re-roll a d20.`
                    });
                }
            },
            cancel: { label: "Cancel" }
        },
        default: "cancel"
    }).render(true);
}


/********************************************************************************
 * Character Sheet UI Injection
 ********************************************************************************/

Hooks.on("renderCharacterActorSheet", (app, html) => {
    const inspirationContainer = html.querySelector('header.sheet-header .inspiration');
    if (!inspirationContainer) return;

    const { value: luck, max } = getLuckPoints(app.actor);

    // Create a new container for our entire luck system UI
    const luckSystemContainer = document.createElement('div');
    luckSystemContainer.className = "luck-system-container inspiration";

    // Add the HTML for the display and the new buttons
    luckSystemContainer.innerHTML = `
        <div class="luck-display" title="Luck Points: ${luck} / ${max}">
            <span class="luck-label">Luck</span>
            <span class="luck-value">${luck} / ${max}</span>
        </div>
        <div class="luck-buttons">
            <button type="button" class="add-luck-point" title="Add 1 Luck Point"><i class="fas fa-plus"></i></button>
            <button type="button" class="spend-luck-point" title="Spend Luck Points"><i class="fas fa-hand-sparkles"></i></button>
        </div>
    `;

    // Add event listeners to the new buttons
    const addButton = luckSystemContainer.querySelector('.add-luck-point');
    addButton.addEventListener('click', (event) => {
        event.preventDefault();
        addLuckPoint(app.actor);
    });

    const spendButton = luckSystemContainer.querySelector('.spend-luck-point');
    spendButton.addEventListener('click', (event) => {
        event.preventDefault();
        openLuckDialog(app.actor);
    });

    // Replace the original inspiration element with our new UI
    inspirationContainer.replaceWith(luckSystemContainer);
});