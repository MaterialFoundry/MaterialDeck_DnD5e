import { documentation } from "./materialdeck-dnd5e.js"

export class Helpers {

    static getDocumentationUrl(path, action) {
        let url = `${documentation}/actions/${action}/${path}`;
        return url;
    }
    
    static localize(str, category='', formatData) {
        if (category === '') return game.i18n.format(`MATERIALDECK_DND5E.${str}`, formatData);
        else if (category === 'ALL') return game.i18n.format(str, formatData);
        else if (category === 'MD') return game.i18n.format(`MATERIALDECK.${str}`, formatData);
        else if (category === 'DND5E') return game.i18n.format(`DND5E.${str}`, formatData);
        return game.i18n.format(`MATERIALDECK_DND5E.${category}.${str}`, formatData);
    }

    static getImage(name, path=`modules/materialdeck-dnd5e/img/`) {
        return path + name;
    }

    static isInString(strTarget, strTest, ignoreCase=true) {
        if (strTest === '') return false;
        if (ignoreCase) return strTarget.toUpperCase().includes(strTest.toUpperCase());
        else return strTarget.includes(strTest);
    }

    static getItemActivityActivationType(item) {
        if (!item.system.activities) return;
        const activity = Array.from(item.system.activities)[0];
        const activationType = activity?.activation?.type
        if (activationType === '') return;
        return activationType;
    }

    static async useItem(item, options) {
        const attackMode = options.attackMode || 'default';
        const rollModifier = options.rollModifier;
        const rollType = options.rollType;
        const showDialog = options.showDialog;
        
        if (!item) return;
        const activities = item.system.activities;
        if (!activities || rollModifier === 'dialog' || rollType === 'default') {
            return item.use({legacy:false});
        }

        let activity;
        if (rollType === 'attack' || rollType === 'damage' || rollType === 'critical') {
            activity = activities.find(a => a.type === 'attack');
            if (!activity && item.type === 'spell')
                activity = activities.find(a => a.type === 'save' || a.type === 'heal');
        }
        else if (rollType === 'use')
            activity = activities.find(a => a.type === 'use' || a.type === 'utility' || a.type === 'heal');

        if (!activity) return item.use({legacy:false});

        //In the next dnd5e release advantage and disadvantage can be placed in the top level of rollData
        const rollData = {
            attackMode: (attackMode === 'default' ? undefined : attackMode),
            hasConsumption: options.consumeSlot && activity.consumption.spellSlot,
            consume: {
                spellSlot: options.consumeSlot && activity.consumption.spellSlot
            },
            create: {
                measuredTemplate: activity.target.template.type && activity.target.template.type !== '' ? options.placeTemplate : undefined
            },
            spell: {
                slot: options.castLevel
            },
            concentration: {
                begin: options.concentration && activity.duration.concentration
            },
            rolls: [ {
                options: {
                    advantage: (rollModifier === 'advantage'),
                    disadvantage: (rollModifier === 'disadvantage'),
                    attackMode: (attackMode === 'default' ? undefined : attackMode),
                    }
                } ]
        };

        const damageData = { 
            attackMode: (attackMode === 'default' ? undefined : attackMode),
            isCritical: rollType === 'critical'
        }

        const dialogOptions = { configure: showDialog };

        if (rollType === 'attack' && activity.type !== 'save' && activity.type !== 'heal') {
            if (rollData.hasConsumption) await activity.consume(rollData, dialogOptions);
            return activity.rollAttack(rollData, dialogOptions);
        }
        else if ((rollType === 'damage' || rollType === 'critical')) 
            return activity.rollDamage(damageData, dialogOptions);
        else if (rollType === 'save' && activity.type === 'save') 
            return activity.rollAttack(rollData, dialogOptions);
        
        return activity.use(rollData, dialogOptions);
    }

    /**
     * Roll Modifiers
     */
    static rollModifier;

    static getRollModifiers() {
        return [
            { value: 'normal', label: localize('Normal', 'DND5E') },
            { value: 'advantage', label: localize('Advantage', 'DND5E') },
            { value: 'disadvantage', label: localize('Disadvantage', 'DND5E') }
        ]
    }

    static getRollModifierIcon(type) {
        if (type === 'normal') return [{icon: 'fas fa-dice-three', size: 0.9, spacing: {x:0, y:10}}];
        else if (type === 'advantage') return [ { icon: 'fas fa-dice', size: 0.9, spacing: {x:10, y:20 } }, { icon: 'fas fa-arrow-up-to-line', size: 0.5, spacing: {x:-40, y:-10 } }]
        else if (type === 'disadvantage') return [ { icon: 'fas fa-dice', size: 0.9, spacing: {x:10, y:20 } }, { icon: 'fas fa-arrow-down-to-line', size: 0.5, spacing: {x:-40, y:-10 } }]
    }

    /** 
     * Roll Types
     */
    static rollType;

    static getRollTypes() {
        return [
            { value: 'default', label: localize('Default', 'DND5E') },
            { value: 'attack', label: localize('Attack', 'DND5E') },
            { value: 'damage', label: localize('Damage', 'DND5E') },
            { value: 'critical', label: localize('Critical', 'DND5E') },
            { value: 'use', label: localize('Use', 'DND5E') }
        ];
    }

    static getRollTypeIcon(type) {
        if (type === 'default') return 'fas fa-grip-lines';
        else if (type === 'attack') return 'fas fa-mace';
        else if (type === 'damage') return 'fas fa-face-head-bandage';
        else if (type === 'critical') return [ { icon: 'fas fa-face-head-bandage', size: 0.8, spacing: {x:-10, y:0 } }, { icon: 'fas fa-star-exclamation', size: 0.4, spacing: {x:45, y:55 } }]
        else if (type === 'use') return 'fas fa-flask';
    }

    /**
     * Attack Modes
     */

    static attackMode;

    static getAttackModes() {
        return [
            { value: 'default', label: localize('Default', 'DND5E') },
            { value: 'oneHanded', label: localize('ATTACK.Mode.OneHanded', 'DND5E') },
            { value: 'twoHanded', label: localize('ATTACK.Mode.TwoHanded', 'DND5E') },
            { value: 'offhand', label: localize('ATTACK.Mode.Offhand', 'DND5E') },
            { value: 'thrown', label: localize('ATTACK.Mode.Thrown', 'DND5E') },
            { value: 'thrown-offhand', label: localize('ATTACK.Mode.ThrownOffhand', 'DND5E') }
        ]
    }

    static getAttackModeIcon(type) {
        if (type === 'default') return 'fas fa-grip-lines';
        else if (type === 'oneHanded') return 'fas fa-dagger';
        else if (type === 'twoHanded') return [ { icon: 'fas fa-dagger', size: 0.9, spacing: {x:0, y:30 } }, { icon: 'fas fa-hands-holding', size: 0.7, spacing: {x:0, y:0 } }]
        else if (type === 'offhand') return [ { icon: 'fas fa-dagger', size: 1, spacing: {x:15, y:10 } }, { icon: 'fas fa-hand', size: 0.5, spacing: {x:-30, y:0 } }]
        else if (type === 'thrown') return 'fas fa-people-arrows';
        else if (type === 'thrown-offhand') return [ { icon: 'fas fa-people-arrows', size: 0.7, spacing: {x:25, y:30 } }, { icon: 'fas fa-hand', size: 0.5, spacing: {x:-30, y:0 } }]
    }
}

const localize = Helpers.localize;