import { namespace } from "../utils/namespace";
import { MassiveJSONStorage } from "../utils/storage";
import { GuideSkintData } from "./guide_skint/custom_component";
import * as guide_skint from "./guide_skint/mod";
import "./guide_skint/mod";
import * as mc from "@minecraft/server";

export function registerBlockComponents(data: mc.BlockComponentRegistry) {
  guide_skint.register(data);
}

mc.world.afterEvents.worldLoad.subscribe(() => {
  mc.system.run(async () => {
    const skints = new MassiveJSONStorage(
      namespace.namespaced("guide_skint_storage")
    ).access() as GuideSkintData[];

    for (let skintR in skints) {
      const skint = skintR as unknown as GuideSkintData;

      console.warn("loading", skint);

      mc.world
        .getDimension("overworld")
        .runCommand(
          `tickingarea add ${skint.location.x} ${skint.location.y} ${skint.location.z} ${skint.location.x} ${skint.location.y} ${skint.location.z} temp false`
        );

      await mc.system.waitTicks(2);

      mc.world.getDimension("overworld").runCommand(`tickingarea remove temp`);
    }
  });
});
