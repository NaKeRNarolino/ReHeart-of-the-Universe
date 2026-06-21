import "./long_swords/mod";
import * as long_swords from "./long_swords/mod";
import * as misc from "./misc/mod";
import * as skint_card from "./skint_card/mod";
import * as skint_focus from "./skint_focus/mod";
export function registerItemComponents(data) {
    long_swords.register(data);
    misc.register(data);
    skint_card.register(data);
    skint_focus.register(data);
}
