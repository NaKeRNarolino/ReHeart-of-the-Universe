import { Vector3Utils } from "@minecraft/math";
import * as mc from "@minecraft/server";
import { namespace } from "../../utils/namespace";
import { uiManager, UIManager } from "@minecraft/server-ui";
import { PlayerUIManager } from "../../utils/player_ui_manager";
import { utils } from "../../utils/utils";

Object.defineProperty(mc.ItemStack.prototype, "vialLevel", {
  get(): number {
    if (!(this instanceof mc.ItemStack))
      throw new Error("`this` is not an ItemStack");

    if (!this.typeId.startsWith("naker_hotu:health_vial_"))
      throw new Error("The item is not a health vial!");

    return parseInt(this.typeId.replace("naker_hotu:health_vial_", ""));
  },
});

declare module "@minecraft/server" {
  interface ItemStack {
    vialLevel: number;
  }
}

export const HealthVialComponent: mc.ItemCustomComponent = {
  onUse: async (data) => {
    const { itemStack: item, source: player } = data;

    if (
      player.getDynamicProperty(namespace.namespaced("use_health_vial")) == true
    ) {
      return;
    }

    if (item == undefined) return;

    const level = item.vialLevel;
    const uiManager = new PlayerUIManager(player);
    const slot = player.selectedSlotIndex;

    uiManager.set(true);
    player.setDynamicProperty(namespace.namespaced("use_health_vial"), true);

    const mvm = new mc.MolangVariableMap();

    player.playAnimation("animation.naker_hotu.use_vial");

    player.inputPermissions.setPermissionCategory(
      mc.InputPermissionCategory.Camera,
      false
    );
    player.inputPermissions.setPermissionCategory(
      mc.InputPermissionCategory.Movement,
      false
    );

    player.camera.fade({
      fadeTime: {
        fadeInTime: 0,
        fadeOutTime: 0.05,
        holdTime: 0,
      },
      fadeColor: {
        red: 0,
        green: 0,
        blue: 0,
      },
    });

    player.camera.setCamera("minecraft:free", {
      location: Vector3Utils.add(player.location, { x: 5, y: 5, z: 5 }),
      facingLocation: player.getHeadLocation(),
    });

    mvm.setFloat("variable.rotation_index", 0);

    player.dimension.spawnParticle(
      namespace.namespaced("start_use_health_vial"),
      player.location,
      mvm
    );

    mvm.setFloat("variable.rotation_index", 0.5);

    player.dimension.spawnParticle(
      namespace.namespaced("start_use_health_vial"),
      player.location,
      mvm
    );

    await mc.system.waitTicks(60);

    player.dimension.spawnParticle(
      namespace.namespaced("use_health_vial"),
      player.location
    );

    const health = player.getComponent("health")!;
    health.setCurrentValue(health.currentValue + 5);

    player.inputPermissions.setPermissionCategory(
      mc.InputPermissionCategory.Camera,
      true
    );
    player.inputPermissions.setPermissionCategory(
      mc.InputPermissionCategory.Movement,
      true
    );

    const newItem = new mc.ItemStack(
      namespace.namespaced(`health_vial_${level - 1}`)
    );

    player.getComponent("inventory")!.container.setItem(slot, newItem);

    await mc.system.waitTicks(2);

    player.camera.clear();

    uiManager.set(false);

    player.setDynamicProperty(namespace.namespaced("use_health_vial"), false);
  },
};
