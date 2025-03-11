# Other Actions

3 new functions are added to 'Other Actions':

* [Set Default Roll Modifier](#set-default-roll-modifier)
* [Set Default Roll Type](#set-default-roll-type)
* [Set Default Weapon Attack Mode](#set-default-weapon-attack-mode)

## Set Default Roll Modifier
Using this function you can change the 'default roll modifier'.<br>
This roll modifier is applied to rolls in the [Token Action](./token.md) if their `Roll Modifier` is set to `Default`.<br>

### Modifier
You can configure a button to set the modifier to:

* <b>Normal</b>: Perform a normal roll
* <b>Advantage</b>: Perform a roll with advantage (roll twice, keep the highest)
* <b>Disadvantage</b>: Perform a roll with disadvantage (roll twice, keep the lowest)

Say you have a 'Token Action' button set to:

* `Mode`: `Inventory`
* Selection options: Set to select a weapon
* `On Press`: `Use`
* `Show Dialog`: `False`
* `Roll Modifier`: `Default`

If you then press a 'Set Default Roll Modifier' button set to `Advantage` and then press the 'Token Action' button, the selected weapon will roll with advantage.<br>
Similarly, if you have the 'Set Default Roll Modifier' button set to `Disadvantage` the weapon will roll with disadvantage.

### Set After Use To
With this setting you can configure what the default roll mode should be set to after performing a roll.<br>
For example, you might want it to always default to normal rolls, so you set it to `Normal`.<br>
If you have multiple 'Set Default Roll Modifier' buttons on the display, their `Set After Use To` setting will be the same for all.

`Set After Use To` is only applied when something is rolled that actually uses the default roll modifier.

## Set Default Roll Type
Using this function you can change the 'default roll type'.<br>
This roll type is applied to rolls in the [Token Action](./token.md) if their `Roll Type` is set to `Default`.<br>

### Type
You can configure a button to set the type to:

* <b>Default</b>: Perform a default roll, which for, for example, weapons, means an attack roll (with dialog)
* <b>Attack</b>: Perform an attack roll
* <b>Damage</b>: Perform a damage roll
* <b>Critial</b>: Perform a critical damage roll
* <b>Use</b>: Perform a use roll

Say you have a 'Token Action' button set to:

* `Mode`: `Inventory`
* Selection options: Set to select a weapon
* `On Press`: `Use`
* `Show Dialog`: `False`
* `Roll Type`: `Default`

If you then press a 'Set Default Roll Type' button set to `Attack` and then press the 'Token Action' button, an attack roll will be performed for the weapon.<br>
Similarly, if you have the 'Set Default Roll Type' button set to `Damage` the roll will be a damage roll.

If the item you attempt to roll for is not able to perform a roll of the specified type, it will perform a default roll.

### Set After Use To
Functions the same as for [Set Default Roll Modifier](#set-after-use-to).

## Set Default Weapon Attack Mode
Using this function you can change the 'default weapon attack mode'.<br>
This mode is applied to rolls in the [Token Action](./token.md) if their `Attack Mode` is set to `Default`.<br>

### Mode
You can configure a button to set the mode to:

* <b>Default</b>: Perform a default roll for the weapon, which is usually either 'One-Handed' or 'Two-Handed', but depends on the item
* <b>One-Handed</b>: Perform an one-handed roll
* <b>Two-Handed</b>: Perform a two-handed roll
* <b>Offhand</b>: Perform an offhand roll
* <b>Thrown</b>: Perform a thrown roll
* <b>Offhand Thrown</b>: Perform an offhand thrown roll

Say you have a 'Token Action' button set to:

* `Mode`: `Inventory`
* Selection options: Set to select a versatile weapon
* `On Press`: `Use`
* `Show Dialog`: `False`
* `Roll Type`: `Attack`
* `Attack Mode`: `Default`

If you then press a 'Set Default Weapon Attack Mode' button set to `One-Handed` and then press the 'Token Action' button, a one-handed attack roll will be performed for the weapon.<br>
Similarly, if you have the 'Set Default Weapon Attack Mode' button set to `Two-Handed` the roll will be a two-handed attack roll.

If the weapon you attempt to roll for is not able to perform a roll of the specified mode, a notification will appear.

### Set After Use To
Functions the same as for [Set Default Roll Modifier](#set-after-use-to).