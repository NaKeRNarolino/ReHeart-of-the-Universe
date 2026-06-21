import * as mc from "@minecraft/server";
import { namespace } from "../../utils/namespace";
import { SkintFocusCustomComponent } from "./custom_component";

export function register(registry: mc.ItemComponentRegistry) {
  registry.registerCustomComponent(
    namespace.namespaced("skint_lens_component"),
    SkintFocusCustomComponent,
  );
}
