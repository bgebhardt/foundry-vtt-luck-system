Hooks.on("ready", () => {
  for (let actor of game.actors.contents) {
    if (actor.type !== "character") continue;

    // Use the "primary" resource slot
    let res = actor.system.resources.primary;

    if (!res?.label || res.label === "") {
      actor.update({
        "system.resources.primary.label": "Luck Points",
        "system.resources.primary.value": 0,
        "system.resources.primary.max": 5
      });
    }
  }
});