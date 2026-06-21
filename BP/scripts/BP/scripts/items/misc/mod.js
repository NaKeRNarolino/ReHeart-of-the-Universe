import { namespace } from "../../utils/namespace";
import { HealthVialComponent } from "./health_vial";
export function register(data) {
    data.registerCustomComponent(namespace.namespaced("health_vial"), HealthVialComponent);
}
