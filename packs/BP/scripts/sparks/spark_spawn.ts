import * as mc from "@minecraft/server";
import { summonSparks } from "./spark_main";
import { SparkManager } from "./spark_manager";

mc.world.afterEvents.entityDie.subscribe((data) => {
  if (
    !data.deadEntity.matches({
      families: ["monster"],
    })
  ) {
    return;
  }

  const location = data.deadEntity.location;
  const hp = data.deadEntity.getComponent("health")!.effectiveMax;

  summonSparks(
    data.deadEntity.dimension,
    location,
    Math.max(3, Math.floor(Math.random() * hp)),
    2,
    grabSparks
  );
});

function grabSparks(value: number, player: mc.Player) {
  const manager = new SparkManager(player);

  manager.increase(value);
}
