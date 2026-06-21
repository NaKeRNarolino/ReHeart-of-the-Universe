import * as mc from "@minecraft/server";
import { namespace } from "../../utils/namespace";
import { getSkintFocusColor, getSkintFocusOrbLocation, } from "../../items/skint_card/custom_component";
const heldItemTypeId = namespace.namespaced("held_item_type");
export const ItemHoldComponent = {
    filter: {
        types: ["minecraft:player"],
    },
    onTick: ({ entity }) => {
        const player = entity;
        const equip = player.getComponent("equippable");
        const mainhand = equip.getEquipment(mc.EquipmentSlot.Mainhand);
        const heldItemType = player.getDynamicProperty(heldItemTypeId);
        if (mainhand?.typeId == "naker_hotu:skint_magic_lens") {
            const offhand = equip.getEquipment(mc.EquipmentSlot.Offhand);
            if (offhand?.typeId == "naker_hotu:skint_card") {
                const orb = getSkintFocusOrbLocation(player);
                const mvm = getSkintFocusColor(player).mvm;
                player.dimension.spawnParticle(namespace.namespaced("skint_focus_idle_orb"), orb, mvm);
            }
            if (heldItemType != "skint_lens") {
                player.playAnimation("animation.magic_lenses.player_held", {
                    stopExpression: "!query.is_item_name_any('slot.weapon.mainhand', 'naker_hotu:skint_magic_lens')",
                    blendOutTime: 0.1,
                });
                player.camera.setCamera("minecraft:follow_orbit", {
                    easeOptions: {
                        easeTime: 0.25,
                        easeType: mc.EasingType.Linear,
                    },
                    viewOffset: {
                        x: 2,
                        y: 2,
                    },
                    offsetFromTargetCenter: {
                        x: 5,
                        y: 5,
                        z: 5,
                    },
                });
            }
            player.setDynamicProperty(heldItemTypeId, "skint_lens");
        }
        else {
            if (heldItemType == "skint_lens") {
                player.camera.setCameraWithEase("minecraft:first_person", {
                    easeType: mc.EasingType.Linear,
                    easeTime: 0.25,
                });
                mc.system.runTimeout(() => {
                    player.camera.clear();
                }, 7);
            }
            player.setDynamicProperty(heldItemTypeId, "not_specified");
        }
    },
};
