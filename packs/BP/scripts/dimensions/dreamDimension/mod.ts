import { DimensionRegistry } from "@minecraft/server";
import { namespace } from "../../utils/namespace";

export function register(registry: DimensionRegistry) {
  registry.registerCustomDimension(namespace.namespaced("dream_dimension"));
}
