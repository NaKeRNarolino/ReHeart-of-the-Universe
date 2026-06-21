import { namespace } from "./namespace";
export class PlayerUIManager {
    constructor(player) {
        this.player = player;
    }
    set(value) {
        this.player.setDynamicProperty(PlayerUIManager.dynamicPropertyId, value);
    }
    get() {
        return this.player.getDynamicProperty(PlayerUIManager.dynamicPropertyId);
    }
}
PlayerUIManager.dynamicPropertyId = namespace.namespaced("is_in_ui");
