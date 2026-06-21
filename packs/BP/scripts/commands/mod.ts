import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import * as setSparks from "./set_sparks";
import * as config from "./config";

export function register(registry: mc.CustomCommandRegistry) {
  setSparks.register(registry);
  config.register(registry);
}
