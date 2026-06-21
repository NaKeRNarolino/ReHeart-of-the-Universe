import { namespace } from "../../utils/namespace";
import { LongSwordCustomComponent } from "./custom_component";
export function register(data) {
    data.registerCustomComponent(namespace.namespaced("long_sword_cc"), LongSwordCustomComponent);
}
