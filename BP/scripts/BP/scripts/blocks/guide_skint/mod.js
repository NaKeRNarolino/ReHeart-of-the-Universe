import { namespace } from "../../utils/namespace";
import { MassiveJSONStorage } from "../../utils/storage";
import { GuideSkintCustomComponent } from "./custom_component";
export function register(reg) {
    reg.registerCustomComponent(namespace.namespaced("guide_skint"), GuideSkintCustomComponent);
}
export const GuideSkintEntityCustomComponent = {
    filter: {
        types: [namespace.namespaced("guide_skint_entity")],
    },
    onTick: (event) => {
        const loc = event.entity.location;
        const skintLoc = event.entity.getDynamicProperty(namespace.namespaced("guide_skint_block_location"));
        // console.warn("I am a skint
        if (skintLoc == undefined)
            return;
        if (event.entity.dimension.getBlock(skintLoc)?.typeId !=
            namespace.namespaced("guide_skint") ||
            event.entity.getVelocity().x != 0 ||
            event.entity.getVelocity().y != 0 ||
            event.entity.getVelocity().z != 0) {
            const block = event.entity.dimension.getBlock(loc);
            const { x, y, z } = block.location;
            console.warn(x, y, z, loc.x, loc.y, loc.z);
            event.entity.remove();
            const storage = new MassiveJSONStorage(namespace.namespaced("guide_skint_storage"));
            storage.ifUnsetSetTo([]);
            let skints = storage.access();
            skints = skints.filter((value, idx, arr) => {
                return JSON.stringify(value.location) != JSON.stringify(skintLoc);
            });
            storage.write(skints);
        }
    },
};
