import { Helpers } from "../helpers.js";
import { tokenMode } from "./tokenModes/tokenMode.js";
import { inventoryMode } from "./tokenModes/inventoryMode.js";
import { featureMode } from "./tokenModes/featureMode.js";
import { spellbookMode } from "./tokenModes/spellbookMode.js";

const localize = Helpers.localize;

export const tokenAction = {

    id: 'token',

    buttonActions: function(settings) {
        if (settings.mode === 'token') return tokenMode.getActions(settings);
        else if (settings.mode === 'inventory') return inventoryMode.getActions(settings);
        else if (settings.mode === 'features') return featureMode.getActions(settings);
        else if (settings.mode === 'spellbook') return spellbookMode.getActions(settings);
        return { update: [], keyDown: [], keyUp: [] };
    },

    settingsConfig: function() {
        return [
            ...tokenMode.getSettings(),
            {
                id: "mode",
                appendOptions: [
                    { value: "inventory", label: localize('Inventory', 'DND5E') },
                    { value: "features", label: localize('Features', 'DND5E') },
                    { value: "spellbook", label: localize('Spellbook', 'DND5E') }
                ]
            },{
                id: "inventory-wrapper",
                type: "wrapper",
                after: "mode",
                visibility: { showOn: [ { mode: "inventory" } ] },
                indent: 1,
                settings: inventoryMode.getSettings()
            },{
                id: "features-wrapper",
                type: "wrapper",
                after: "mode",
                visibility: { showOn: [ { mode: "features" } ] },
                indent: 1,
                settings: featureMode.getSettings()
            },{
                id: "spellbook-wrapper",
                type: "wrapper",
                after: "mode",
                visibility: { showOn: [ { mode: "spellbook" } ] },
                indent: 1,
                settings: spellbookMode.getSettings()
            },{
                id: "colors-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { mode: "token", [`tokenMode.keyUp.mode`]: "condition" },
                            { mode: "token", [`tokenMode.hold.mode`]: "condition" },
                            { mode: "inventory", ['inventoryMode.mode']: "offset", [`inventoryMode.offset.mode`]: "set" },
                            { mode: "inventory", [`inventoryMode.keyUp.mode`]: "equip" },
                            { mode: "inventory", ['inventoryMode.mode']: "setSyncFilter" },
                            { mode: "features", ['featureMode.mode']: "offset", [`featureMode.offset.mode`]: "set" },
                            { mode: "features", ['featureMode.mode']: "setSyncFilter" },
                            { mode: "spellbook", ['spellbookMode.mode']: "offset", [`spellbookMode.offset.mode`]: "set" },
                            { mode: "spellbook", ['spellbookMode.mode']: "setSyncFilter" }
                        ]
                    },{ 
                        showOn: [ 
                            { mode: "token", [`tokenMode.keyUp.mode`]: "condition" },
                            { mode: "token", [`tokenMode.hold.mode`]: "condition" },
                            { mode: "inventory", ['inventoryMode.mode']: "offset", [`inventoryMode.offset.mode`]: "set" },
                            { mode: "inventory", [`inventoryMode.keyUp.mode`]: "equip" },
                            { mode: "inventory", ['inventoryMode.mode']: "setSyncFilter" },
                            { mode: "features", ['featureMode.mode']: "offset", [`featureMode.offset.mode`]: "set" },
                            { mode: "features", ['featureMode.mode']: "setSyncFilter" },
                            { mode: "spellbook", ['spellbookMode.mode']: "offset", [`spellbookMode.offset.mode`]: "set" },
                            { mode: "spellbook", ['spellbookMode.mode']: "setSyncFilter" }
                        ]
                    }
                ],
                prependColumns: [
                    {
                        label: localize("OnColor", "MD"),
                    },{
                        label: localize("OffColor", "MD"),
                    }
                ],
                prependRows: [
                    [
                        {
                            id: "colors.system.on",
                            type: "color",
                            default: "#FFFF00"
                        },{
                            id: "colors.system.off",
                            type: "color",
                            default: "#000000"
                        }
                    ]
                ]
            }
        ]
    }

}