import { Helpers } from "../../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="token") {
    return Helpers.getDocumentationUrl(path, action);
}

let inventoryOffset = 0;

export const inventoryMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'inventory') continue;
                button.update('md-dnd5e.updateAllTokenInventory')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        const holdTime = game.materialDeck.holdTime;

        const inventorySettings = settings.inventoryMode;

        if (inventorySettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else if (inventorySettings.mode === 'setSyncFilter') {
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
                run: this.onInventoryUpdate,
                on: ['updateItem', 'refreshToken']
            });
            
            const onPress = inventorySettings.keyUp.mode;
            const onHold = inventorySettings.hold.mode;
            
            if (onPress === 'useItem') {
                actions.keyUp.push({
                    run: this.onKeypressUseItem,
                    stopOnHold: true
                });
            }
            if (onHold === 'useItem') {
                actions.hold.push({
                    run: this.onKeypressUseItem,
                    delay: holdTime
                });
            }

            if (onPress === 'equip') {
                actions.keyUp.push({
                    run: this.onKeypressEquip,
                    stopOnHold: true
                });
            }
            if (onHold === 'equip') {
                actions.hold.push({
                    run: this.onKeypressEquip,
                    delay: holdTime
                });
            }

            if (onPress === 'setQuantity') {
                actions.keyUp.push({
                    run: this.onKeypressSetQuantity,
                    stopOnHold: true
                });
            }
            if (onHold === 'setQuantity') {
                actions.hold.push({
                    run: this.onKeypressSetQuantity,
                    delay: holdTime
                });
            }

            if (onPress === 'setCharges') {
                actions.keyUp.push({
                    run: this.onKeypressSetCharges,
                    stopOnHold: true
                });
            }
            if (onHold === 'setCharges') {
                actions.hold.push({
                    run: this.onKeypressSetCharges,
                    delay: holdTime
                });
            }
        }

        
        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.inventoryMode.offset;
        let icon = '';
        if (data.settings.display.inventoryMode.offsetIcon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.inventoryMode.offset ? inventoryOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && inventoryOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.inventoryMode.offset;
        if (settings.mode === 'set') inventoryOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') inventoryOffset += parseInt(settings.value);

        inventoryMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.inventoryMode.setSync.mode;
        const displaySettings = data.settings.display.inventoryMode.setSync;
        const filter = data.settings.inventoryMode.setSync.selection.filter;

        let thisSelected = false;
        const syncedSettings = game.materialDeck.streamDeck.syncedSettings?.page?.token?.['inventoryMode.syncFilter'];
        if (syncedSettings && syncedSettings.length > 0) {
            thisSelected = true;
            for (let s of syncedSettings) {
                const val = game.materialDeck.Helpers.getNestedObjectValue(s.key.replace('inventoryMode.', ''), data.settings.inventoryMode.setSync);
                if (val !== s.value) {
                    thisSelected = false;
                    break;
                }
            }
        }

        let icon = '';
        if (displaySettings.icon) {
            let iconSrc = '';
            if (mode === 'any') iconSrc = 'fas fa-suitcase';
            else if (mode === 'weapon') iconSrc = 'fas fa-sword';
            else if (mode === 'equipment') iconSrc = 'fas fa-toolbox';
            else if (mode === 'consumable') iconSrc = 'fas fa-flask';
            else if (mode === 'tool') iconSrc = 'fas fa-screwdriver-wrench';
            else if (mode === 'container') iconSrc = 'fas fa-backpack';
            else if (mode === 'loot') iconSrc = 'fas fa-gem';

            if (displaySettings.filter) {
                icon = [{icon: iconSrc, size: 0.8, spacing: {x:0, y:30}}]
                if (filter.equipped) icon.push({icon: 'fas fa-shield-halved', size: 0.3, spacing: {x:-56, y:-15}})
                if (filter.unequipped) icon.push({icon: 'fas fa-shield-halved', size: 0.3, spacing: {x:-28, y:-15}, color: '#454545'})
                if (filter.unequippable) icon.push({icon: 'fas fa-shield-xmark', size: 0.3, spacing: {x:-0, y:-15}, color: '#454545'})
                if (filter.attuned) icon.push({icon: 'fas fa-sun', size: 0.3, spacing: {x:28, y:-15}})
                if (filter.unattuned) icon.push({icon: 'fas fa-sun', size: 0.3, spacing: {x:56, y:-15}, color: '#454545'})
            }
            else {
                icon = iconSrc
            }
        }
        else if (displaySettings.filter) {
            icon = []
            if (filter.equipped) icon.push({icon: 'fas fa-shield-halved', size: 0.4, spacing: {x:-45, y:50}})
            if (filter.unequipped) icon.push({icon: 'fas fa-shield-halved', size: 0.4, spacing: {x:0, y:50}, color: '#454545'})
            if (filter.unequippable) icon.push({icon: 'fas fa-shield-xmark', size: 0.4, spacing: {x:45, y:50}, color: '#454545'})
            if (filter.attuned) icon.push({icon: 'fas fa-sun', size: 0.4, spacing: {x:-22.5, y:5}})
            if (filter.unattuned) icon.push({icon: 'fas fa-sun', size: 0.4, spacing: {x:22.5, y:5}, color: '#454545'})
        }
        
        let text = displaySettings.name ? getItemTypes().find(t => t.value === mode)?.label : '';

        return {
            text,
            icon,
            options: {
                border: true,
                borderColor: thisSelected ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
        
    },

    onSetSyncFilterKeydown: function(data) {
        const settings = data.settings.inventoryMode.setSync;

        let syncedSettings = [
            { key: 'inventoryMode.mode', value: settings.mode },
            { key: 'inventoryMode.selection.filter.attuned', value: settings.selection.filter.attuned },
            { key: 'inventoryMode.selection.filter.unattuned', value: settings.selection.filter.unattuned },
            { key: 'inventoryMode.selection.filter.equipped', value: settings.selection.filter.equipped },
            { key: 'inventoryMode.selection.filter.unequipped', value: settings.selection.filter.unequipped },
            { key: 'inventoryMode.selection.filter.unequippable', value: settings.selection.filter.unequippable },
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'inventoryMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onInventoryUpdate: function(data) {
        const settings = data.settings.inventoryMode;
        const item = getItem(data.actor, settings);
        if (!item) return;

        if (data.hooks === 'updateItem' && data.args[0].id !== item.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';
        
        let text = "";
        let options = {};
        let toHit = ''
        let damage = '';

        const displaySettings = data.settings.display.inventoryMode;
        if (displaySettings.name) text = item.name;

        const attackActivity = item.system.activities?.find(a => a.type === 'attack');

        if (attackActivity) {
            //Get toHit
            toHit = attackActivity.labels.toHit;

            //Get damage
            for (let type of attackActivity.labels.damage) {
                if (type.base) damage += `${type.formula}`;
                else if (type.formula !== '') damage += ` (${type.formula})`
            }

            if (text !== '') text += '\n';
            if (displaySettings.toHit) 
                text += toHit;
            if (displaySettings.damage) {
                if (displaySettings.toHit && damage !== '') text += ` (${damage})`;
                else text += damage;
            }
            if (displaySettings.range) {
                if (displaySettings.toHit || displaySettings.damage) text += '\n';
                const range = attackActivity.range;
                const reach = range.reach;
                let ranged = range.value;
                if (range.long) ranged += `/${range.long}`;

                if (reach && ranged) text += ` ${range.reach} ${range.units}\n(${ranged} ${range.units})`;
                else if (reach) text += ` ${range.reach} ${range.units}`;
                else if (ranged) text += ` ${ranged} ${range.units}`;
            }
                
        }
        
        if (displaySettings.box === 'quantity') options.uses = { available: item.system.quantity, box: true }; 
        else if (displaySettings.box === 'uses') options.uses = { available: item.system.uses?.value, maximum: item.system.uses?.max, box: true };
        else if (displaySettings.box === 'toHit' && attackActivity) options.uses = { text: toHit, box: true };
        else if (displaySettings.box === 'damage' && attackActivity) options.uses = { text: damage, box: true };

        if (settings.keyUp.mode === 'equip') {
            options.border = true;
            options.borderColor = item.system.equipped ? data.settings.colors.system.on : data.settings.colors.system.off
        }

        return {
            text, 
            icon: displaySettings.icon ? item.img : '', 
            options
        };
    },

    onKeypressUseItem: function(data) {
        const settings = data.settings.inventoryMode;
        const onPressSettings = settings[data.actionType];
        const item = getItem(data.actor, settings);
        if (!item) return;
        useItem(item, onPressSettings)
    },

    onKeypressEquip: function(data) {
        const settings = data.settings.inventoryMode;
        const mode = settings[data.actionType].equip.mode;
        const item = getItem(data.actor, settings);
        if (!item) return;
        
        if (mode === 'toggle') item.update({"system.equipped": !item.system.equipped});
        else if (mode === 'equip') item.update({"system.equipped": true});
        else if (mode === 'unequip') item.update({"system.equipped": false});
    },

    onKeypressSetQuantity: function(data) {
        const settings = data.settings.inventoryMode;
        const setQuantitySettings = settings[data.actionType].setQuantity;
        const item = getItem(data.actor, settings);
        if (!item) return;
        
        let quantity;
        if (setQuantitySettings.mode === 'set') quantity = parseInt(setQuantitySettings.value);
        else if (setQuantitySettings.mode === 'increment') quantity = item.system.quantity + parseInt(setQuantitySettings.value);
        item.update({"system.quantity": quantity})
    },

    onKeypressSetCharges: function(data) {
        const settings = data.settings.inventoryMode;
        const setChargeSettings = settings.setCharges;
        const item = getItem(data.actor, settings);
        if (!item) return;
        
        let uses = item.system.uses;
        if (!uses) return;

        if (setChargeSettings.mode === 'reset') {
            uses.value = uses.max;
            uses.spent = 0;
        }
        else if (setChargeSettings.mode === 'set') {
            const val = parseInt(setChargeSettings.value);
            uses.value = val;
            uses.spent = uses.max - val;
        }
        else if (setChargeSettings.mode === 'increment') {
            const val = uses.value + parseInt(setChargeSettings.value);
            uses.value = val;
            uses.spent = uses.max - val;
        }
        item.update({"system.uses": uses})
    },

    getSelectionSettings(type='', sync='inventoryMode.syncFilter') {

        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize("DOCUMENT.Item", "ALL"), children: getItemTypes()},
                { value: 'setSyncFilter', label: localize('SetTypeAndFilterSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = getItemTypes()

        return [{
            label: localize('ENCHANT.FIELDS.restrictions.type.label', 'DND5E'),
            id: `inventoryMode${type}.mode`,
            type: "select",
            default: "any",
            link: getDocs('#inventory-mode'),
            sync,
            options: modeOptions
        },{
            label: localize("SelectionFilter"),
            id: `inventoryMode${type}-selectionFilter-table`,
            type: "table",
            visibility: { 
                hideOn: [ 
                    { [`inventoryMode.mode`]: "offset" },
                    { [`inventoryMode.mode`]: type === "" ? "setSyncFilter" : "" } 
                ] 
            },
            columns: 
            [
                { label: localize('Equipped', 'DND5E') },
                { label: localize('Unequipped', 'DND5E') },
                { label: localize('Unequippable') },
                
            ],
            rows: 
            [
                [
                    { 
                        id: `inventoryMode${type}.selection.filter.equipped`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `inventoryMode${type}.selection.filter.unequipped`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `inventoryMode${type}.selection.filter.unequippable`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ],[
                    { 
                        label: localize('Attuned', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('Unattuned'),
                        type: 'label',
                        font: 'bold'
                    },{}
                ],[
                    { 
                        id: `inventoryMode${type}.selection.filter.attuned`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `inventoryMode${type}.selection.filter.unattuned`,
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
            ...inventoryMode.getSelectionSettings(),
            {
                label: localize('SyncTypeAndFilter'),
                id: 'inventoryMode.syncFilter',
                type: 'checkbox',
                link: getDocs('#synced-settings'),
                indent: true,
                visibility: { 
                    hideOn: [ 
                        { [`inventoryMode.mode`]: "offset" },
                        { [`inventoryMode.mode`]: "setSyncFilter" } 
                    ] 
                },
            },{
                id: `inventoryMode-item-wrapper`,
                type: "wrapper",
                visibility: { 
                    hideOn: [ 
                        { [`inventoryMode.mode`]: "offset" },
                        { [`inventoryMode.mode`]: "setSyncFilter" } 
                    ] 
                },
                settings:
                [
                    {
                        label: localize('Selection', 'MD'),
                        id: "inventoryMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("FACILITY.FIELDS.order.label", "DND5E"),
                        id: "inventoryMode.selection.order",
                        type: "select",
                        indent: true,
                        options: [
                            {value:'order', label: localize('CharacterSheet')},
                            {value:'name', label: localize('Alphabetically')}
                        ],
                        visibility: { showOn: [ { ["inventoryMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Nr", "MD"),
                        id: "inventoryMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ['inventoryMode.selection.mode']: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "inventoryMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ['inventoryMode.selection.mode']: "nameId" } ] }
                    },{
                        type: "line-right"
                    },
                    ...getItemOnPressSettings(),{
                        type: "line-right"
                    },
                    ...getItemOnPressSettings('hold'),
                    {
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-display-table",
                        type: "table",
                        columnVisibility: [
                            true,
                            true,
                            true
                        ],
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Name", "ALL") },
                            { label: localize("Box", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.name",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.box",
                                    type: "select",
                                    default: "none",
                                    options: [
                                        { value: 'none', label: localize('None', "ALL") },
                                        { value: 'quantity', label: localize('Quantity', 'DND5E') },
                                        { value: 'uses', label: localize('Uses', 'DND5E') },
                                        { value: 'toHit', label: localize('ToHit', 'DND5E') },
                                        { value: 'damage', label: localize('Damage', 'DND5E') }
                                    ]
                                }
                            ],[
                                { 
                                    type: "label", 
                                    label: localize("ToHit", "DND5E") + `&nbsp;&nbsp;`, 
                                    font: "bold" 
                                },{ 
                                    type: "label", 
                                    label: localize('Damage', 'DND5E'), 
                                    font: "bold"
                                },
                                { 
                                    type: "label", 
                                    label: localize("Range", "DND5E")  ,
                                    font: "bold"
                                }
                            ],[
                                {
                                    id: "display.inventoryMode.toHit",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.inventoryMode.damage",
                                    type: "checkbox",
                                    default: false
                                },{
                                    id: "display.inventoryMode.range",
                                    type: "checkbox",
                                    default: false
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `inventoryMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`inventoryMode.mode`]: "offset" } ] },
                settings:
                [
                    {
                        type: "line-right"
                    },{
                        label: localize("Offset", "MD"),
                        id: "inventoryMode.offset.mode",
                        type: "select",
                        link: getDocs('#offset'),
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "DND5E"),
                        id: "inventoryMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "inventoryMode-offset-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Offset", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `inventoryMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`inventoryMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...inventoryMode.getSelectionSettings('.setSync', undefined),
                    {
                        label: localize("Display", "MD"),
                        id: "inventoryMode-setSync-display-table",
                        type: "table",
                        columnVisibility: [
                            true,
                            true
                        ],
                        columns: 
                        [
                            { label: localize("Icon", "MD") },
                            { label: localize("Filter", "DND5E") },
                            { label: localize("Name", "ALL") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.inventoryMode.setSync.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.setSync.filter",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.inventoryMode.setSync.name",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            }
        ]
    }
}

function getItemTypes() {
    return [
        {value: 'any', label: Helpers.localize('Any', 'MD') },
        {value: 'weapon', label: Helpers.localize('TYPES.Item.weaponPl', 'ALL') },
        {value: 'equipment', label: Helpers.localize('TYPES.Item.equipmentPl', 'ALL') },
        {value: 'consumable', label: Helpers.localize('TYPES.Item.consumablePl', 'ALL') },
        {value: 'tool', label: Helpers.localize('TYPES.Item.toolPl', 'ALL') },
        {value: 'container', label: Helpers.localize('TYPES.Item.containerPl', 'ALL') },
        {value: 'loot', label: Helpers.localize('TYPES.Item.lootPl', 'ALL') }
    ]
}

function getItem(actor, settings) {
    let items = [];

    //Filter items
    const filter = settings.selection.filter;
    if (filter.equipped) items.push(...actor.items.filter(i => i.system.equipped === true));
    if (filter.unequipped) items.push(...actor.items.filter(i => i.system.equipped === false));
    if (filter.unequippable) items.push(...actor.items.filter(i => i.system.equipped === undefined));
    if (!filter.attuned) items = items.filter(i => i.system.attuned === undefined || i.system.attuned === false);
    if (!filter.unattuned) items = items.filter(i => i.system.attuned === true);

    if (settings.mode === 'any') 
        items = items.filter(i => i.type === 'weapon' || i.type === 'equipment' || i.type === 'consumable' || i.type === 'loot' || i.type === 'container')
    else
        items = items.filter(i => i.type === settings.mode);

    items = game.materialDeck.Helpers.sort(items, settings.selection.order);

    if (!items || items.length === 0) return;

    let item;
    if (settings.selection.mode === 'nr') {
        let itemNr = parseInt(settings.selection.nr) - 1 + inventoryOffset;
        item = items[itemNr];
    }
    else if (settings.selection.mode === 'nameId') {
        item = items.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!item) item = items.find(i => i.name === settings.selection.nameId);
        if (!item) item = items.find(i => game.materialDeck.Helpers.stringIncludes(i.name, settings.selection.nameId));
    }
    return item;
}

function useItem(item, settings) {
    const rollModifier = settings.rollModifier === 'default' ? Helpers.rollModifier.get(true) : settings.rollModifier;
    const rollType = settings.rollType === 'default' ? Helpers.rollType.get(true) : settings.rollType;
    const attackMode = settings.attackMode === 'default' ? Helpers.attackMode.get(true) : settings.attackMode;
    const supportedAttackModes = item.system.attackModes;

    if (attackMode !== 'default' && !supportedAttackModes.find(m => m.value === attackMode))
        return game.materialDeck.notify('warn', localize("InvalidAttackMode", "", {attackMode, itemName: item.name}))

    Helpers.useItem(item, 
        {
            rollModifier, 
            rollType, 
            attackMode, 
            showDialog:settings.showDialog
        }
    );
} 

function getItemOnPressSettings(type='keyUp') {
    return [
        {
            label: localize(type=='keyUp' ? 'OnPress' : 'OnHold', 'MD'),
            id: `inventoryMode.${type}.mode`,
            type: "select",
            link: getDocs("#use-item"),
            options: [
                { value: 'doNothing', label: localize('DoNothing', 'MD') },
                { value: 'useItem', label: localize('Use', 'DND5E') },
                { value: 'equip', label: localize('ContextMenuActionEquip', 'DND5E') },
                { value: 'setQuantity', label: localize('SetQuantity') },
                { value: 'setCharges', label: localize('SetCharges') }
            ]
        },{
            id: `inventoryMode-${type}-useItem-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [ { [`inventoryMode.${type}.mode`]: "useItem" } ] },
            settings:
            [
                {
                    label: localize('ShowDialog'),
                    id: `inventoryMode.${type}.showDialog`,
                    type: 'checkbox',
                    default: true
                },{
                    label: localize('RollModifier'),
                    id: `inventoryMode.${type}.rollModifier`,
                    type: "select",
                    default: "default",
                    options: [
                        { value: 'default', label: localize('Default', 'DND5E') },
                        ...Helpers.getRollModifiers()
                    ]
                },{
                    label: localize('RollType'),
                    id: `inventoryMode.${type}.rollType`,
                    type: "select",
                    default: "default",
                    options: Helpers.getRollTypes()
                },{
                    label: localize('ATTACK.Mode.Label', 'DND5E'),
                    id: `inventoryMode.${type}.attackMode`,
                    type: "select",
                    default: "default",
                    options: Helpers.getAttackModes()
                }
            ]
        },{
            label: localize("Mode", "MD"),
            id: `inventoryMode.${type}.equip.mode`,
            type: "select",
            indent: true,
            visibility: { showOn: [ { [`inventoryMode.${type}.mode`]: "equip" } ] },
            options: [
                { value: 'toggle', label: localize('Toggle', 'MD') },
                { value: 'equip', label: localize('ContextMenuActionEquip', 'DND5E') },
                { value: 'unequip', label: localize('ContextMenuActionUnequip', 'DND5E') }
            ]
        },{
            id: `inventoryMode-${type}-setQuantity-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [{ [`inventoryMode.${type}.mode`]: "setQuantity" } ]},
            settings:
            [
                {
                    label: localize("Mode", "MD"),
                    id: `inventoryMode.${type}.setQuantity.mode`,
                    type: "select",
                    options: [
                        { value: "set", label: localize("SetToValue", "MD") },
                        { value: "increment", label: localize("IncreaseDecrease", "MD") }
                    ]
                },{
                    label: localize("Value", "DND5E"),
                    id: `inventoryMode.${type}.setQuantity.value`,
                    type: "number",
                    step: "1",
                    default: "0"
                }
            ]
        },{
            id: `inventoryMode-${type}-setCharged-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [{ [`inventoryMode.${type}.mode`]: "setCharges" } ]},
            settings:
            [
                {
                    label: localize("Mode", "MD"),
                    id: `inventoryMode.${type}.setCharges.mode`,
                    type: "select",
                    options: [
                        { value: "reset", label: localize("Reset", "ALL") },
                        { value: "set", label: localize("SetToValue", "MD") },
                        { value: "increment", label: localize("IncreaseDecrease", "MD") }
                    ]
                },{
                    label: localize("Value", "DND5E"),
                    id: `inventoryMode.${type}.setCharges.value`,
                    type: "number",
                    step: "1",
                    default: "0",
                    visibility: { hideOn: [{ [`inventoryMode.${type}.setCharges.mode`]: "reset" } ]}
                }
            ]
        }
    ]
}