// luck-system.js
// Version 0.0.19

const MODULE_ID = "luck-system"; 

/********************************************************************************
 * Data Management and Initialization
 ********************************************************************************/

Hooks.on("ready", async () => {
    if (!game.user.isGM) return;

    // Log version information for debugging
    console.log(`${MODULE_ID} | Module initialized`);
    console.log(`${MODULE_ID} | Foundry VTT version: ${game.version}`);
    console.log(`${MODULE_ID} | D&D 5e system version: ${game.system.version}`);
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
 * Decreases a luck point from a character, whispering the result to the GM.
 * @param {Actor5e} actor The actor from whom to remove a luck point.
 */
async function decreaseLuckPoint(actor) {
    const { value: currentLuck } = getLuckPoints(actor);
    const gmUsers = ChatMessage.getWhisperRecipients("GM").map(u => u.id);

    // Don't go below 0
    if (currentLuck <= 0) {
        ui.notifications.warn(`${actor.name} has no luck points to remove.`);
        return;
    }

    const newLuck = currentLuck - 1;
    const messageContent = `1 luck point has been removed from ${actor.name} for a total of <strong>${newLuck}</strong>.`;

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
 * Shows the luck point rules in a dialog.
 */
function showLuckRules() {
    const rulesContent = `
        <div style="font-family: 'Signika', sans-serif; line-height: 1.6;">
            <h2 style="margin-top: 0; color: #c53131; border-bottom: 2px solid #c53131; padding-bottom: 5px;">Luck</h2>
            <p>Every PC has a special resource called <strong>Luck</strong> that can be used to influence the result of any of your checks: ability check, attack roll, or save.</p>

            <h3 style="color: #c53131; margin-top: 15px;">Gaining Luck Points</h3>
            <p>When you create your character, start with 0 Luck points. Gain Luck points in the following ways:</p>
            <ul style="margin-left: 20px;">
                <li>Once per turn, when you fail an attack roll or save, gain 1 Luck point.</li>
                <li>The GM can award 1 Luck point as a reward for a clever idea, excellent roleplaying, or pursuing an interesting—rather than optimal—choice.</li>
                <li>The GM can award Luck to a party for surviving difficult encounters or achieving story goals (in addition to XP).</li>
            </ul>

            <h3 style="color: #c53131; margin-top: 15px;">Losing Luck Points</h3>
            <p>You can have a <strong>maximum of 5 Luck points</strong> at one time. If a PC has 5 Luck points and would gain a 6th point, you must immediately roll a d4 and reset your Luck points to the die result.</p>

            <h3 style="color: #c53131; margin-top: 15px;">Spending Luck Points</h3>
            <p>You spend Luck points to add to any d20 roll you make. For example, if you have 4 Luck points, and roll a 13 on the die, you can spend 2 Luck points to make your roll result a 15 (leaving you with 2 Luck points for later).</p>
            <p>Alternatively, immediately after you make a check (attack, ability check, or save), you can spend <strong>3 Luck points to reroll a d20</strong>.</p>
            <p>In either case, you spend Luck after you roll but before the GM declares whether the roll succeeds or fails. <strong>Luck can't offset effects of a natural 1 or create a natural 20.</strong></p>

            <hr style="margin: 15px 0; border: none; border-top: 1px solid #999;">
            <p style="font-size: 12px; font-style: italic; text-align: center;">
                Rules from <a href="https://koboldpress.com/wp-content/uploads/2023/10/Black-Flag-Roleplaying-v0.1_101123.pdf" target="_blank" style="color: #c53131;">Black Flag Roleplaying</a> by Kobold Press
            </p>
        </div>
    `;

    new Dialog({
        title: "Luck Point Rules",
        content: rulesContent,
        buttons: {
            close: {
                icon: '<i class="fas fa-times"></i>',
                label: "Close"
            }
        },
        default: "close"
    }).render(true);
}


/**
 * Opens a dialog window for the player to spend their luck points.
 * Allows spending a variable amount for a bonus.
 * @param {Actor5e} actor The actor spending luck.
 */
async function openLuckDialog(actor) {
    const { value: luck, max } = getLuckPoints(actor);
    const content = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <p style="margin: 0;">You have <strong>${luck}</strong> / ${max} Luck Points.</p>
            <button type="button" class="luck-help-button" title="Show Luck Rules" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #c53131; padding: 0;">
                <i class="fas fa-question-circle"></i>
            </button>
        </div>
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
            // Add event listener for the help button
            html.find(".luck-help-button").on("click", (event) => {
                event.preventDefault();
                showLuckRules();
            });

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

/**
 * Injects the luck system UI into the character sheet.
 * @param {Application} app The character sheet application.
 * @param {jQuery} html The jQuery HTML object of the sheet.
 */
function injectLuckUI(app, html) {
    // Only process character actors
    if (app.actor.type !== "character") return;

    // Convert jQuery to native element if needed
    const htmlElement = html[0] || html;

    // Try multiple possible selectors for the inspiration element
    let inspirationContainer = htmlElement.querySelector('header.sheet-header .inspiration');
    if (!inspirationContainer) {
        inspirationContainer = htmlElement.querySelector('.inspiration');
    }
    if (!inspirationContainer) {
        inspirationContainer = htmlElement.querySelector('[data-attribute="inspiration"]');
    }
    if (!inspirationContainer) {
        console.warn(`${MODULE_ID} | Could not find inspiration element in character sheet for ${app.actor.name}`);
        return;
    }

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
            <button type="button" class="decrease-luck-point" title="Remove 1 Luck Point"><i class="fas fa-minus"></i></button>
            <button type="button" class="add-luck-point" title="Add 1 Luck Point"><i class="fas fa-plus"></i></button>
            <button type="button" class="spend-luck-point" title="Spend Luck Points"><i class="fas fa-hand-sparkles"></i></button>
        </div>
    `;

    // Add event listeners to the new buttons
    const decreaseButton = luckSystemContainer.querySelector('.decrease-luck-point');
    decreaseButton.addEventListener('click', (event) => {
        event.preventDefault();
        decreaseLuckPoint(app.actor);
    });

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
}

// Register hooks for multiple possible character sheet types
// This ensures compatibility across different versions of the D&D 5e system
Hooks.on("renderActorSheet5eCharacter", injectLuckUI);
Hooks.on("renderActorSheet5eCharacter2", injectLuckUI);
Hooks.on("renderCharacterActorSheet", injectLuckUI);

// Fallback: generic hook with system check
Hooks.on("renderActorSheet", (app, html) => {
    if (game.system.id !== "dnd5e") return;
    injectLuckUI(app, html);
});