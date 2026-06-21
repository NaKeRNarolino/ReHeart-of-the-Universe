import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "./utils/namespace";

mc.world.afterEvents.worldLoad.subscribe((_) => {
  mc.world.gameRules.doDayLightCycle = false;
  mc.world.gameRules.doWeatherCycle = false;
  mc.world.gameRules.naturalRegeneration = false;
  mc.world.setTimeOfDay(mc.TimeOfDay.Sunset);

  mc.system.runTimeout(() => {
    mc.world
      .getDimension("overworld")
      .getEntities({ type: namespace.namespaced("spark") })
      .forEach((entity) => {
        entity.remove();
      });
  }, 100);
});
