import "./long_swords/mod";
import * as long_swords from "./long_swords/mod";
import * as misc from "./misc/mod";
import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import * as skint_card from "./skint_card/mod";
import * as skint_focus from "./skint_focus/mod";

export function registerItemComponents(data: mc.ItemComponentRegistry) {
  long_swords.register(data);
  misc.register(data);
  skint_card.register(data);
  skint_focus.register(data);
}
