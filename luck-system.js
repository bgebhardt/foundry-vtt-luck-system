// luck-system.js

// --- TEMPORARY DIAGNOSTIC ---
// This hook will log the class name of every application window that opens.
// Its only purpose is to find the correct name for the character sheet.
Hooks.on("renderApplication", (app, html) => {
  // We only care about actor sheets.
  if ( !app.actor ) return;
  console.log(`--- LUCK SYSTEM DIAGNOSTIC ---`);
  console.log(`An actor sheet has rendered. Its class name is: ${app.constructor.name}`);
  console.log(`The actor is: ${app.actor.name}`);
  console.log(`------------------------------`);
});

// All other code is temporarily removed to ensure this diagnostic runs.