import { Helpers } from "../../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="token") {
    return Helpers.getDocumentationUrl(path, action);
}

let featureOffset = 0;

export const featureMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'features') continue;
                button.update('md-dnd5e.updateAllTokenFeatures')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [] };
        
        const featureSettings = settings.featureMode;

        if (featureSettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else if (featureSettings.mode === 'setSyncFilter') {
            actions.update.push({
                run: this.onSetSyncFilterUpdate,
                on: ['md-token-PageSettingChanged']
            });
            actions.keyDown.push({
                run: this.onSetSyncFilterKeydown
            })
        }

        else {
            actions.update.push({
                run: this.onFeatureUpdate,
                on: ['updateItem', 'refreshToken']
            });
            actions.keyDown.push({
                run: this.onFeatureKeydown
            });
        }
        
        
        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.featureMode.offset;
        let icon = '';
        if (data.settings.display.featureMode.icon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.featureMode.offset ? featureOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && featureOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.featureMode.offset;
        if (settings.mode === 'set') featureOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') featureOffset += parseInt(settings.value);

        featureMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.featureMode.setSync.mode;
        const displaySettings = data.settings.display.featureMode.setSync;

        let thisSelected = false;
        const syncedSettings = game.materialDeck.streamDeck.syncedSettings?.page?.token?.['featureMode.syncFilter'];
        if (syncedSettings && syncedSettings.length > 0) {
            thisSelected = true;
            for (let s of syncedSettings) {
                const val = game.materialDeck.Helpers.getNestedObjectValue(s.key.replace('featureMode.', ''), data.settings.featureMode.setSync);
                if (val !== s.value) {
                    thisSelected = false;
                    break;
                }
            }
        }

        let icon = '';
        if (displaySettings.icon) {
            if (mode === 'any') icon = 'fas fa-suitcase';
            else if (mode === 'class') icon = 'systems/dnd5e/icons/svg/items/class.svg';
            else if (mode === 'subclass') icon = 'systems/dnd5e/icons/svg/items/subclass.svg';
            else if (mode === 'background') icon = 'systems/dnd5e/icons/svg/items/background.svg';
            else if (mode === 'race') icon = 'systems/dnd5e/icons/svg/items/race.svg';
            else if (mode === 'feat') icon = 'systems/dnd5e/icons/svg/items/feature.svg';
        }
        
        let text = displaySettings.name ? getFeatureTypes().find(t => t.value === mode)?.label : '';

        return {
            text,
            icon,
            options: {
                border: true,
                borderColor: thisSelected ? data.settings.colors.system.on : data.settings.colors.system.off,
                dim: true
            }
        }
        
    },

    onSetSyncFilterKeydown: function(data) {
        const settings = data.settings.featureMode.setSync;

        let syncedSettings = [
            { key: 'featureMode.mode', value: settings.mode },
            { key: 'featureMode.selection.filter.featureType.feat', value: settings.selection.filter.featureType.feat },
            { key: 'featureMode.selection.filter.featureType.class', value: settings.selection.filter.featureType.class },
            { key: 'featureMode.selection.filter.featureType.special', value: settings.selection.filter.featureType.special },
            { key: 'featureMode.selection.filter.featureType.action', value: settings.selection.filter.featureType.action },
            { key: 'featureMode.selection.filter.featureType.bonus', value: settings.selection.filter.featureType.bonus },
            { key: 'featureMode.selection.filter.featureType.reaction', value: settings.selection.filter.featureType.reaction },
            { key: 'featureMode.selection.filter.featureType.legendary', value: settings.selection.filter.featureType.legendary },
            { key: 'featureMode.selection.filter.featureType.mythic', value: settings.selection.filter.featureType.mythic },
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'featureMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onFeatureUpdate: function(data) {
        const feature = getFeature(data.actor, data.settings.featureMode);
       
        if (data.hooks === 'updateItem' && data.args[0].id !== feature.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== data.token?.id) return 'doNothing';

        if (!feature) return;

        const displaySettings = data.settings.display.featureMode;

        return {
            text: displaySettings.name ? feature.name : '', 
            icon: displaySettings.icon ? feature.img : '', 
            options: {
                uses: {
                    available: displaySettings.uses ? feature.system.uses?.value : undefined,
                    maximum: displaySettings.uses ? feature.system.uses?.max : undefined,
                    box: displaySettings.uses ? feature.system.uses?.max : undefined
                }
            }
        };
    },

    onFeatureKeydown: function(data) {
        const feature = getFeature(data.actor, data.settings.featureMode);

        const rollModifier = Helpers.rollModifier.get(true);
        const rollType = Helpers.rollType.get(true);
        const attackMode = Helpers.attackMode.get(true);
        const supportedAttackModes = feature.system.attackModes;
        
        if (attackMode !== 'default' && !supportedAttackModes.find(m => m.value === attackMode))
            return game.materialDeck.notify('warn', localize("InvalidAttackMode", "", {attackMode, itemName: feature.name}))
    
        Helpers.useItem(feature, 
            {
                rollModifier, 
                rollType, 
                attackMode, 
                showDialog:false
            }
        );
    },

    getSelectionSettings(type='', sync='featureMode.syncFilter') {
        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize('TYPES.Item.feat', 'ALL'), children: [
                    { value: 'any', label: localize('Any', 'MD') },
                    ...getFeatureTypes()
                ]},
                { value: 'setSyncFilter', label: localize('SetTypeAndFilterSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = [
            { value: 'any', label: localize('Any', 'MD') },
            ...getFeatureTypes()
        ]

        return [{
            label: localize('FeatureType'),
            id: `featureMode${type}.mode`,
            type: "select",
            default: "any",
            link: getDocs('#features-mode'),
            sync,
            options: modeOptions
        },{
            label: localize("FeatureTypeFilter"),
            id: `featureMode${type}-filter-table`,
            type: "table",
            visibility: { 
                showOn: [ 
                    { [`featureMode${type}.mode`]: "any" },
                    { [`featureMode${type}.mode`]: "feat" },
                    { [`featureMode.mode`]: type === "" ? "" : "setSyncFilter" } 
                ] 
            },
            columns: 
            [
                { label: localize('TYPES.Item.featurePl', 'ALL') },
                { label: localize('TYPES.Item.class', 'ALL') },
                { label: localize('Special', 'DND5E') }
            ],
            rows: 
            [
                [
                    { 
                        id: `featureMode${type}.selection.filter.featureType.feat`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `featureMode${type}.selection.filter.featureType.class`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `featureMode${type}.selection.filter.featureType.special`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ],[
                    { 
                        label: localize('Action', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('BonusAction', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('Reaction', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    }
                ],[
                    { 
                        id: `featureMode${type}.selection.filter.featureType.action`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `featureMode${type}.selection.filter.featureType.bonus`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `featureMode${type}.selection.filter.featureType.reaction`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ],[
                    { 
                        label: localize('LegendaryAction.Label', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('MythicActionLabel', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{}
                ],[
                    { 
                        id: `featureMode${type}.selection.filter.featureType.legendary`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `featureMode${type}.selection.filter.featureType.mythic`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{}
                ]
            ]
        }]
    },

    getSettings: function() {
        return [
            ...featureMode.getSelectionSettings(),
            {
                id: `featureMode-feature-wrapper`,
                type: "wrapper",
                visibility: { 
                    hideOn: [ 
                        { [`featureMode.mode`]: "offset" },
                        { [`featureMode.mode`]: "setSyncFilter" } 
                    ] 
                },
                settings:[
                    {
                        label: localize('SyncTypeAndFilter'),
                        id: 'featureMode.syncFilter',
                        type: 'checkbox',
                        link: getDocs('#synced-settings'),
                        indent: true,
                    },{
                        label: localize('Selection', 'MD'),
                        id: "featureMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("FACILITY.FIELDS.order.label", "DND5E"),
                        id: "featureMode.selection.order",
                        type: "select",
                        indent: true,
                        options: [
                            {value:'order', label: localize('CharacterSheet')},
                            {value:'name', label: localize('Alphabetically')}
                        ],
                        visibility: { showOn: [ { ["featureMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Nr", "MD"),
                        id: "featureMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ["featureMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "featureMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ["featureMode.selection.mode"]: "nameId" } ] }
                    },{
                        type: "line-right"
                    }
                ]
            },{
                id: `featureMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`featureMode.mode`]: "offset" } ] },
                settings:
                [
                    {
                        label: localize("Offset", "MD"),
                        id: "featureMode.offset.mode",
                        type: "select",
                        link: getDocs('#offset'),
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "DND5E"),
                        id: "featureMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    }
                ]
            },{
                id: `featureMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`featureMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...featureMode.getSelectionSettings('.setSync', undefined),
                    {
                        label: localize("Display", "MD"),
                        id: "featureMode-setSync-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Name", "ALL") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.featureMode.setSync.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.featureMode.setSync.name",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                label: localize("Display", "MD"),
                id: "featureMode-display-table",
                type: "table",
                visibility: { hideOn: [{ ['featureMode.mode']: "setSyncFilter" }] },
                columnVisibility: [
                    true,
                    { hideOn: [{ mode: "features", ['featureMode.mode']: "offset" }] },
                    { hideOn: [{ mode: "features", ['featureMode.mode']: "offset" }] },
                    { showOn: [{ mode: "features", ['featureMode.mode']: "offset" }] }
                ],
                columns: 
                [
                    { label: localize("Icon", "MD") },
                    { label: localize("Name", "ALL") },
                    { label: localize("Uses", "DND5E") },
                    { label: localize("Offset", "MD") }
                ],
                rows: 
                [
                    [
                        {
                            id: "display.featureMode.icon",
                            type: "checkbox",
                            default: true
                        },{
                            id: "display.featureMode.name",
                            type: "checkbox",
                            default: true
                        },{
                            id: "display.featureMode.uses",
                            type: "checkbox",
                            default: true
                        },{
                            id: "display.featureMode.offset",
                            type: "checkbox",
                            default: true
                        }
                    ]
                ]
            }
        ]
    }
}

function getFeatureTypes() {
    return [
        { value: "class", label: localize('TYPES.Item.classPl', 'ALL') },
        { value: "subclass", label: localize('TYPES.Item.subclassPl', 'ALL') },
        { value: "background", label: localize('TYPES.Item.backgroundPl', 'ALL') },
        { value: "race", label: localize('TYPES.Item.raceLegacyPl', 'ALL') },
        { value: "feat", label: localize('TYPES.Item.featurePl', 'ALL') }
    ]
}

function getFeatureSubTypes() {
    return [
        { value: "class", label: "TYPES.Item.class"},
        { value: "special", label: "DND5E.Special" },
        { value: "action", label: "DND5E.Action" },
        { value: "bonus", label: "DND5E.BonusAction" },
        { value: "reaction", label: "DND5E.Reaction" },
        { value: "legendary", label: "DND5E.LegendaryAction.Label" },
        { value: "mythic", label: "DND5E.MythicActionLabel" }
    ]
}

function getFeature(actor, settings) {
    let featuresObj = {};
    const featureTypes = getFeatureTypes();
    const featureSubTypes = getFeatureSubTypes();

    const selectionType = settings.mode;
    const featureFilter = settings.selection.filter.featureType;

    //Add features
    for (let featureType of featureTypes) {
        const feat = featureType.value;
        
        let items = actor.itemTypes[feat];
        featuresObj[feat] = {
            items: [],
            subTypes: {}
        }
        if (selectionType !== 'any' && selectionType !== feat) continue;
        
        for (let item of items) {
            let subType = Helpers.getItemActivityActivationType(item);
            if (!subType || subType === '' ) subType = item.system.type?.value;
            if (featureFilter[subType] === false) continue;

            if (subType === 'background')
                featuresObj[feat].items.push(item);
            else if (subType && subType !== '' && feat === 'race')
                featuresObj[feat].items.push(item);
            else if (subType && subType !== '') {
                if (!featuresObj[feat].subTypes[subType]) featuresObj[feat].subTypes[subType] = [item];
                else featuresObj[feat].subTypes[subType].push(item);
            }
            else {
                if (feat === 'feat' && !featureFilter.feat) continue;
                featuresObj[feat].items.push(item);
            }
        }
    }

    //Add weapons
    if ((selectionType === 'any' || selectionType === 'feat') && actor.type === 'npc') {
        for (let item of actor.items.filter(i=>i.type==='weapon')) {
            let subType = Helpers.getItemActivityActivationType(item);
            if (!subType || subType == '') continue;
            if (featureFilter[subType] === false) continue;
    
            if (!featuresObj.feat.subTypes[subType]) featuresObj.feat.subTypes[subType] = [item];
            else featuresObj.feat.subTypes[subType].push(item);
        }
    }

    let features = [];
    //Create array
    for (let featureType of featureTypes) {
        const feat = featureType.value;

        let items = featuresObj[feat]?.items || [];
        if (settings.selection.order === 'order') items = Object.values(items).sort((a, b) => a.order - b.order);
        features.push(...items);

        if (feat === 'feat') {
            const subTypes = featuresObj[feat]?.subTypes;
            for (let featureSubType of featureSubTypes) {
                let items = subTypes[featureSubType.value] || [];
                if (settings.selection.order === 'order') items = Object.values(items).sort((a, b) => a.order - b.order);
                features.push(...items);
            }
        }
    }

    if (settings.selection.order === 'name') features = game.materialDeck.Helpers.sort(features, settings.selection.order);

    let feature;
    if (settings.selection.mode === 'nr') {
        let featureNr = parseInt(settings.selection.nr) - 1 + featureOffset;
        feature = features[featureNr];
    }
    else if (settings.selection.mode === 'nameId') {
        feature = features.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!feature) feature = features.find(i => i.name === settings.selection.nameId);
        if (!feature) feature = features.find(i => game.materialDeck.Helpers.stringIncludes(i.name, settings.selection.nameId));
    }

    return feature;
}