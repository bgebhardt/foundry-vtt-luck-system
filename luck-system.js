// This hook runs every time a character sheet is rendered
Hooks.on('renderActorSheet5eCharacter', (sheet, html, data) => {

    // Get the current luck points from the actor's flags, defaulting to 0
    const luckPoints = sheet.actor.getFlag('luck-system', 'luckPoints') || 0;

    // The HTML for our new luck point tracker
    const luckHtml = `
        <div class="counter flexrow" style="margin-bottom: 8px;">
            <h4>Luck Points</h4>
            <div class="counter-value">
                <input type="text" name="flags.luck-system.luckPoints" value="${luckPoints}" placeholder="0" data-dtype="Number"/>
            </div>
        </div>
    `;

    // Find the inspiration checkbox element and add our HTML right before it
    const inspirationElement = html.find('.inspiration');
    inspirationElement.before(luckHtml);
});