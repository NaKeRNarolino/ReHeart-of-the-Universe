import "./sparks/mod";
import "./hud/mod";
import "./blocks/mod";
import "./entityCustomComponents/mod";
import "./items/mod";
import "./init";
import "./stamina/mod";
import * as mc from "@minecraft/server";
import * as items from "./items/mod";
import * as blocks from "./blocks/mod";
import * as commands from "./commands/mod";
import * as dimensions from "./dimensions/mod";
mc.system.beforeEvents.startup.subscribe((data) => {
    items.registerItemComponents(data.itemComponentRegistry);
    blocks.registerBlockComponents(data.blockComponentRegistry);
    commands.register(data.customCommandRegistry);
    dimensions.register(data.dimensionRegistry);
});
