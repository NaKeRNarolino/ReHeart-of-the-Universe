import { EntityCustomComponent, EntityCustomComponentRegistry } from "../mod";
import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { utils } from "../../utils/utils";
import { PlayerUIManager } from "../../utils/player_ui_manager";
import { namespace } from "../../utils/namespace";
import { Vector3Builder, Vector3Utils } from "@minecraft/math";

export const PlayerHoldSwordCustomComponent: EntityCustomComponent = {
  filter: {
    types: ["minecraft:player"],
  },
  onTick: (data) => {
    const item = data.entity
      .getComponent("equippable")
      ?.getEquipment(mc.EquipmentSlot.Mainhand);

    const player = data.entity as mc.Player;

    if (new PlayerUIManager(player).get()) {
      return;
    }

    if (
      item != undefined &&
      item.typeId.includes("naker_hotu:") &&
      item.typeId.includes("sword")
    ) {
      // if (
      //   Date.now() -
      //     (player.getDynamicProperty(
      //       namespace.namespaced("last_use"),
      //     ) as number) >
      //   2000
      // ) {
      //   if (Date.now() % 1000 < 50) {
      //     player.playAnimation("animation.naker_hotu.long_sword.hold_idle", {
      //       controller: "hotuAnimation",
      //     });
      //   }
      // }

      if (item.typeId.includes("long")) {
        player.setProperty(namespace.namespaced("holding_sword"), "LONG");
      }

      player.camera.setCamera("minecraft:free", {
        location: Vector3Utils.add(player.location, { x: 5, y: 9, z: 5 }),
        easeOptions: {
          easeTime: 0.25,
          easeType: mc.EasingType.Linear,
        },
        facingEntity: player,
      });
      player.setControlScheme(mc.ControlScheme.CameraRelative);
    } else {
      if (player.getProperty(namespace.namespaced("holding_sword")) == "NONE") {
        return;
      }
      player.setControlScheme(undefined);
      // player.camera.clear();
      player.camera.setCameraWithEase("minecraft:first_person", {
        easeType: mc.EasingType.Linear,
        easeTime: 0.25,
      });
      mc.system.runTimeout(() => {
        player.camera.clear();
      }, 7);
      player.setProperty(namespace.namespaced("holding_sword"), "NONE");
    }
  },
};
