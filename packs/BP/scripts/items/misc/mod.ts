import { ItemComponentRegistry } from "@minecraft/server";
import { namespace } from "../../utils/namespace";
import { HealthVialComponent } from "./health_vial";

export function register(data: ItemComponentRegistry) {
  data.registerCustomComponent(
    namespace.namespaced("health_vial"),
    HealthVialComponent
  );
}
