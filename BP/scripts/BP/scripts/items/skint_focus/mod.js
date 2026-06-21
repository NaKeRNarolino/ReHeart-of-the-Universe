import { namespace } from "../../utils/namespace";
import { SkintFocusCustomComponent } from "./custom_component";
export function register(registry) {
    registry.registerCustomComponent(namespace.namespaced("skint_lens_component"), SkintFocusCustomComponent);
}
