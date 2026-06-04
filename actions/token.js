import { Helpers } from "../helpers.js";
import { tokenMode } from "./tokenModes/tokenMode.js";
import { inventoryMode } from "./tokenModes/inventoryMode.js";
import { featureMode } from "./tokenModes/featureMode.js";
import { spellbookMode } from "./tokenModes/spellbookMode.js";

const localize = Helpers.localize;

export const tokenAction = {

    id: 'token',

    buttonActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [], dial: [] };
        if (settings.mode === 'token') actions = tokenMode.getActions(settings);
        else if (settings.mode === 'inventory') actions = inventoryMode.getActions(settings);
        else if (settings.mode === 'features') actions = featureMode.getActions(settings);
        else if (settings.mode === 'spellbook') actions = spellbookMode.getActions(settings);

        actions.update.push({
            run: this.updateWoundOverlay,
            on: ['updateActor', 'createToken', 'deleteToken'],
            source: 'always'
        })

        return actions;
    },

    updateWoundOverlay: function(data) {
        if (!data.actor) return;
        const settings = data.settings.overlay;
        if (!settings || settings.mode === "none") return;

        const hp = data.actor.system.attributes.hp;
        const perc = hp.value/hp.max;

        const overlayData = materialDeck.overlays.get(settings.mode);

        let overlay = "null";
        for (let o of overlayData.overlays) {
            if (perc > o.value) continue;
            overlay = structuredClone(o);
            break;
        }

        if (overlay === "null") return;

        if (!overlay.color) overlay.color = settings.color;
        if (!overlay.alpha) overlay.alpha = settings.alpha;

        return {overlay}
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
                id: "overlay-wrapper",
                type: "wrapper",
                before: "color-wrapper",
                settings: [
                    {
                        id: "overlay-contents",
                        type: "wrapper",
                        label: "Wound Overlay",
                        expandable: true,
                        settings: [
                            {
                                label: localize('Overlays.Wound', 'MD'),
                                id: "overlay.mode",
                                type: "select",
                                options: [
                                    { value: "none", label: localize("None", "MD") },
                                    ...materialDeck.overlays.getList("wound")
                                ]
                            },{
                                label: localize('Opacity', 'MD'),
                                id: "overlay.alpha",
                                type: "range",
                                default: 0.6,
                                min: 0,
                                max: 1,
                                step: 0.05,
                                displayValue: true,
                                indent: true
                            },{
                                label: localize('Color', 'MD'),
                                id: "overlay.color",
                                type: "color",
                                default: "#FF0000",
                                indent: true
                            }
                        ]
                    },{
                        type: "line"
                    }
                ]
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