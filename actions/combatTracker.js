import { tokenAction } from "./token.js";
import { tokenMode } from "./tokenModes/tokenMode.js";

export const combatTrackerAction = {

    id: 'combattracker',

    buttonActions: function(settings) {
        settings.mode = 'token';
        return tokenAction.buttonActions(settings);
    },

    settingsConfig: function() {
        return [
            ...tokenMode.getSettings()
        ]
    }

}