# Token Action

The token action has extra features for the `Token` mode, and adds new modes:

* [Token Mode](#token-mode): New `Stats`, `On Press` and `On Hold` options
* [Inventory Mode](#inventory-mode): Display and roll weapons and other items
* [Features Mode](#features-mode): Display and roll actor features
* [Spellbook Mode](#spellbook-mode): Display and roll spells

## Token Mode
The [Token mode](https://materialfoundry.github.io/MaterialDeck/actions/token/token/#token-mode) has new `Stats`, `On Press` and `On Hold` options.

| Option            | Description   |
|-------------------|---------------|
| Stats             | Stat to display:<br><b>-HP</b><br><b>-Temporary HP</b><br><b>-AC</b><br><b>-Speed</b><br><b>-Initiative</b><br><b>-Hit Dice</b><br><b>-Spellcasting</b>: Spellcasting ability, DC, modifier or spell slots.<br><b>-Currency</b>: All, or a specified type of currency.<br><b>-Encumbrance</b><br><b>-Ability Score</b>: Ability score of a specified ability.<br><b>-Ability Modifier</b>: Ability modifier of a specified ability.<br><b>-Saving Throw Bonus</b>: Saving throw bonus of a specified ability.<br><b>-Skill Bonus</b>: Skill bonus of a specified skill.<br><b>-Skill Passive</b>: Passive score of a specified skill.<br><b>-Proficiency Bonus</b><br><b>-XP</b>|
| On Press/On Hold  | Sets what to do when the button is pressed/held down:<br><b>-Toggle Condition</b>: Toggle a specified condition or clear all conditions.<br><b>-[Dice Roll](#dice-roll)</b>: Roll a dice for a specified feature. |

### Dice Roll
`Dice Roll` allows you to roll a dice for the selected token/actor.

| Option            | Description   |
|-------------------|---------------|
| Roll             | Type of roll:<br><b>-Initiative</b>: Roll initiative (if in combat).<br><b>-Ability Check</b>: Roll an ability check.<br><b>-Saving Throw</b>: Roll a saving throw.<br><b>-Skill Check</b>: Roll a skill check. |
| Ability<br>(`Ability Check` &<br>`Saving Throw`)           | Ability to roll.    |
| Skill<br>(`Skill Check`) | Skill to roll.   |
| Roll Modifier<br>(All but `Initiative`)   | Roll modifier:<br><b>-Default</b>: Roll using the [default roll modifier](./otherActions.md#set-default-roll-modifier).<br><b>-Normal</b>: Normal roll.<br><b>-Advantage</b>: Roll with advantage (roll twice, take the highest).<br><b>-Disadvantage</b>: Roll with disadvantage (roll twice, take the lowest).

## Inventory Mode
The inventory mode can be used to display and control items in the token/actor's inventory.

| Option            | Description   |
|-------------------|---------------|
| Item Type         | <b>-Any</b>: Select any kind of item.<br><b>-Weapons</b>: Select from weapons.<br><b>-Equipment</b>: Select from equipment.<br><b>-Consumables</b>: Select from consumable items.<br><b>-Tools</b>: Select from tools.<br><b>-Containers</b>: Select from containers.<br><b>-Loot</b>: Select from loot.<br><b>-[Set Type & Filter Sync](#synced-settings)</b>: Set the synced settings for this page. Will synchronize `Item Type` and `Selection Filter`.<br><b>-[Offset](#offset)</b>: Set item offsets. |
| Selection Filter  | Selects item parameters to filter out:<br><b>-Equipped</b>: Filters equipped items.<br><b>-Not Equipped</b>: Filters unequipped items<br><b>-Unequippable</b>: Filters items that cannot be equipped.<br><b>-Attuned</b>: Filters attuned items.<br><b>-Unattuned</b>: Filters unattuned items. |
| Sync Type & Filter | Will [synchronize](#synced-settings) `Item Type` and `Selection Filter` for all buttons on this page with this setting enabled. |
| Selection         | Set how to select the item:<br><b>-Select by Nr</b>: Select an item using a number.<br><b>-Select by Name/Id</b>: Select an item using its name or id. |
| Order<br>(`Select by Nr`) | Sets how to order the items:<br><b>-Character Sheet</b>: Follow the order of the character sheet.<br><b>-Alphabetically</b>: Order items alphabetically.    |
| Nr<br>(`Select by Nr`)    | Number of the item to select. |
| Name/Id<br>(`Select by Name/Id`)  | Name or id of the item to select.  |
| On Press/On Hold  | Sets what to do when the button is pressed/held down:<br><b>-Do Nothing</b>: Do nothing.<br><b>-[Use](#use-item)</b>: Use (roll) the item.<br><b>-Equip</b>: Equip or unequip the item.<br><b>-Set Quantity</b>: Set the quantity of the item.<br><b>-Set Charges</b>: Set the charges of the item.    |
| Mode<br>(`Equip`)    | Configure what to do:<br><b>-Toggle</b>: Toggle between equipping and unequipping item.<br><b>-Equip</b>: Equip item.<br><b>-Unequip</b>: Unequip item.  |
| Mode<br>(`Set Quantity`) | Configure how to set the quantity:<br><b>-Set to Value</b>: Set to the specified value.<br><b>-Increase/Decrease</b>: Increase or decrease the quantity by the specified value. |
| Mode<br>(`Set Charges`) | Configure how to set the charges:<br><b>-Reset</b>: Reset the charges.<br><b>-Set to Value</b>: Set to the specified value.<br><b>-Increase/Decrease</b>: Increase or decrease the quantity by the specified value. |
| Display           | <b>-Icon</b>: Display item's icon.<br><b>-Name</b>: Display item's name.<br><b>-Box</b>: Display a box with data.<br><b>-To Hit</b>: Display the item's 'To Hit' modifier.<br><b>-Damage</b>: Display the item's damage formula.<br><b>-Range</b>: Display the item's range. |

### Use Item
Using the `On Press` or `On Hold` `Use Item` function, you can use the item by pressing/holding the button.

| Option            | Description   |
|-------------------|---------------|
| Show Dialog       | <b>Selected</b>: Will show the roll dialog with all (applicable) options below pre-filled.<br><b>Not selected</b>: Will not show the roll dialog and roll the item according to the options below. |
| Roll Modifier     | Sets the roll modifier:<br><b>-Default</b>: Roll using the [default roll modifier](./otherActions.md#set-default-roll-modifier).<br><b>-Normal</b>: Normal roll.<br><b>-Advantage</b>: Roll with advantage (roll twice, take the highest).<br><b>-Disadvantage</b>: Roll with disadvantage (roll twice, take the lowest). |
| Roll Type         | Sets the roll type:<br><b>-Default</b>: Roll using the [default roll type](./otherActions.md#set-default-roll-type).<br><b>-Attack</b>: Perform an attack roll.<br><b>-Damage</b>: Perform a damage roll.<br><b>-Critical</b>: Perform a critical damage roll.<br><b>-Use</b>: Perform a 'use item' roll. |
| Attack Mode       | Sets the attack mode:<br><b>-Default</b>: Roll using the [default weapon attack mode](./otherActions.md#set-default-weapon-attack-mode).<br><b>-One-Handed</b>: Perform a one-handed roll.<br><b>-Two-Handed</b>: Perform a two-handed roll.<br><b>-Offhand</b>: Perform an offhand roll.<br><b>-Thrown</b>: Perform a thrown roll.<br><b>-Offhand Throw</b>: Perform an offhand throw roll. |

## Features Mode
The features mode can be used to display and control token/actor features.

| Option            | Description   |
|-------------------|---------------|
| Features Type         | <b>-Any</b>: Select any kind of feature.<br><b>-Classes</b>: Select from classes.<br><b>-Subclasses</b>: Select from subclasses.<br><b>-Backgrounds</b>: Select from backgrounds.<br><b>-Races</b>: Select from races.<br><b>-Abilities</b>: Select from (all) abilities.<br><b>-Active Abilities</b>: Select from active abilities.<br><b>-Passive Abilities</b>: Select from passive abilities.<br><b>-[Set Type & Filter Sync](#synced-settings)</b>: Set the synced settings for this page. Will synchronize `Feature Type` and `Feature Type Filter`.<br><b>-[Offset](#offset)</b>: Set feature offsets. |
| Selection Filter  | Selects feature types to filter out:<br><b>-Features</b>: Filters feature features.<br><b>-Class</b>: Filters class features<br><b>-Special</b>: Filters special features.<br><b>-Action</b>: Filters action features.<br><b>-Bonus Action</b>: Filters bonus action features.<br><b>-Reaction</b>: Filters reaction features.<br><b>-Legendary Actions</b>: Filters legendary action features.<br><b>-Mythic Actions</b>: Filters mytic action features.<br> |
| Sync Type & Filter | Will [synchronize](#synced-settings) `Feature Type` and `Feature Type Filter` for all buttons on this page with this setting enabled. |
| Selection         | Set how to select the feature:<br><b>-Select by Nr</b>: Select a feature using a number.<br><b>-Select by Name/Id</b>: Select a feature using its name or id. |
| Order<br>(`Select by Nr`) | Sets how to order the features:<br><b>-Character Sheet</b>: Follow the order of the character sheet.<br><b>-Alphabetically</b>: Order features alphabetically.    |
| Nr<br>(`Select by Nr`)    | Number of the feature to select. |
| Name/Id<br>(`Select by Name/Id`)  | Name or id of the feature to select.  |
| Display           | <b>-Icon</b>: Display feature's icon.<br><b>-Name</b>: Display feature's name.<br><b>-Uses</b>: Display the feature's uses. |

## Spellbook Mode
The spellbook mode can be used to display and control token/actor spells.


| Option            | Description   |
|-------------------|---------------|
| Spell Type         | <b>-Any</b>: Select any kind of spell.<br><b>-Cantrip/Level</b>: Select from the specified spell level.<br><b>-[Set Type & Filter Sync](#synced-settings)</b>: Set the synced settings for this page. Will synchronize `Spell Type` and `Preparation Mode Filter`.<br><b>-[Offset](#offset)</b>: Set item offsets. |
| Preparation Mode Filter Filter  | Selects spell preparation modes to filter out:<br><b>-Prepared</b>: Filters prepared spells.<br><b>-Always Prepared</b>: Filters always prepared spells<br><b>-Innate</b>: Filters innate spells.<br><b>-At Will</b>: Filters at will spells.<br><b>-Ritual</b>: Filters ritual spells.<br><b>-Pact Magic</b>: Filters pact magic spells. |
| Sync Type & Filter | Will [synchronize](#synced-settings) `Spell Type` and `Preparation Mode Filter` for all buttons on this page with this setting enabled. |
| Selection         | Set how to select the spell:<br><b>-Select by Nr</b>: Select a spell using a number.<br><b>-Select by Name/Id</b>: Select a spell using its name or id. |
| Order<br>(`Select by Nr`) | Sets how to order the spells:<br><b>-Character Sheet</b>: Follow the order of the character sheet.<br><b>-Alphabetically</b>: Order spells alphabetically.    |
| Nr<br>(`Select by Nr`)    | Number of the spell to select. |
| Name/Id<br>(`Select by Name/Id`)  | Name or id of the spell to select.  |
| Display           | <b>-Icon</b>: Display spell's icon.<br><b>-Name</b>: Display spell's name.<br><b>-Uses</b>: Display the spell's range. |

## Synced Settings
You can synchronize setting across multiple buttons on the same page, where a page is all the buttons that are currently visible on the device.<br>
If two buttons have `Sync Type & Filter` selected, and you change one of the filter settings on one, the otheer button will also be changed.

Each of the modes have a `Set Type & Filter Sync` setting. If you press this button, all buttons with `Syn Type & Filter` will have their settings changed to what you have configured for the `Set Type & Filter Sync` button.

## Offset
Offsets can be used in combination with the `Select by Nr` `Selection Mode`.<br>
By setting an offset, you increase `Nr` for all buttons with that offset.

For example, say you have 9 `Inventory Mode` buttons, with `Nr` set from 1 to 9.<br>
If you then set the offset to 9, it will display items 10 - 19.

| Option            | Description   |
|-------------------|---------------|
| Offset Mode       | Sets how to set the offset:<br><b>-Set to Value</b>: Sets the offset to the value set in `Offset`.<br><b>-Increase/Decrease</b>: Increases the offset by the value set in `Offset`. |
| Offset            | The value to set the offset to (in case of `Set to Value`), or the value to increment the offset with (in case of `Increase/Decrease`).<br> The offset can be any value, positive or negative. |
| Display           | <b>-Offset</b>: Display the current offset on the Stream Deck.<br><b>-Icon</b>: Display an icon on the Stream Deck. |
| Colors            | <b>-On Color</b>: (`Set to Value` only) A border is drawn on the Stream Deck of this color if the current offset is equal to the offset configured in `Offset`.<br><b>-Off Color</b>: (`Set to Value` only) A border is drawn on the Stream Deck of this color if the current offset is not equal to the offset configured in `Offset`.<br><b>-Background</b>: Background color of the button. |