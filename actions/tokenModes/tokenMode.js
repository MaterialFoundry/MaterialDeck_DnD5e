import { Helpers } from "../../helpers.js";
import { getSpellTypes } from "./spellbookMode.js";

const localize = Helpers.localize;

function getDocs(path, action="token") {
    return Helpers.getDocumentationUrl(path, action);
}

export const tokenMode = {

    getActions: function(settings) {
        let actions = { update: [], keyDown: [], keyUp: [], hold: [] };

        const stats = settings.tokenMode.stats.mode;
        
        if (stats === "HP" || stats === "TempHP") {
            actions.update.push({
                run: this.onUpdateHP,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "AC") {
            actions.update.push({
                run: this.onUpdateAC,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Speed") {
            actions.update.push({
                run: this.onUpdateSpeed,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Init") {
            actions.update.push({
                run: this.onUpdateInitiative,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "HitDice") {
            actions.update.push({
                run: this.onUpdateHitDice,
                on: ['updateActor', 'createToken', 'deleteToken', 'closeHitDiceConfig', 'dnd5e.postRollHitDie', 'dnd5e.restCompleted'],
                source: 'stats'
            });
        }
        else if (stats === "Spellcasting") {
            actions.update.push({
                run: this.onUpdateSpellcasting,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Currency") {
            actions.update.push({
                run: this.onUpdateCurrency,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Encumbrance") {
            actions.update.push({
                run: this.onUpdateEncumbrance,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "XP") {
            actions.update.push({
                run: this.onUpdateXP,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Ability" || stats === "AbilityMod" || stats === "Save") {
            actions.update.push({
                run: this.onUpdateAbility,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Skill" || stats === "SkillPassive") {
            actions.update.push({
                run: this.onUpdateSkill,
                on: ['updateActor', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }
        else if (stats === "Prof") {
            actions.update.push({
                run: this.onUpdateProficiency,
                on: ['dnd5e.advancementManagerComplete', 'createToken', 'deleteToken'],
                source: 'stats'
            });
        }

        const onPress = settings.tokenMode.keyUp?.mode;
        const onHold = settings.tokenMode.hold?.mode;
        const holdTime = game.materialDeck.holdTime;

        if (onPress === 'condition') {
            actions.update.push({
                run: this.onUpdateConditions,
                on: ['createActiveEffect', 'deleteActiveEffect'],
                source: 'onPress'
            });
            actions.keyUp.push({
                run: this.onKeydownConditions,
                source: 'onPress',
                stopOnHold: true
            });
        }
        else if (onPress === 'roll') {
            actions.keyUp.push({
                run: this.onKeydownRoll,
                source: 'onPress',
                stopOnHold: true
            });
        }

        if (onHold === 'condition') {
            actions.hold.push({
                run: this.onKeydownConditions,
                delay: holdTime,
                source: 'onPress'
            });
        }
        else if (onHold === 'roll') {
            actions.hold.push({
                run: this.onKeydownRoll,
                delay: holdTime,
                source: 'onPress'
            });
        }

        return actions;
    },

    /****************************************************************
     * Stats
     ****************************************************************/
    onUpdateHP: function(data) {
        const settings = data.settings.tokenMode.stats;

        let text = "";
        let hp = {value: 0, temp: 0, max: 0};
      
        if (data.actor) {
            hp = data.actor.system.attributes.hp;
            if (settings.mode === "HP" && settings.hp.mode === 'nr') 
                text = hp.value + "/" + hp.max;
            else if (settings.mode === "TempHP")
                text = hp.temp !== null ? hp.temp : 0;
        }
        
        return {
            text, 
            icon: settings.mode === 'HP' && data.settings.display.icon === 'stats' ? Helpers.getImage("hp_empty.png") : "", 
            options: {
                uses: {
                    available: settings.mode !== "TempHP" ? hp.value : hp.temp,
                    maximum: settings.mode !== "TempHP" ? hp.max : undefined,
                    heart: (settings.mode === 'HP' && data.settings.display.icon === 'stats') ? "#FF0000" : undefined,
                    box: settings.hp.mode === 'box',
                    bar: settings.hp.mode === 'bar'
                }
            }
        };
    },

    onUpdateAC: function(data) {
        return {
            text: data.actor ? data.actor.system.attributes.ac.value : '', 
            icon: data.settings.display.icon == 'stats' ? 'icons/equipment/shield/heater-steel-worn.webp' : ''
        }
    },

    onUpdateSpeed: function(data) {
        let text = "";

        if (data.actor) {
            const movement = data.actor.system.attributes.movement;

            if (movement.burrow > 0) text += `${localize("MovementBurrow", "DND5E")}: ${movement.burrow + movement.units}`;
            if (movement.climb > 0) {
                if (text.length > 0) text += '\n';
                text += `${localize("MovementClimb", "DND5E")}: ${movement.climb + movement.units}`;
            }
            if (movement.fly > 0) {
                if (text.length > 0) text += '\n';
                text += `${localize("MovementFly", "DND5E")}: ${movement.fly + movement.units}`;
            }
            if (movement.hover > 0) {
                if (text.length > 0) text += '\n';
                text += `${localize("MovementHover", "DND5E")}: ${movement.hover + movement.units}`;
            }
            if (movement.swim > 0) {
                if (text.length > 0) text += '\n';
                text += `${localize("MovementSwim", "DND5E")}: ${movement.swim + movement.units}`;
            }
            if (movement.walk > 0) {
                if (text.length > 0) text += '\n';
                text += `${localize("MovementWalk", "DND5E")}: ${movement.walk + movement.units}`;
            }
        }
        
        return{
            text, 
            icon: data.settings.display.icon === 'stats' ? 'icons/equipment/feet/shoes-collared-leather-blue.webp' : ""
        };
    },

    onUpdateInitiative: function(data) {
        const init = data.actor?.system.attributes.init.total;
        return{
            text: data.actor ? (init >= 0 ? "+" : "") + init : '', 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage("d20.png") : '',
            options: { dim: data.settings.display.icon === 'stats' }
        };
    },

    onUpdateHitDice: function(data) {
        let text = "";

        const hitDice = data.actor?.system?.attributes?.hd;
        if (hitDice?.bySize) {
            for (let key of Object.keys(hitDice.bySize)) {
                if (text !== '') text += ', '
                text += `${hitDice.bySize[key]}${key}`
            }
        }
        
        return{
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage("d20.png") : '',
            options: { dim: data.settings.display.icon === 'stats' }
        };
    },

    onUpdateSpellcasting: function(data) {
        const settings = data.settings.tokenMode.stats.spellcasting;
        const system = data.actor?.system;
        let text = '';

        if (system) {
            if (settings.mode === 'ability') 
                text = game.system.config.abilities[system.attributes.spellcasting].label;
            else if (settings.mode === 'dc') 
                    text = system.attributes.spell.dc;
            else if (settings.mode === 'modifier')  {
                const mod = system.attributes.spell.mod;
                text = mod >= 0 ? `+${mod}` : mod
            }
            else if (settings.mode === 'spellSlots') {
                const slots = system.spells[settings.slots];
                text = `${slots.value}/${slots.max}`
            }
        }
        
        return {
            text,
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage("skills/arc.png") : '',
            options: { dim: data.settings.display.icon == 'stats' }
        } 
    },

    onUpdateCurrency: function(data) {
        const currencyType = data.settings.tokenMode.stats.currency;
        let text = '';
        const currency = data.actor?.system?.currency;
        if (currency) {
            if (currencyType === 'all') {
                for (let key of Object.keys(CONFIG.DND5E.currencies)) {
                    if (currency[key] !== 0) {
                        if (text !== '') text += ', ';
                        text += `${currency[key]}${CONFIG.DND5E.currencies[key].abbreviation}`
                    }
                }  
            } 
            else 
                text = `${currency[currencyType]}${CONFIG.DND5E.currencies[currencyType].abbreviation}`
        }
        
        return {
            text, 
            icon: data.settings.display.icon === 'stats' ? 'fas fa-coins' : ''
        }
    },

    onUpdateEncumbrance: function(data) {
        const encumbrance = data.actor.system.attributes.encumbrance;
        return {
            text: `${encumbrance.value}/${encumbrance.max}`, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage('weight.png') : '',
            options: { dim: data.settings.display.icon == 'stats' }
        }
    },

    onUpdateXP: function(data) {
        const settings = data.settings.tokenMode.stats;
        let text = '';
        const xp = data.actor?.system?.details?.xp;
        let available = 0;
        let maximum = 0;
        if (xp) {
            available = xp.value;
            maximum = xp.max;
            if (settings.hp.mode === 'nr') {
                text = maximum ? `${available}/${maximum}` : available;
            }
            if (!maximum) maximum = available;
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage('progression.png') : '',
            options: { 
                dim: data.settings.display.icon == 'stats',
                uses: {
                    available,
                    maximum,
                    box: settings.hp.mode === 'box',
                    bar: settings.hp.mode === 'bar'
                }
            }
        }
    },

    onUpdateAbility: function(data) {
        const statsMode = data.settings.tokenMode.stats.mode;
        const ability = data.settings.tokenMode.stats.ability;

        let text = "";
        
        if (data.actor) {
            if (statsMode == "Ability")
                text += data.actor.system.abilities?.[ability].value;
            else if (statsMode == "AbilityMod") {
                const mod = data.actor.system.abilities?.[ability].mod;
                text += (mod >= 0 ? "+" : "") + mod;
            }
            else if (statsMode == "Save") {
                const save = data.actor.system.abilities?.[ability].save.value;
                text += (save >= 0 ? "+" : "") + save;
            }  
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage(`abilities/${ability == 'con' ? 'cons' : ability}.png`) : '', 
            options: { dim: data.settings.display.icon == 'stats' }
        };
    },

    onUpdateSkill: function(data) {
        const statsMode = data.settings.tokenMode.stats.mode;
        const settings = data.settings.tokenMode.stats;
        let text = "";

        if (data.actor) {
            let skill;
            if (statsMode === "Skill") {
                skill = data.actor.system.skills?.[settings.skill].total;
                text += (skill >= 0 ? "+" : "") + skill;
            }
            else if (statsMode == "SkillPassive")
                text += data.actor.system.skills?.[settings.skill].passive;
        }
        
        return {
            text, 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage(`skills/${settings.skill}.png`) : '', 
            options: { dim: data.settings.display.icon == 'stats' }
        };
    },

    onUpdateProficiency: function(data) {
        const prof = data.actor?.system?.attributes?.prof;
        return {
            text: prof ? (prof >= 0 ? "+" : "") + prof : '', 
            icon: data.settings.display.icon == 'stats' ? Helpers.getImage("progression.png") : '', 
            options: { dim: data.settings.display.icon == 'stats' }
        };
    },

    /****************************************************************
     * On Press
     ****************************************************************/

    onUpdateConditions: function(data) {
        const settings = data.settings.tokenMode.keyUp.condition;
        if ((data.hook === 'createActiveEffect' || data.hook === 'deleteActiveEffect') && data.args[0].parent.id !== data.actor.id) return 'doNothing';

        const conditionActive = data.actor ? getConditionActive(data.actor, settings.condition) : false;
        const displayIcon = data.settings.display.icon === 'onPress';

        return {
            icon: displayIcon ? getConditionIcon(settings.condition) : '', 
            options: { 
                dim: displayIcon,
                border: true,
                borderColor: conditionActive ? data.settings.colors.on : data.settings.colors.system.off
            }
        };
    },

    onKeydownConditions: async function(data) {
        const settings = data.settings.tokenMode[data.actionType].condition;

        if (settings.condition === 'removeAll')
            for( let effect of data.actor.effects)
                effect.delete();
        else
            data.actor.toggleStatusEffect(settings.condition);
    },

    onKeydownRoll: function(data) {
        const settings = data.settings.tokenMode[data.actionType].roll;
        const rollMode = settings.type === 'default' ? Helpers.rollModifier.get(true) : settings.type;

        const rollData = {
            ability: settings.ability,
            skill: settings.skill,
            rolls: [ {
                options: {
                    advantage: (rollMode === 'advantage'),
                    disadvantage: (rollMode === 'disadvantage')
                }
            } ]
        };

        const dialogOptions = {
            configure: rollMode === 'dialog'
        };

        if (settings.mode === 'initiative') data.actor.rollInitiative({rerollInitiative: true});
        else if (settings.mode === 'ability') data.actor.rollAbilityCheck(rollData, dialogOptions);
        else if (settings.mode === 'save') data.actor.rollSavingThrow(rollData, dialogOptions);
        else if (settings.mode === 'skill') data.actor.rollSkill(rollData, dialogOptions);
    },

    /****************************************************************
     * Get settings
     ****************************************************************/

    getSettings: function() {
        return [
            ...getTokenStats('pageWide.stats'),
            ...getTokenOnPress('keyUp', 'pageWide.keyUp'),
            ...getTokenOnPress('hold', 'pageWide.hold'),
        ]
    }
}

export function getTokenStats(sync) {
    return [
        {
            id: "tokenMode.stats.mode",
            appendOptions: [
                { value: 'HP', label: localize('HP', 'DND5E') },
                { value: 'TempHP', label: localize('HitPointsTempShort', 'DND5E') },
                { value: 'AC', label: localize('AC', 'DND5E') },
                { value: 'Speed', label: localize('Speed', 'DND5E') },
                { value: 'Init', label: localize('Initiative', 'DND5E') },
                { value: 'HitDice', label: localize('HitDice', 'DND5E') },
                { value: 'Spellcasting', label: localize('Spellcasting', 'DND5E') },
                { value: 'Currency', label: localize('Currency', 'DND5E') },
                { value: 'Encumbrance', label: localize('Encumbrance', 'DND5E') },
                { value: 'Ability', label: localize('AbilityScore', 'DND5E') },
                { value: 'AbilityMod', label: localize('AbilityModifier', 'DND5E') },
                { value: 'Save', label: localize('SaveBonus', 'DND5E') },
                { value: 'Skill', label: localize('SkillBonus') },
                { value: 'SkillPassive', label: `${localize('SkillPassive')}` },
                { value: 'Prof', label: localize('ProficiencyBonus', 'DND5E') },
                { value: 'XP', label: localize('ExperiencePoints.Abbreviation', 'DND5E') }
            ]
        },{
            id: "5e-tokenMode-stats-wrapper",
            type: "wrapper",
            after: "tokenMode.stats.mode",
            indent: 1,
            settings: [
                {
                    label: localize('Mode', 'MD'),
                    id: "tokenMode.stats.hp.mode",
                    type: "select",
                    default: "nr",
                    sync,
                    options: [
                        {value:'nr', label: localize('Number', 'DND5E') },
                        {value:'box', label: `${localize('Box', 'MD')}` },
                        {value:'bar', label: `${localize('Bar', 'MD')}` }
                    ],
                    visibility: { showOn: [ 
                        { ["tokenMode.stats.mode"]: "HP" },
                        { ["tokenMode.stats.mode"]: "XP" }
                    ] }
                },{
                    id: "5e-tokenMode-stats-spellCasting-wrapper",
                    type: "wrapper",
                    after: "stats",
                    visibility: { showOn: [ { ["tokenMode.stats.mode"]: "Spellcasting" } ] },
                    settings: [
                        {
                            label: localize('Mode', 'MD'),
                            id: "tokenMode.stats.spellcasting.mode",
                            type: "select",
                            sync,
                            default: "ability",
                            options: [
                                { value: 'ability', label: localize('Ability', 'DND5E') },
                                { value: 'dc', label: localize('AbbreviationDC', 'DND5E') },
                                { value: 'modifier', label: localize('Modifier', 'DND5E') },
                                { value: 'spellSlots', label: localize('CONSUMPTION.Type.SpellSlots.Label', 'DND5E')}
                            ]
                        },{
                            label: localize('Level', 'DND5E'),
                            id: "tokenMode.stats.spellcasting.slots",
                            type: "select",
                            sync,
                            default: "spell1",
                            indent: 1,
                            visibility: { showOn: [ { ["tokenMode.stats.spellcasting.mode"]: "spellSlots" } ] },
                            options: getSpellTypes()
                        }
                    ]
                },{
                    label: localize('Type', 'ALL'),
                    id: "tokenMode.stats.currency",
                    type: "select",
                    sync,
                    default: "all",
                    visibility: { showOn: [ { ["tokenMode.stats.mode"]: "Currency" } ] },
                    options: getCurrencyTypes()
                },{
                    label: localize('Ability', 'DND5E'),
                    id: "tokenMode.stats.ability",
                    type: "select",
                    sync,
                    default: "str",
                    visibility: {
                        showOn: [
                            { ["tokenMode.stats.mode"]: "Ability" },
                            { ["tokenMode.stats.mode"]: "AbilityMod" },
                            { ["tokenMode.stats.mode"]: "Save" }
                        ]
                    },
                    options: getAbilityList()
                },{
                    label: localize('Skill', 'DND5E'),
                    id: "tokenMode.stats.skill",
                    type: "select",
                    sync,
                    visibility: { showOn: [ { ["tokenMode.stats.mode"]: "Skill" }, { ["tokenMode.stats.mode"]: "SkillPassive" } ] },
                    options: getSkillList()
                }
            ]
        }
    ]
}

function getTokenOnPress(mode='keyUp', sync) {
    return [
        {
            id: `tokenMode.${mode}.mode`,
            appendOptions: [
                { value: 'condition', label: localize('ToggleCondition') },
                { value: 'roll', label: localize('DiceRoll') }
            ]
        },{
            id: `5e-${mode}-wrapper`,
            type: "wrapper",
            after: `tokenMode.${mode}.mode`,
            indent: 1,
            settings: [
                {
                    label: localize('Rule.Type.Condition', 'DND5E'),
                    id: `tokenMode.${mode}.condition.condition`,
                    type: "select",
                    sync,
                    indent: 1,
                    link: getDocs('#token-mode'),
                    visibility: { showOn: [ { [`tokenMode.${mode}.mode`]: "condition" } ] },
                    options: [
                        { value: "removeAll", label: localize("RemoveAll") },
                        { label: localize("Conditions", "DND5E"), children: getConditionList() }
                    ]
                },{
                    id: `5e-${mode}-roll-wrapper`,
                    type: "wrapper",
                    visibility: { showOn: [ {[`tokenMode.${mode}.mode`]: "roll"} ] },
                    settings: [
                        {
                            label: "Roll",
                            id: `tokenMode.${mode}.roll.mode`,
                            type: "select",
                            sync,
                            link: getDocs('#dice-roll'),
                            options: [
                                {value:'initiative', label: localize('Initiative', 'DND5E')},
                                {value:'ability', label: localize('ActionAbil', 'DND5E')},
                                {value:'save', label: localize('SavingThrow', 'DND5E')},
                                {value:'skill', label: localize('SkillCheck')}
                            ]
                        },{
                            label: localize('Ability', 'DND5E'),
                            id: `tokenMode.${mode}.roll.ability`,
                            type: "select",
                            sync,
                            indent: true,
                            visibility: { showOn: [ { [`tokenMode.${mode}.roll.mode`]: "ability" }, { [`tokenMode.${mode}.roll.mode`]: "save" } ] },
                            options: getAbilityList()
                        },{
                            label: localize('Skill', 'DND5E'),
                            id: `tokenMode.${mode}.roll.skill`,
                            type: "select",
                            sync,
                            indent: true,
                            visibility: { showOn: [ { [`tokenMode.${mode}.roll.mode`]: "skill" } ] },
                            options: getSkillList()
                        },{
                            label: localize('RollModifier'),
                            id: `tokenMode.${mode}.roll.type`,
                            type: "select",
                            sync,
                            visibility: { hideOn: [ { [`tokenMode.${mode}.roll.mode`]: "initiative" } ] },
                            options: [
                                {value:'default', label: localize('Default', 'DND5E')},
                                ...Helpers.getRollModifiers()
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}

function getConditionIcon(condition) {
    if (condition == 'removeAll') 
        return window.CONFIG.controlIcons.effects;
    return CONFIG.statusEffects.find(e => e.id === condition).img;
}

function getConditionActive(actor, condition) {
    if (condition === 'removeAll') 
        return actor.statuses.size > 0;
    else
        return actor.statuses.has(condition);
}

function getCurrencyTypes() {
    let currencies = [{ value: 'all', label: localize('All', 'MD')}]
    for (let key of Object.keys(CONFIG.DND5E.currencies)) {
        currencies.push({
            value: key,
            label: CONFIG.DND5E.currencies[key].label
        })
    }
    return currencies;
}

function getAbilityList() {
    const keys = Object.keys(game.system.config.abilities);
    let abilities = [];
    for (let k of keys) abilities.push({
        value: game.system.config.abilities?.[k].abbreviation, 
        label: game.system.config.abilities?.[k].label
    })
    return abilities;
}

function getSkillList() {
    const keys = Object.keys(game.system.config.skills);
        let skills = [];
        for (let s of keys) {
            const skill = game.system.config.skills?.[s];
            skills.push({
                value: s, 
                label: skill.label
            })
        }
        return skills;
}

function getConditionList() {
    let conditions = [];
    for (let c of CONFIG.statusEffects) 
        conditions.push({
            value: c.id, 
            label: c.name
        });
    return conditions;
}