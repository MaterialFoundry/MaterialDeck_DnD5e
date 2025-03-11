import { tokenAction } from "./actions/token.js";
import { otherAction } from "./actions/other.js";
import { combatTrackerAction } from "./actions/combatTracker.js";
import { Helpers } from "./helpers.js";

export const documentation = "https://materialfoundry.github.io/MaterialDeck_DnD5e/";

Hooks.once('MaterialDeck_Ready', () => {
    Helpers.attackMode = new game.materialDeck.Helpers.ModeSwitcher('default', 'mdUpdateAttackMode');
    Helpers.rollType = new game.materialDeck.Helpers.ModeSwitcher('default', 'mdUpdateRollType');
    Helpers.rollModifier = new game.materialDeck.Helpers.ModeSwitcher('normal', 'mdUpdateRollModifier');
    
    const moduleData = game.modules.get('materialdeck-dnd5e');

    game.materialDeck.registerSystem({
        systemId: 'dnd5e',
        moduleId: 'materialdeck-dnd5e',
        systemName: 'Dungeons & Dragons 5e',
        version: moduleData.version,
        manifest: moduleData.manifest,
        documentation, 
        actions: [
            tokenAction,
            otherAction,
            combatTrackerAction
        ]
    });
});