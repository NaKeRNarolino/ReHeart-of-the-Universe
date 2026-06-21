import { DimensionRegistry, Player, system } from "@minecraft/server";
import * as dreamDimension from "./dreamDimension/mod";
import { generateIsland } from "./dreamDimension/island_generator";

export function register(registry: DimensionRegistry) {
  dreamDimension.register(registry);

  system.afterEvents.scriptEventReceive.subscribe((data) => {
    if (data.id == "hotu:island_test") {
      const player = data.sourceEntity! as Player;

      generateIsland({
        location: player.location,
        dimension: player.dimension,
      });
    }
  });
}
