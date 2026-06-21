import * as setSparks from "./set_sparks";
import * as config from "./config";
export function register(registry) {
    setSparks.register(registry);
    config.register(registry);
}
