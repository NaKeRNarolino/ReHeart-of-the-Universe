import { Vector3Utils } from "@minecraft/math";
import {
  EntityCustomComponent,
  EntityCustomComponentRegistry,
} from "../../entityCustomComponents/mod";
import { namespace } from "../../utils/namespace";
import { MassiveJSONStorage } from "../../utils/storage";
import { GuideSkintCustomComponent, GuideSkintData } from "./custom_component";
import * as mc from "@minecraft/server";

export function register(reg: mc.BlockComponentRegistry) {
  reg.registerCustomComponent(
    namespace.namespaced("guide_skint"),
    GuideSkintCustomComponent,
  );
}

export const GuideSkintEntityCustomComponent: EntityCustomComponent = {
  filter: {
    types: [namespace.namespaced("guide_skint_entity")],
  },
  onTick: (event) => {
    const loc = event.entity.location;
    const skintLoc = event.entity.getDynamicProperty(
      namespace.namespaced("guide_skint_block_location"),
    ) as mc.Vector3 | undefined;
    // console.warn("I am a skint
    if (skintLoc == undefined) return;

    if (
      event.entity.dimension.getBlock(skintLoc)?.typeId !=
        namespace.namespaced("guide_skint") ||
      event.entity.getVelocity().x != 0 ||
      event.entity.getVelocity().y != 0 ||
      event.entity.getVelocity().z != 0
    ) {
      const block = event.entity.dimension.getBlock(loc)!;

      const { x, y, z } = block.location;

      console.warn(x, y, z, loc.x, loc.y, loc.z);

      event.entity.remove();

      const storage = new MassiveJSONStorage(
        namespace.namespaced("guide_skint_storage"),
      );

      storage.ifUnsetSetTo([]);

      let skints = storage.access() as GuideSkintData[];

      skints = skints.filter((value, idx, arr) => {
        return JSON.stringify(value.location) != JSON.stringify(skintLoc);
      });

      storage.write(skints);
    }
  },
};
