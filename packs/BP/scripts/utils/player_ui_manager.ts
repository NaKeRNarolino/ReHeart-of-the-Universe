import { namespace } from "./namespace";
import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

export class PlayerUIManager {
  static dynamicPropertyId = namespace.namespaced("is_in_ui");
  player: mc.Player;

  constructor(player: mc.Player) {
    this.player = player;
  }

  set(value: boolean) {
    this.player.setDynamicProperty(PlayerUIManager.dynamicPropertyId, value);
  }

  get(): boolean {
    return this.player.getDynamicProperty(
      PlayerUIManager.dynamicPropertyId
    ) as boolean;
  }
}
