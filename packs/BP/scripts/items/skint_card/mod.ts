import * as mc from "@minecraft/server";
import { SkintCardCustomComponent } from "./custom_component";
import { namespace } from "../../utils/namespace";

export function register(registry: mc.ItemComponentRegistry) {
  registry.registerCustomComponent(
    namespace.namespaced("skint_card"),
    SkintCardCustomComponent,
  );
}
