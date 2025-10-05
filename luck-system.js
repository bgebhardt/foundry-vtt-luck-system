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
 * Adds a luck point to a character, whispering the result to the GM.
 * @param {Actor5e} actor The actor to whom to add a luck point.
 */
async function addLuckPoint(actor) {
    const { value: currentLuck, max: maxLuck } = getLuckPoints(actor);
    const gmUsers = ChatMessage.getWhisperRecipients("GM").map(u => u.id);
    let newLuck = currentLuck + 1;
    let messageContent = "";

    // Handle the "burst" mechanic if they gain a 6th point
    if (newLuck > maxLuck) {
        const roll = new Roll("1d4");
        await roll.evaluate({ async: true });
        newLuck = roll.total;
        messageContent = `${actor.name} was at the luck limit! Their new luck point total is: <strong>${newLuck}</strong>`;
        
        // Post the roll to chat, whispering to the GM
        roll.toMessage({
            speaker: ChatMessage.getSpeaker({ actor }),
            flavor: `${actor.name}'s Luck Bursts!`,
            whisper: gmUsers // This line makes the roll private
        });
    } else {
        messageContent = `1 luck point has been added to ${actor.name} for a total of <strong>${newLuck}</strong>.`;
    }

    // Update the actor's flag with the new value
    await actor.setFlag(MODULE_ID, "luckPoints", newLuck);

    // Announce the change in chat, whispering to the GM
    ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor }),
        content: messageContent,
        whisper: gmUsers // This line makes the announcement private
    });
}


/**
 * Opens a dialog window for the player to spend their luck points.
 * Allows spending a variable amount for a bonus.
 * @param {Actor5e} actor The actor spending luck.
 */
async function openLuckDialog(actor) {
    const { value: luck, max } = getLuckPoints(actor);
    const content = `
        <p>You have <strong>${luck}</strong> / ${max} Luck Points.</p>
        <hr>
        <form>
            <div class="form-group">
                <label for="luck-points-to-spend">Spend points for a bonus (+1 per point):</label>
                <div class="form-fields">
                    <input type="number" id="luck-points-to-spend" value="1" min="1" max="5" />
                    <button type="submit" class="spend-for-bonus">Spend</button>
                </div>
            </div>
        </form>
    `;

    new Dialog({
        title: `Spend Luck Points — ${actor.name}`,
        content: content,
        buttons: {
            spendReroll: {
                icon: '<i class="fas fa-dice-d20"></i>',
                label: "Spend 3 to Reroll",
                condition: luck >= 3,
                callback: async () => {
                    await actor.setFlag(MODULE_ID, "luckPoints", luck - 3);
                    ChatMessage.create({
                        speaker: ChatMessage.getSpeaker({ actor }),
                        content: `${actor.name} spends 3 Luck Points to re-roll a d20.`
                    });
                }
            },
            close: {
                icon: '<i class="fas fa-times"></i>',
                label: "Cancel"
            }
        },
        default: "close",
        render: (html) => {
            // The html argument is a jQuery object. Find the form and add a submit handler.
            html.find("form").on("submit", async (event) => {
                event.preventDefault();
                const input = html.find("#luck-points-to-spend")[0];
                const amountToSpend = parseInt(input.value);

                // Validation
                if (isNaN(amountToSpend) || amountToSpend <= 0) {
                    return ui.notifications.warn("Please enter a valid number of points.");
                }
                if (amountToSpend > luck) {
                    return ui.notifications.warn(`You only have ${luck} luck points!`);
                }
                if (amountToSpend > 5) {
                    return ui.notifications.warn("You cannot spend more than 5 points at a time.");
                }

                // If validation passes, process the action
                const newTotal = luck - amountToSpend;
                await actor.setFlag(MODULE_ID, "luckPoints", newTotal);
                ChatMessage.create({
                    speaker: ChatMessage.getSpeaker({ actor }),
                    content: `${actor.name} spends ${amountToSpend} Luck Point(s) for a +${amountToSpend} bonus to a roll.`
                });

                // Close the dialog after submission
                html.closest(".dialog").find(".dialog-button.close").trigger("click");
            });
        }
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

    // UPDATED: This HTML is structured to create the vertical layout you want.
    luckSystemContainer.innerHTML = `
        <div class="luck-display">
            <h4 class="luck-label">Luck</h4>
            <div class="luck-value">${luck}/${max}</div>
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