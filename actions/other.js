import { Helpers } from "../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="otherActions") {
    return Helpers.getDocumentationUrl(path, action);
}

export const otherAction = {

    id: 'other',

    buttonActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [] };

        if (settings.function === 'rollModifier') {
            actions.update.push({
                run: this.onUpdateRollModifiers,
                on: ['mdUpdateRollModifier']
            })
            actions.keyDown.push({
                run: this.onKeypressRollModifiers
            }) 
        }
        else if (settings.function === 'rollType') {
            actions.update.push({
                run: this.onUpdateRollType,
                on: ['mdUpdateRollType']
            })
            actions.keyDown.push({
                run: this.onKeypressRollType
            }) 
        }
        else if (settings.function === 'attackMode') {
            actions.update.push({
                run: this.onUpdateAttackMode,
                on: ['mdUpdateAttackMode']
            })
            actions.keyDown.push({
                run: this.onKeypressAttackMode
            }) 
        }
        return actions;
    },

    onUpdateRollModifiers: function(data) {
        const mode = data.settings.rollModifier.mode;

        return {
            text: data.settings.display.modeName ? Helpers.getRollModifiers().find(a => a.value === mode)?.label : '',
            icon: data.settings.display.icon ? Helpers.getRollModifierIcon(mode) : "",
            options: {
                border: true,
                borderColor: Helpers.rollModifier.get() === mode ? data.settings.colors.rollModeOn : data.settings.colors.rollModeOff,
            }
        };
    },

    onKeypressRollModifiers: function(data) {
        Helpers.rollModifier.set(data.settings.rollModifier.mode, data.settings.rollModifier.reset);
    },

    onUpdateRollType: function(data) {
        const mode = data.settings.rollType.mode;

        return {
            text: data.settings.display.modeName ? Helpers.getRollTypes().find(a => a.value === mode)?.label : "",
            icon: data.settings.display.icon ? Helpers.getRollTypeIcon(mode) : "",
            options: {
                border: true,
                borderColor: Helpers.rollType.get() === mode ? data.settings.colors.rollModeOn : data.settings.colors.rollModeOff,
            }
        };
    },

    onKeypressRollType: function(data) {
        Helpers.rollType.set(data.settings.rollType.mode, data.settings.rollType.reset);
    },

    onUpdateAttackMode: function(data) {
        const mode = data.settings.attackMode.mode;

        return {
            text: data.settings.display.modeName ? Helpers.getAttackModes().find(a => a.value === mode)?.label : "",
            icon: data.settings.display.icon ? Helpers.getAttackModeIcon(mode) : "",
            options: {
                border: true,
                borderColor: Helpers.attackMode.get() === mode ? data.settings.colors.rollModeOn : data.settings.colors.rollModeOff,
            }
        };
    },

    onKeypressAttackMode: function(data) {
        Helpers.attackMode.set(data.settings.attackMode.mode, data.settings.attackMode.reset);
    },

    settingsConfig: function() {
        return [
            {
                id: "function",
                link: "",
                appendOptions: [
                    { value: 'rollModifier', label: localize('SetDefaultRollModifier') },
                    { value: 'rollType', label: localize('SetDefaultRollType') },
                    { value: 'attackMode', label: localize('SetDefaultAttackMode') }
                ]
            },{
                id: `rollModifier-wrapper`,
                type: "wrapper",
                indent: true,
                before: "pause.mode",
                visibility: { showOn: [{ function: "rollModifier" }]},
                settings:[
                    {
                        id: "rollModifier.mode",
                        label: localize('Modifier'),
                        link: "",
                        type: "select",
                        options: Helpers.getRollModifiers()
                        ,
                    },{
                        id: "rollModifier.reset",
                        label: localize('SetAfterUseTo'),
                        link: "",
                        type: "select",
                        indent: true,
                        sync: "rollModifier.pageWide",
                        options: [
                            { value: 'none', label: localize('DoNotChange') },
                            ...Helpers.getRollModifiers()
                        ]
                    },{
                        label: '',
                        id: "rollModifier.pageWide",
                        type: "checkbox",
                        default: true,
                        visibility: false
                    }
                ]
            },{
                id: `rollType-wrapper`,
                type: "wrapper",
                indent: true,
                before: "pause.mode",
                visibility: { showOn: [{ function: "rollType" }]},
                settings:[
                    {
                        id: "rollType.mode",
                        label: localize('Type', 'DND5E'),
                        link: "",
                        type: "select",
                        options: [
                            ...Helpers.getRollTypes()
                        ],
                    },{
                        id: "rollType.reset",
                        label: localize('SetAfterUseTo'),
                        link: "",
                        type: "select",
                        indent: true,
                        sync: "rollType.pageWide",
                        options: [
                            { value: 'none', label: localize('DoNotChange') },
                            ...Helpers.getRollTypes()
                        ]
                    },{
                        label: '',
                        id: "rollType.pageWide",
                        type: "checkbox",
                        default: true,
                        visibility: false
                    }
                ]
            },{
                id: `attackMode-wrapper`,
                type: "wrapper",
                indent: true,
                before: "pause.mode",
                visibility: { showOn: [{ function: "attackMode" }]},
                settings:[
                    {
                        id: "attackMode.mode",
                        label: localize('Mode', 'MD'),
                        link: "",
                        type: "select",
                        options: [
                            ...Helpers.getAttackModes()
                        ],
                    },{
                        id: "attackMode.reset",
                        label: localize('SetAfterUseTo'),
                        link: "",
                        type: "select",
                        indent: true,
                        sync: "attackMode.pageWide",
                        options: [
                            { value: 'none', label: localize('DoNotChange') },
                            ...Helpers.getAttackModes()
                        ]
                    },{
                        label: "",
                        id: "attackMode.pageWide",
                        type: "checkbox",
                        default: true,
                        visibility: false
                    }
                ]
            },{
                id: "display-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { function: "rollModifier" },
                            { function: "rollType" },
                            { function: "attackMode" }
                        ]
                    }
                ],
                prependColumns: [
                    {
                        label: localize("Name", "ALL"),
                    }
                ],
                prependRows: [
                    [
                        {
                            id: "display.modeName",
                            type: "checkbox",
                            default: true
                        }
                    ]
                ]
            },{
                id: "colors-table",
                prependColumnVisibility: [
                    { 
                        showOn: [ 
                            { function: "rollModifier" },
                            { function: "rollType" },
                            { function: "attackMode" }
                        ]
                    },{ 
                        showOn: [ 
                            { function: "rollModifier" },
                            { function: "rollType" },
                            { function: "attackMode" }
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
                            id: "colors.rollModeOn",
                            type: "color",
                            default: "#FFFF00"
                        },{
                            id: "colors.rollModeOff",
                            type: "color",
                            default: "#000000"
                        }
                    ]
                ]
            }
        ]
    }
}