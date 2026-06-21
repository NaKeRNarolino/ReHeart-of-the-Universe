import * as mc from "@minecraft/server";
import { namespace } from "../../utils/namespace";
import { Vector3Utils } from "@minecraft/math";
import { HitboxedAttackArea } from "../../utils/hitboxed_attack";
mc.Player.prototype.applyImpulse = function (vector) {
    this.applyKnockback({ x: vector.x, z: vector.z }, vector.y < 0.0 ? 0.5 * vector.y : vector.y);
};
const attackType1Hitbox = new HitboxedAttackArea({ x: -2, y: -2, z: -1 }, { x: 2, y: 0.5, z: 3 });
const attackType2Hitbox = new HitboxedAttackArea({ x: -2, y: -2, z: -1 }, { x: 2, y: 3, z: 3 });
const attackType3Hitbox = new HitboxedAttackArea({ x: -2, y: -2, z: -1 }, { x: 2, y: 3, z: 3 });
const attackType4Hitbox = new HitboxedAttackArea({ x: -1.5, y: -2, z: -1 }, { x: 1.5, y: 0.25, z: 3 });
export const LongSwordCustomComponent = {
    onUse: (event) => {
        event.source.startItemCooldown("attack", 30);
        const player = event.source;
        let lastSet = 0;
        if (Date.now() -
            (player.getDynamicProperty(namespace.namespaced("last_use")) ?? 0) <
            2000) {
            const lastAttackState = player.getDynamicProperty(namespace.namespaced("attack_state"));
            player.setProperty(namespace.namespaced("attack_state"), lastAttackState + 1 > 4 ? 1 : lastAttackState + 1);
            lastSet = lastAttackState + 1 > 4 ? 1 : lastAttackState + 1;
            player.setDynamicProperty(namespace.namespaced("attack_state"), lastSet);
        }
        else {
            player.setProperty(namespace.namespaced("attack_state"), 1);
            player.setDynamicProperty(namespace.namespaced("attack_state"), 1);
        }
        if (lastSet == 0) {
            lastSet = 1;
        }
        switch (lastSet) {
            case 1:
                player.playAnimation("animation.naker_hotu.long_sword.attack_1", {
                    controller: "hotuAnimation",
                    blendOutTime: 0.2,
                });
                mc.system.runTimeout(() => {
                    attackType1Hitbox.attackUsing(player, 7, mc.EntityDamageCause.entityAttack);
                }, 4);
                break;
            case 2:
                player.playAnimation("animation.naker_hotu.long_sword.attack_2", {
                    controller: "hotuAnimation",
                    blendOutTime: 0.2,
                });
                mc.system.runTimeout(() => {
                    attackType2Hitbox.attackUsing(player, 7, mc.EntityDamageCause.entityAttack);
                }, 4);
                break;
            case 3:
                player.playAnimation("animation.naker_hotu.long_sword.attack_3", {
                    controller: "hotuAnimation",
                    blendOutTime: 0.2,
                });
                mc.system.runTimeout(() => {
                    attackType3Hitbox.attackUsing(player, 7, mc.EntityDamageCause.entityAttack);
                }, 5);
                break;
            case 4:
                player.playAnimation("animation.naker_hotu.long_sword.attack_4", {
                    controller: "hotuAnimation",
                    blendOutTime: 0.2,
                });
                attackType4Hitbox.attackUsing(player, 7, mc.EntityDamageCause.entityAttack);
                player.applyImpulse(Vector3Utils.scale({
                    x: player.getViewDirection().x,
                    y: 0,
                    z: player.getViewDirection().z,
                }, 3));
                const mvm = new mc.MolangVariableMap();
                mvm.setVector3("dir_back", {
                    x: -player.getViewDirection().x,
                    y: 0,
                    z: -player.getViewDirection().z,
                });
                player.dimension.spawnParticle("naker_hotu:attack_dash_trail", player.location, mvm);
                break;
        }
        mc.system.runTimeout(() => {
            player.setProperty(namespace.namespaced("attack_state"), 0);
        }, 2);
        player.applyImpulse(Vector3Utils.scale({
            x: player.getViewDirection().x,
            y: 0,
            z: player.getViewDirection().z,
        }, 0.3));
        player.setDynamicProperty(namespace.namespaced("last_use"), Date.now());
    },
};
