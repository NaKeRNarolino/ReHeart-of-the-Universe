import { system } from "@minecraft/server";
import * as dreamDimension from "./dreamDimension/mod";
import { generateIsland } from "./dreamDimension/island_generator";
export function register(registry) {
    dreamDimension.register(registry);
    system.afterEvents.scriptEventReceive.subscribe((data) => {
        if (data.id == "hotu:island_test") {
            const player = data.sourceEntity;
            generateIsland({
                location: player.location,
                dimension: player.dimension,
            });
        }
    });
}
