import * as mc from "@minecraft/server";
import { utils } from "./utils";
import { Vector3Utils } from "@minecraft/math";

export type HitboxedAttackResult = {
  damagedEntities: mc.Entity[];
  absoluteStart: mc.Vector3;
  absoluteEnd: mc.Vector3;
  center: mc.Vector3;
};

/**
 * @description A class representing a hitboxed attack area, which can be used to apply damage to entities within a specified area relative to the player's perspective.
 */
export class HitboxedAttackArea {
  start: mc.Vector3;
  end: mc.Vector3;

  /**
   * Creates a new hitboxed attack area defined by two vectors, which represent the start and end points of the attack area relative to the player's position and orientation.
   * @param start The start point of the attack area relative to the player's position and orientation.
   * @param end The end point of the attack area relative to the player's position and orientation.
   */
  constructor(start: mc.Vector3, end: mc.Vector3) {
    this.start = start;
    this.end = end;
  }

  /**
   * Perform an attack using this hitboxed attack area, applying damage to all entities within the defined area. The damage is applied based on the player's position and orientation, and the cause of the damage can be specified.
   * Returns an array of the entities that were damaged.
   * @param player The player dealing the damage.
   * @param damage The amount of damage to deal.
   * @param cause The cause of the damage.
   */
  attackUsing(
    player: mc.Player,
    damage: number,
    cause: mc.EntityDamageCause,
  ): HitboxedAttackResult {
    const absoluteStart = utils.calculateLocalCoordinates(player, this.start);
    const absoluteEnd = utils.calculateLocalCoordinates(player, this.end);
    const center = Vector3Utils.lerp(absoluteStart, absoluteEnd, 0.5);
    const hitboxMax = Math.max(
      Math.abs(this.start.x),
      Math.abs(this.start.y),
      Math.abs(this.start.z),
      Math.abs(this.end.x),
      Math.abs(this.end.y),
      Math.abs(this.end.z),
    );

    const entities = player.dimension.getEntities({
      location: center,
      maxDistance: hitboxMax,
    });

    const damaged = [];

    for (const entity of entities) {
      if (entity.id != player.id) {
        const localPos = utils.absoluteToLocalCoordinates(
          player,
          entity.location,
        );

        const isInside =
          localPos.x >= Math.min(this.start.x, this.end.x) &&
          localPos.x <= Math.max(this.start.x, this.end.x) &&
          localPos.y >= Math.min(this.start.y, this.end.y) &&
          localPos.y <= Math.max(this.start.y, this.end.y) &&
          localPos.z >= Math.min(this.start.z, this.end.z) &&
          localPos.z <= Math.max(this.start.z, this.end.z);

        if (!isInside) continue;

        entity.applyDamage(damage, {
          damagingEntity: player,
          cause: cause,
        });
        damaged.push(entity);
      }
    }

    return {
      damagedEntities: damaged,
      absoluteStart: absoluteStart,
      absoluteEnd: absoluteEnd,
      center: center,
    };
  }
}
