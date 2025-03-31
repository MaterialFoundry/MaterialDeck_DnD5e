import { Helpers } from "../../helpers.js";

const localize = Helpers.localize;

function getDocs(path, action="token") {
    return Helpers.getDocumentationUrl(path, action);
}

let spellbookOffset = 0;

export const spellbookMode = {

    updateAll: function() {
        for (let device of game.materialDeck.streamDeck.deviceManager.devices) {
            for (let button of device.buttons.buttons) {
                if (game.materialDeck.Helpers.getButtonAction(button) !== 'token') continue;
                if (game.materialDeck.Helpers.getButtonSettings(button).mode !== 'spellbook') continue;
                button.update('md-dnd5e.updateAllTokenSpellbook')
            }
        }
    },

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };
        const holdTime = game.materialDeck.holdTime;

        const spellbookSettings = settings.spellbookMode;

        if (spellbookSettings.mode === 'offset') {
            actions.update.push({
                run: this.onOffsetUpdate
            });
            actions.keyDown.push({
                run: this.onOffsetKeydown
            })
        }

        else if (spellbookSettings.mode === 'setSyncFilter') {
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
                run: this.onSpellbookUpdate,
                on: ['updateItem', 'refreshToken']
            });

            const onPress = spellbookSettings.keyUp.mode;
            const onHold = spellbookSettings.hold.mode;

            if (onPress === 'castSpell') {
                actions.keyUp.push({
                    run: this.onCastSpellKeyDown,
                    stopOnHold: true
                });
            }
            if (onHold === 'castSpell') {
                actions.hold.push({
                    run: this.onCastSpellKeyDown,
                    delay: holdTime
                });
            }

            if (onPress === 'prepare') {
                actions.keyUp.push({
                    run: this.onPrepareSpellKeyDown,
                    stopOnHold: true
                });
            }
            if (onHold === 'prepare') {
                actions.hold.push({
                    run: this.onPrepareSpellKeyDown,
                    delay: holdTime
                });
            }
        }

        return actions;
    },

    onOffsetUpdate: function(data) {
        const settings = data.settings.spellbookMode.offset;
        let icon = '';
        if (data.settings.display.spellbookMode.offsetIcon) {
            if (settings.mode === 'set' || settings.value == 0) icon = 'fas fa-arrow-right-to-bracket';
            else if (settings.value > 0) icon = 'fas fa-arrow-right';
            else if (settings.value < 0) icon = 'fas fa-arrow-left';
        }
        
        return {
            icon,
            text: data.settings.display.spellbookMode.offset ? spellbookOffset : '',
            options: {
                border: true,
                borderColor: (settings.mode === 'set' && spellbookOffset == parseInt(settings.value)) ? data.settings.colors.system.on : data.settings.colors.system.off
            }
        }
    },

    onOffsetKeydown: function(data) {
        const settings = data.settings.spellbookMode.offset;
        if (settings.mode === 'set') spellbookOffset = parseInt(settings.value);
        else if (settings.mode === 'increment') spellbookOffset += parseInt(settings.value);

        spellbookMode.updateAll();
    },

    onSetSyncFilterUpdate: function(data) {
        const mode = data.settings.spellbookMode.setSync.mode;
        const displaySettings = data.settings.display.spellbookMode.setSync;
        const filter = data.settings.spellbookMode.setSync.selection.filter.preparation;

        let icon = '';
        if (displaySettings.icon) {
            let iconSrc = 'fas fa-hat-wizard';

            if (displaySettings.filter) {
                icon = [{icon: iconSrc, size: 0.7, spacing: {x:0, y:45}}]
                
                if (filter.prepared) icon.push({icon: 'fas fa-sun', size: 0.3, spacing: {x:-35, y:10}})
                if (filter.always) icon.push({icon: 'fas fa-certificate', size: 0.3, spacing: {x:0, y:10}})
                if (filter.innate) icon.push({icon: 'fas fa-hands-asl-interpreting', size: 0.3, spacing: {x:35, y:10}})
                if (filter.atwill) icon.push({icon: 'fas fa-clock', size: 0.3, spacing: {x:-35, y:-25}})
                if (filter.ritual) icon.push({icon: 'fas fa-spider-web', size: 0.3, spacing: {x:0, y:-25}})
                if (filter.pact) icon.push({icon: 'fas fa-hands-holding-diamond', size: 0.3, spacing: {x:35, y:-25}})
            }
            else {
                icon = iconSrc
            }
        }
        else if (displaySettings.filter) {
            icon = [];
            if (filter.prepared) icon.push({icon: 'fas fa-sun', size: 0.4, spacing: {x:-45, y:50}})
            if (filter.always) icon.push({icon: 'fas fa-certificate', size: 0.4, spacing: {x:0, y:50}})
            if (filter.innate) icon.push({icon: 'fas fa-hands-asl-interpreting', size: 0.4, spacing: {x:45, y:50}})
            if (filter.atwill) icon.push({icon: 'fas fa-clock', size: 0.4, spacing: {x:-45, y:5}})
            if (filter.ritual) icon.push({icon: 'fas fa-spider-web', size: 0.4, spacing: {x:0, y:5}})
            if (filter.pact) icon.push({icon: 'fas fa-hands-holding-diamond', size: 0.4, spacing: {x:45, y:5}})
        }
        
        let text = displaySettings.name ? getSpellTypes(true).find(t => t.value === mode)?.label : '';
        const thisSelected = game.materialDeck.Helpers.isSynced(data.settings.spellbookMode.setSync, 'spellbookMode.syncFilter', 'spellbookMode.',  'token');

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
        const settings = data.settings.spellbookMode.setSync;

        let syncedSettings = [
            { key: 'spellbookMode.mode', value: settings.mode },
            { key: 'spellbookMode.selection.filter.preparation.prepared', value: settings.selection.filter.preparation.prepared },
            { key: 'spellbookMode.selection.filter.preparation.always', value: settings.selection.filter.preparation.always },
            { key: 'spellbookMode.selection.filter.preparation.innate', value: settings.selection.filter.preparation.innate },
            { key: 'spellbookMode.selection.filter.preparation.atwill', value: settings.selection.filter.preparation.atwill },
            { key: 'spellbookMode.selection.filter.preparation.ritual', value: settings.selection.filter.preparation.ritual },
            { key: 'spellbookMode.selection.filter.preparation.pact', value: settings.selection.filter.preparation.pact },
        ]

        data.button.sendData({
            type: 'setPageSync',
            payload: {
                context: data.button.context,
                device: data.button.device.id,
                action: 'token',
                sync: 'spellbookMode.syncFilter',
                settings: syncedSettings
            }
        })
    },

    onSpellbookUpdate: function(data) {
        const settings = data.settings.spellbookMode;
        const spell = getSpellbook(data.actor, settings);
       
        if (data.hooks === 'updateItem' && data.args[0].id !== spell.id) return 'doNothing';
        if (data.hooks === 'refreshToken' && data.args[0].id !== token.id) return 'doNothing';

        if (!spell) return;

        const slots = data.actor.system.spells[`spell${spell.system.level}`];

        const displaySettings = data.settings.display.spellbookMode;
        let text = displaySettings.name ? spell.name : '';
        let toHit = '';
        let damage = '';
        let range = '';
        const attackActivity = spell.system.activities?.find(a => a.type === 'attack');

        if (attackActivity) {
            toHit = attackActivity.labels.toHit;
            range = attackActivity.labels.range;

            for (let components of attackActivity.damage.parts) {
                if (damage !== '') damage += ', ';
                damage += components.formula;
            }
        }
        else {
            const saveActivity = spell.system.activities?.find(a => a.type === 'save');
            if (saveActivity) {
                toHit = saveActivity.labels.save;
                range = saveActivity.labels.range;
            }
        }

        if (text !== '') text += '\n';
        if (displaySettings.toHit) text += toHit;
        if (displaySettings.damage) {
            if (displaySettings.toHit && damage !== '') text += ` `;
            text += damage;
        }
        if (displaySettings.range) {
            if (displaySettings.toHit || displaySettings.damage) text += ' ';
            text += range;
        }
        
        return {
            text, 
            icon: displaySettings.icon ? spell.img : '', 
            options: displaySettings.slots ? { uses: { available: slots?.value, maximum: slots?.max, box: slots?.max }} : undefined
        };
    },

    onCastSpellKeyDown: function(data) {
        if (!data.actor) return;
        const settings = data.settings.spellbookMode;
        const onPressSettings = settings[data.actionType];
        const spell = getSpellbook(data.actor, settings);
        if (!spell) return;
        castSpell(spell, onPressSettings);
    },

    onPrepareSpellKeyDown: function(data) {
        if (!data.actor) return;
        const settings = data.settings.spellbookMode;
        const mode = settings[data.actionType].prepare.mode;
        const spell = getSpellbook(data.actor, settings);
        if (!spell) return;
        
        if (mode === 'toggle') spell.update({"system.preparation.prepared": !spell.system.preparation.prepared});
        else if (mode === 'prepare') spell.update({"system.preparation.prepared": true});
        else if (mode === 'unprepare') spell.update({"system.preparation.prepared": false});
    },

    getSelectionSettings(type='', sync='spellbookMode.syncFilter') {
        let modeOptions = [];
        if (type === '') 
            modeOptions = [ 
                { label: localize("Level", "DND5E"), children: getSpellTypes(true) },
                { value: 'setSyncFilter', label: localize('SetTypeAndFilterSync') },
                { value: 'offset', label: localize('Offset', 'MD') }
            ]
        else modeOptions = getSpellTypes(true)

        return [{
            label: localize('SpellType'),
            id: `spellbookMode${type}.mode`,
            type: "select",
            default: "any",
            link: getDocs('#spellbook-mode'),
            sync,
            options: modeOptions
        },{
            label: localize("PreparationModeFilter"),
            id: `spellbookMode${type}-PreparationModeFilter-table`,
            type: "table",
            visibility: { 
                hideOn: [ 
                    { [`spellbookMode.mode`]: "offset" },
                    { [`spellbookMode.mode`]: type === "" ? "setSyncFilter" : "" } 
                ] 
            },
            columns: 
            [
                { label: localize('SpellPrepPrepared', 'DND5E') },
                { label: localize('SpellPrepAlways', 'DND5E') },
                { label: localize('Innate') },
                
            ],
            rows: 
            [
                [
                    { 
                        id: `spellbookMode${type}.selection.filter.preparation.prepared`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `spellbookMode${type}.selection.filter.preparation.always`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `spellbookMode${type}.selection.filter.preparation.innate`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ],[
                    { 
                        label: localize('ENCHANTMENT.Period.AtWill', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('Item.Property.Ritual', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    },{ 
                        label: localize('PactMagic', 'DND5E'),
                        type: 'label',
                        font: 'bold'
                    }
                ],[
                    { 
                        id: `spellbookMode${type}.selection.filter.preparation.atwill`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `spellbookMode${type}.selection.filter.preparation.ritual`,
                        type: "checkbox",
                        sync,
                        default: true
                    },{ 
                        id: `spellbookMode${type}.selection.filter.preparation.pact`,
                        type: "checkbox",
                        sync,
                        default: true
                    }
                ]
            ]
        }]
    },

    getSettings() {
        return [
            ...spellbookMode.getSelectionSettings(),
            {
                id: `spellbookMode-spell-wrapper`,
                type: "wrapper",
                visibility: { 
                    hideOn: [ 
                        { [`spellbookMode.mode`]: "offset" },
                        { [`spellbookMode.mode`]: "setSyncFilter" } 
                    ] 
                },
                settings: [
                    {
                        label: localize('SyncTypeAndFilter'),
                        id: 'spellbookMode.syncFilter',
                        type: 'checkbox',
                        link: getDocs('#synced-settings'),
                        indent: true
                    },{
                        label: localize('SelectionMode'),
                        id: "spellbookMode.selection.mode",
                        type: "select",
                        default: "nr",
                        options: [
                            {value:'nr', label: localize('SelectByNr', 'MD')},
                            {value:'nameId', label: localize('SelectByName/Id', 'MD')}
                        ]
                    },{
                        label: localize("FACILITY.FIELDS.order.label", "DND5E"),
                        id: "spellbookMode.selection.order",
                        type: "select",
                        indent: true,
                        options: [
                            {value:'charSheet', label: localize('CharacterSheet')},
                            {value:'name', label: localize('Alphabetically')}
                        ],
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Nr", "MD"),
                        id: "spellbookMode.selection.nr",
                        type: "number",
                        default: "1",
                        indent: true,
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nr" } ] }
                    },{
                        label: localize("Name/Id", "MD"),
                        id: "spellbookMode.selection.nameId",
                        type: "textbox",
                        indent: true,
                        visibility: { showOn: [ { ["spellbookMode.selection.mode"]: "nameId" } ] }
                    },{
                        type: "line-right"
                    },{
                        id: `spellbookMode-item-wrapper`,
                        type: "wrapper",
                        visibility: { hideOn: [ { [`spellbookMode.mode`]: "offset" } ] },
                        settings: [
                            ...getSpellOnPressSettings(),
                            {
                                type: "line-right"
                            },
                            ...getSpellOnPressSettings('hold'),
                            {
                                type: "line-right"
                            },{
                                label: localize("Display", "MD"),
                                id: "spellbookMode-display-table",
                                type: "table",
                                columns: 
                                [
                                    { label: localize("ACTIVITY.FIELDS.img.label", "DND5E") },
                                    { label: localize("ACTIVITY.FIELDS.name.label", "DND5E") },
                                    { label: localize("CONSUMPTION.Type.SpellSlots.Label", "DND5E") }
                                ],
                                rows: 
                                [
                                    [
                                        {
                                            id: "display.spellbookMode.icon",
                                            type: "checkbox",
                                            default: true
                                        },{
                                            id: "display.spellbookMode.name",
                                            type: "checkbox",
                                            default: true
                                        },{
                                            id: "display.spellbookMode.slots",
                                            type: "checkbox",
                                            default: true
                                        }
                                    ],[
                                        { 
                                            type: "label", 
                                            label: localize("ToHit", "DND5E") + `&nbsp;&nbsp;`, 
                                            font: "bold" 
                                        },{ 
                                            type: "label", 
                                            label: localize("Damage", "DND5E"), 
                                            font: "bold"
                                        },
                                        { 
                                            type: "label", 
                                            label: localize("Range", "DND5E")  ,
                                            font: "bold"
                                        }
                                    ],[
                                        {
                                            id: "display.spellbookMode.toHit",
                                            type: "checkbox",
                                            default: false
                                        },{
                                            id: "display.spellbookMode.damage",
                                            type: "checkbox",
                                            default: false
                                        },{
                                            id: "display.spellbookMode.range",
                                            type: "checkbox",
                                            default: false
                                        }
                                    ]
                                ]
                            }
                        ]
                    }
                ]
            },{
                id: `spellbookMode-offset-wrapper`,
                type: "wrapper",
                visibility: { showOn: [ { [`spellbookMode.mode`]: "offset" } ] },
                settings: [
                    {
                        label: localize("Offset", "MD"),
                        id: "spellbookMode.offset.mode",
                        type: "select",
                        link: getDocs('#offset'),
                        options: [
                            { value: "set", label: localize("SetToValue", "MD") },
                            { value: "increment", label: localize("IncreaseDecrease", "MD") }
                        ]
                    },{
                        label: localize("Value", "DND5E"),
                        id: "spellbookMode.offset.value",
                        type: "number",
                        step: "1",
                        default: "0",
                        indent: true
                    },{
                        type: "line-right"
                    },{
                        label: localize("Display", "MD"),
                        id: "spellbookMode-offset-display-table",
                        type: "table",
                        columns: 
                        [
                            { label: localize("ACTIVITY.FIELDS.img.label", "DND5E") },
                            { label: localize("Offset", "MD") }
                        ],
                        rows: 
                        [
                            [
                                {
                                    id: "display.spellbookMode.offsetIcon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.offset",
                                    type: "checkbox",
                                    default: true
                                }
                            ]
                        ]
                    }
                ]
            },{
                id: `spellbookMode-setSync-wrapper`,
                type: "wrapper",
                indent: "true",
                visibility: { showOn: [ { [`spellbookMode.mode`]: "setSyncFilter" } ] },
                settings: [
                    ...spellbookMode.getSelectionSettings('.setSync', undefined),
                    {
                        label: localize("Display", "MD"),
                        id: "spellbookMode-setSync-display-table",
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
                                    id: "display.spellbookMode.setSync.icon",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.setSync.filter",
                                    type: "checkbox",
                                    default: true
                                },{
                                    id: "display.spellbookMode.setSync.name",
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

export function getSpellTypes(includeCantrips=false) {
    let spellTypes = [];
    if (includeCantrips) spellTypes = [{ value: 'any', label: localize('Any', 'MD')}, { value:'spell0', label: localize('SpellCantrip', 'DND5E') }]

    for (let i=1; i<10; i++)
        spellTypes.push({ value: `spell${i}`, label: localize(`SpellLevel${i}`, 'DND5E')})

    return spellTypes;
}

function getSpellbook(actor, settings) {
    if (!actor) return;
    let spells = Array.from(actor.items).filter(i=>i.type === 'spell');
    const filter = settings.selection.filter;

    if (settings.mode !== 'any') spells = spells.filter(s => s.system.level == settings.mode.replace('spell', ''))
    for (let k of Object.keys(CONFIG.DND5E.spellPreparationModes) ) {   
        if (!filter.preparation[k]) spells = spells.filter(s => s.system.preparation.mode != k)
    }

    if (settings.selection.order === 'charSheet') {
        let spellbook = {};

        spells = spells.sort((a, b) => a.sort - b.sort);

        const sections = Object.entries(CONFIG.DND5E.spellPreparationModes).reduce((acc, [k, {order}]) => {
            if ( Number.isNumeric(order) ) acc[k] = Number(order);
            return acc;
        }, {});

        for (let spell of spells) {
            const mode = spell.system.preparation.mode || "prepared";
            const level = spell.system.level;
        
            if (mode in sections) {
                if (!spellbook[mode])
                    spellbook[mode] = {type: mode, order: sections[mode], spells: []}
                spellbook[mode].spells.push(spell);
            }
            else {
                if (!spellbook[level])
                    spellbook[level] = {type: level, order: level, spells: []}
                spellbook[level].spells.push(spell);
            }
        }

        spellbook = Object.values(spellbook).sort((a, b) => a.order - b.order);

        spells = [];
        for (let spellMode of spellbook) {
            spells.push(...spellMode.spells)
        }
    }
    else {
        spells = game.materialDeck.Helpers.sort(spells, settings.selection.order);
    }

    let spell;
    if (settings.selection.mode === 'nr') {
        let spellNr = parseInt(settings.selection.nr) - 1 + spellbookOffset;
        spell = spells[spellNr];
    }
    else if (settings.selection.mode === 'nameId') {
        spell = spells.find(i => i.id === settings.selection.nameId.split('.').pop());
        if (!spell) spell = spells.find(i => i.name === settings.selection.nameId);
        if (!spell) spell = spells.find(i => game.materialDeck.Helpers.stringIncludes(i.name,settings.selection.nameId));
    }

    return spell;
}

function castSpell(spell, settings) {
    const rollModifier = settings.rollModifier === 'default' ? Helpers.rollModifier.get(true) : settings.rollModifier;
    const rollType = settings.rollType === 'default' ? Helpers.rollType.get(true) : settings.rollType;

    //Get the cast level
    let castLevel = settings.castAt;
    if (castLevel === 'spellLevel') castLevel = undefined;
    else if (castLevel === 'maxLevel') {
        const spellSlots = data.actor.system.spells;
        for (let i=9; i>1; i--) {
            if (spellSlots[`spell${i}`].max !== 0) {
                castLevel = `spell${i}`;
                break;
            }
        }
    }
    else if (castLevel === 'maxAvailable') {
        const spellSlots = data.actor.system.spells;
        for (let i=9; i>1; i--) {
            if (spellSlots[`spell${i}`].value !== 0) {
                castLevel = `spell${i}`;
                break;
            }
        }
    }

    Helpers.useItem(spell, 
        {
            rollModifier, 
            rollType,
            castLevel,
            consumeSlot: settings.consumeSlot,
            placeTemplate: settings.placeTemplate,
            concentration: settings.concentration, 
            showDialog: settings.showDialog
        }
    )
}

function getSpellOnPressSettings(type='keyUp') {
    return [
        {
            label: localize(type=='keyUp' ? 'OnPress' : 'OnHold', 'MD'),
            id: `spellbookMode.${type}.mode`,
            type: "select",
            options: [
                { value: 'doNothing', label: localize('DoNothing', 'MD') },
                { value: 'castSpell', label: localize('AbilityUseCast', 'DND5E') },
                { value: 'prepare', label: localize('PrepareSpell') }
            ]
        },{
            id: `spellbookMode-${type}-castSpell-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [ { [`spellbookMode.${type}.mode`]: "castSpell" } ] },
            settings:
            [
                {
                    label: localize('ShowDialog'),
                    id: `spellbookMode.${type}.showDialog`,
                    type: 'checkbox',
                    default: true
                },{
                    label: localize('RollModifier'),
                    id: `spellbookMode.${type}.rollModifier`,
                    type: "select",
                    default: "default",
                    options: [
                        { value: 'default', label: localize('Default', 'DND5E') },
                        ...Helpers.getRollModifiers()
                    ]
                },{
                    label: localize('RollType'),
                    id: `spellbookMode.${type}.rollType`,
                    type: "select",
                    default: "default",
                    options: Helpers.getRollTypes()
                },{
                    label: localize('CastAt'),
                    id: `spellbookMode.${type}.castAt`,
                    type: "select",
                    options: [
                        { value:'spellLevel', label: localize("SpellsLevel") },
                        { value:'maxAvailable', label: localize("MaxAvailable") },
                        { value:'maxLevel', label: localize("MaxAllowed") },
                        { label: localize('Level', 'DND5E'), children: getSpellTypes() }
                    ]
                },{
                    label: localize('RollConfiguration.Configuration', 'DND5E'),
                    id: `spellData-${type}-table`,
                    type: "table",
                    columnVisibility: [],
                    columns: 
                    [
                        { label: localize('PlaceTemplate') },
                        { label: localize('Concentration', 'DND5E') },
                        { label: localize('CONSUMPTION.FIELDS.consumption.spellSlot.label', 'DND5E') }
                    ],
                    rows: 
                    [
                        [
                            {
                                id: `spellbookMode.${type}.placeTemplate`,
                                type: "checkbox",
                                default: true
                            },{
                                id: `spellbookMode.${type}.concentration`,
                                type: "checkbox",
                                default: true
                            },{
                                id: `spellbookMode.${type}.consumeSlot`,
                                type: "checkbox",
                                default: true
                            }
                        ]
                    ]
                }
            ]
        },{
            label: localize("Mode", "MD"),
            id: `spellbookMode.${type}.prepare.mode`,
            type: "select",
            indent: true,
            visibility: { showOn: [ { [`spellbookMode.${type}.mode`]: "prepare" } ] },
            options: [
                { value: 'toggle', label: localize('Toggle', 'MD') },
                { value: 'prepare', label: localize('ContextMenuActionPrepare', 'DND5E') },
                { value: 'unprepare', label: localize('ContextMenuActionUnprepare', 'DND5E') }
            ]
        },{
            id: `spellbookMode-${type}-setSlots-wrapper`,
            type: "wrapper",
            indent: true,
            visibility: { showOn: [{ [`spellbookMode.${type}.mode`]: "setSlots" } ]},
            settings:
            [
                {
                    label: localize("Mode", "MD"),
                    id: `spellbookMode.${type}.setSlots.mode`,
                    type: "select",
                    options: [
                        { value: "set", label: localize("SetToValue", "MD") },
                        { value: "increment", label: localize("IncreaseDecrease", "MD") }
                    ]
                },{
                    label: localize("Value", "MD"),
                    id: `spellbookMode.${type}.setSlots.value`,
                    type: "number",
                    step: "1",
                    default: "0"
                }
            ]
        }
    ]
}