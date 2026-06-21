import { SkintCardCustomComponent } from "./custom_component";
import { namespace } from "../../utils/namespace";
export function register(registry) {
    registry.registerCustomComponent(namespace.namespaced("skint_card"), SkintCardCustomComponent);
}
