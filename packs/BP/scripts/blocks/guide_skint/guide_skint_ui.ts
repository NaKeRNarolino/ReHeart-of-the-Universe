import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "../../utils/namespace";
import { Vector3Utils } from "@minecraft/math";
import { MassiveJSONStorage } from "../../utils/storage";
import { GuideSkintData } from "./custom_component";
import { SparkManager } from "../../sparks/spark_manager";
import { PlayerUIManager } from "../../utils/player_ui_manager";
import { config } from "../../config/mod";

export class GuideSkintManager {
  async openFormDDUI(player: mc.Player, skintIdx: number) {
    const uiManager = new PlayerUIManager(player);
    const form = ui.CustomForm.create(player, "Путеводный Скинт");

    const storage = new MassiveJSONStorage(
      namespace.namespaced("guide_skint_storage"),
    );

    const skints = storage.access() as GuideSkintData[];

    let idx = 0;
    const filtered = [];
    const filteredObservable: { name: string; obs: ui.Observable<boolean> }[] =
      [];

    const searchObs = ui.Observable.create<string>("", {
      clientWritable: true,
    });

    form.textField("Поиск", searchObs).spacer();

    for (const skint of skints) {
      const block = player.dimension.getBlock(skint.location);

      const cost = Math.round(
        Vector3Utils.distance(player.location, block!.center()) / 15,
      );
      const obs = ui.Observable.create<boolean>(true);

      filtered.push(skint);
      filteredObservable.push({
        name: skint.name,
        obs: obs,
      });

      form.button(
        cost < 1 ? `${skint.name} (вы тут)` : `${skint.name} (${cost} спарков)`,
        () => {
          const sparkManager = new SparkManager(player);

          if (sparkManager.get() < cost) {
            player.sendMessage(
              `[!] Недостаточно Спарков для перемещения. Требуется еще ${
                cost - sparkManager.get()
              } Спарков.`,
            );
            uiManager.set(false);
            return;
          }
          player.camera.fade({
            fadeColor: {
              blue: 145 / 255,
              green: 220 / 255,
              red: 1,
            },
            fadeTime: {
              fadeInTime: 0,
              holdTime: 0.1,
              fadeOutTime: 0.25,
            },
          });

          sparkManager.increase(-cost);
          player.teleport(block!.location);
          player.dimension.spawnParticle(
            namespace.namespaced("guide_skint_sparkles"),
            block!.center(),
          );
          uiManager.set(false);
          form.close();
        },
        {
          visible: obs,
          disabled: cost < 1,
        },
      );

      idx++;
    }

    searchObs.subscribe((v) => {
      if (v == "") {
        for (let i = 0; i < filtered.length; i++) {
          filteredObservable[i].obs.setData(true);
        }
      } else {
        const lc = v.toLowerCase();
        for (let i = 0; i < filtered.length; i++) {
          if (filteredObservable[i].name.toLowerCase().includes(lc)) {
            filteredObservable[i].obs.setData(true);
          } else {
            filteredObservable[i].obs.setData(false);
          }
        }
      }
    });

    await form.show();

    uiManager.set(false);
  }

  openForm(player: mc.Player, skintIdx: number) {
    const uiManager = new PlayerUIManager(player);
    uiManager.set(true);

    if (config.experimentalDDUI.get()) {
      this.openFormDDUI(player, skintIdx);
      return;
    }

    const storage = new MassiveJSONStorage(
      namespace.namespaced("guide_skint_storage"),
    );

    const skints = storage.access() as GuideSkintData[];
    const block = player.dimension.getBlock(skints[skintIdx].location);

    const cost = Math.round(
      Vector3Utils.distance(player.location, block!.center()) / 15,
    );

    const form = new ui.ActionFormData();
    form.title(namespace.namespaced("guide_skint_ui") + ` ${cost}`);
    form.button("Back");
    form.button("Travel");
    form.button("Forward");

    form.body(skints[skintIdx].name);
    console.warn("idx", skintIdx, skints.length);
    player.inputPermissions.setPermissionCategory(
      mc.InputPermissionCategory.Movement,
      false,
    );
    player.inputPermissions.setPermissionCategory(
      mc.InputPermissionCategory.Camera,
      false,
    );
    player.onScreenDisplay.hideAllExcept();

    player.camera.setCamera("minecraft:free", {
      facingLocation: block!.center(),
      location: Vector3Utils.add(block!.center(), {
        x: 5,
        y: 5,
        z: 5,
      }),
    });

    form.show(player).then((val) => {
      if (val.canceled) {
        player.inputPermissions.setPermissionCategory(
          mc.InputPermissionCategory.Movement,
          true,
        );
        player.inputPermissions.setPermissionCategory(
          mc.InputPermissionCategory.Camera,
          true,
        );
        player.camera.clear();
        player.onScreenDisplay.resetHudElementsVisibility();
        uiManager.set(false);
        return;
      }
      if (val.selection == 2) {
        this.openForm(
          player,
          skints[skintIdx + 1] == undefined ? 0 : skintIdx + 1,
        );
      } else if (val.selection == 0) {
        this.openForm(
          player,
          skints[skintIdx - 1] == undefined ? skints.length - 1 : skintIdx - 1,
        );
      } else {
        const sparkManager = new SparkManager(player);

        if (sparkManager.get() < cost) {
          player.sendMessage(
            `[!] Недостаточно Спарков для перемещения. Требуется еще ${
              cost - sparkManager.get()
            } Спарков.`,
          );
          player.inputPermissions.setPermissionCategory(
            mc.InputPermissionCategory.Movement,
            true,
          );
          player.inputPermissions.setPermissionCategory(
            mc.InputPermissionCategory.Camera,
            true,
          );
          player.onScreenDisplay.resetHudElementsVisibility();
          player.camera.clear();
          uiManager.set(false);
          return;
        }

        sparkManager.increase(-cost);
        player.teleport(block!.location);
        player.dimension.spawnParticle(
          namespace.namespaced("guide_skint_sparkles"),
          block!.center(),
        );
        player.inputPermissions.setPermissionCategory(
          mc.InputPermissionCategory.Movement,
          true,
        );
        player.inputPermissions.setPermissionCategory(
          mc.InputPermissionCategory.Camera,
          true,
        );
        player.onScreenDisplay.resetHudElementsVisibility();
        player.camera.clear();
        uiManager.set(false);
      }
    });
  }
}
