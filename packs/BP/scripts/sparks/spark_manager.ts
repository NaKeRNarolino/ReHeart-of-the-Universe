import * as mc from "@minecraft/server";
import { namespace } from "../utils/namespace";

export class SparkManager {
  private player: mc.Player;
  static dynamicPropertyId: string = namespace.namespaced("sparks_amount");

  constructor(player: mc.Player) {
    this.player = player;
  }

  private setup() {
    this.set(0);
  }

  get(): number {
    const amount = this.player.getDynamicProperty(
      SparkManager.dynamicPropertyId
    );

    if (amount == undefined) {
      this.setup();
      return 0;
    } else {
      return amount as number;
    }
  }

  set(value: number) {
    this.player.setDynamicProperty(SparkManager.dynamicPropertyId, value);
  }

  increase(value: number = 1) {
    this.player.setDynamicProperty(
      SparkManager.dynamicPropertyId,
      value + this.get()
    );
  }
}
