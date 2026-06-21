import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "../utils/namespace";

export class StaminaManager {
  player: mc.Player;
  static propertyId: string = namespace.namespaced("stamina");
  static maxPropertyId: string = namespace.namespaced("max_stamina");
  static canIncreasePropertyId: string = namespace.namespaced(
    "stamina_can_increase"
  );

  private constructor(player: mc.Player) {
    this.player = player;
  }

  static of(player: mc.Player) {
    return new StaminaManager(player);
  }

  increase(amount: number) {
    this.set(this.get() + amount);
    this.clamp();
  }

  clamp() {
    if (this.get() > this.getMax()) {
      this.set(this.getMax());
    } else if (this.get() < 0) {
      this.set(0);
    }
  }

  decrease(amount: number) {
    this.increase(-amount);
    this.clamp();
  }

  get(): number {
    return (
      (this.player.getDynamicProperty(StaminaManager.propertyId) as
        | number
        | undefined) ?? 0
    );
  }

  getMax(): number {
    return (
      (this.player.getDynamicProperty(StaminaManager.maxPropertyId) as
        | number
        | undefined) ?? 256
    );
  }

  set(amount: number): void {
    this.player.setDynamicProperty(StaminaManager.propertyId, amount);
  }

  default(): void {
    this.player.setDynamicProperties({
      [StaminaManager.maxPropertyId]: 256,
      [StaminaManager.propertyId]: 256,
    });
  }

  canIncrease() {
    return (
      ((this.player.getDynamicProperty(StaminaManager.canIncreasePropertyId) as
        | number
        | undefined) ?? 0) < Date.now()
    );
  }

  setTimeToIncrease(amount: number) {
    this.player.setDynamicProperty(
      StaminaManager.canIncreasePropertyId,
      Date.now() + amount
    );
  }
}
