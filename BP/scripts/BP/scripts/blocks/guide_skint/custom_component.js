import * as mc from "@minecraft/server";
import { namespace } from "../../utils/namespace";
import { GuideSkintManager } from "./guide_skint_ui";
import { MassiveJSONStorage } from "../../utils/storage";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";
export const GuideSkintCustomComponent = {
    beforeOnPlayerPlace: async (event) => {
        const item = event
            .player.getComponent("equippable")
            ?.getEquipment(mc.EquipmentSlot.Mainhand);
        if (item?.nameTag == undefined) {
            event.player.sendMessage("[!] Переименуйте Путеводный Скинт, чтобы установить его.");
            event.cancel = true;
            return;
        }
        const storage = new MassiveJSONStorage(namespace.namespaced("guide_skint_storage"));
        storage.ifUnsetSetTo([]);
        const found = storage.access().find((v) => {
            if (v.name == item.nameTag) {
                return true;
            }
            return false;
        });
        if (found != undefined) {
            event.player.sendMessage(`[!] Путеводный Скинт с названием "${item.nameTag}" уже существует.`);
            event.cancel = true;
            return;
        }
        if (event.dimension.id != MinecraftDimensionTypes.Overworld) {
            event.player.sendMessage(`[!] Путеводный Скинт можно активировать только в Верхнем мире.`);
            event.cancel = true;
            return;
        }
        mc.system.run(() => {
            const name = item.nameTag;
            const storage = new MassiveJSONStorage(namespace.namespaced("guide_skint_storage"));
            storage.ifUnsetSetTo([]);
            const skints = storage.access();
            skints.push({
                name: name,
                location: event.block.location,
            });
            storage.write(skints);
        });
    },
    onPlace: async (event) => {
        const entity = event.dimension.spawnEntity(namespace.namespaced("guide_skint_entity"), event.block.bottomCenter());
        const { x, y, z } = event.block.location;
        entity.addTag(namespace.namespaced(`guide_skint:{${x};${y};${z}}`));
        entity.setDynamicProperty(namespace.namespaced("guide_skint_block_location"), event.block.location);
        await mc.system.waitTicks(7);
        event.dimension.spawnParticle(namespace.namespaced("guide_skint_sparkles"), event.block.bottomCenter());
    },
    onPlayerBreak: (event) => {
        const { x, y, z } = event.block.location;
        const entity = event.dimension
            .getEntitiesAtBlockLocation(event.block.location)
            .filter((v) => {
            if (v.typeId == namespace.namespaced("guide_skint_entity")) {
                return true;
            }
            return false;
        });
        entity[0]?.remove();
        event.dimension.spawnParticle(namespace.namespaced("guide_skint_break_sparkles"), event.block.bottomCenter());
        const storage = new MassiveJSONStorage(namespace.namespaced("guide_skint_storage"));
        storage.ifUnsetSetTo([]);
        let skints = storage.access();
        skints = skints.filter((value, idx, arr) => {
            return (JSON.stringify(value.location) != JSON.stringify(event.block.location));
        });
        storage.write(skints);
    },
    onPlayerInteract: (event) => {
        const { player } = event;
        const storage = new MassiveJSONStorage(namespace.namespaced("guide_skint_storage"));
        storage.ifUnsetSetTo([]);
        const locMatch = storage.access().find((v) => {
            if (JSON.stringify(v.location) == JSON.stringify(event.block.location)) {
                return true;
            }
            return false;
        });
        if (locMatch == undefined) {
            player?.sendMessage("[!] Путеводный Скинт не активирован. Чтобы активировать его, добудьте его, переименуйте в название точки и установите.");
            return;
        }
        new GuideSkintManager().openForm(player, 0);
    },
};
