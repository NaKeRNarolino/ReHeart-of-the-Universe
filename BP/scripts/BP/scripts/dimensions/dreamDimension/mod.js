import { namespace } from "../../utils/namespace";
export function register(registry) {
    registry.registerCustomDimension(namespace.namespaced("dream_dimension"));
}
