import * as mc from "@minecraft/server";
import {
  getSkintFocusColor,
  getSkintFocusOrbLocation,
} from "../skint_card/custom_component";
import { namespace } from "../../utils/namespace";
import {
  CustomSpellSelectorTarget,
  SkintCardData,
  SpellExecutionLocation,
} from "../skint_card/schema";
import { Vector3Utils } from "@minecraft/math";

export const SkintFocusCustomComponent: mc.ItemCustomComponent = {
  onUse: (data) => {
    const player = data.source;
    const equip = player.getComponent("equippable")!;

    const offhand = equip.getEquipment(mc.EquipmentSlot.Offhand);

    if (offhand?.typeId != "naker_hotu:skint_card") {
      return;
    }
    const orb = getSkintFocusOrbLocation(player);

    const mvm = getSkintFocusColor(player).mvm;

    player.dimension.spawnParticle(
      namespace.namespaced("skint_focus_execute_orb"),
      orb,
      mvm,
    );

    tryExecuteSpell(offhand!, player);
  },
};

function tryExecuteSpell(card: mc.ItemStack, player: mc.Player) {
  const rawSpell = card.getDynamicProperty(
    namespace.namespaced("skint_card_data"),
  );

  if (rawSpell == undefined) return;

  try {
    const spell = JSON.parse(rawSpell as string) as SkintCardData;

    const targets = getSpellTargets(player, spell);
    const action = spell.data.action;
    const color = getSkintFocusColor(player);

    for (const t of targets) {
      player.dimension.spawnParticle(
        namespace.namespaced("skint_focus_target_orb"),
        Vector3Utils.add(t.location, { x: 0, y: 1, z: 0 }),
        color.mvm,
      );
    }

    if (action.type === "damage") {
      for (const t of targets) {
        t.applyDamage(action.amount, {
          damagingEntity: player,
          cause: mc.EntityDamageCause.magic,
        });
      }
    } else {
      for (const t of targets) {
        const health = t.getComponent("health")!;
        const value = Math.min(
          health.currentValue + action.amount,
          health.effectiveMax,
        );
        health.setCurrentValue(value);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function getSpellTargets(player: mc.Player, spell: SkintCardData): mc.Entity[] {
  if (spell.data.target === "self") {
    return [player];
  } else {
    const entityType = spell.data.target.entityType;
    const reach = spell.data.target.reach;
    const { dimension, x, y, z } = resolveLocation(
      player,
      spell.data.target.readFrom,
    );
    console.warn(x, y, z);

    const entities = dimension.getEntities({
      location: { x, y, z },
      type: entityType.includes("*") ? undefined : entityType,
      maxDistance: reach,
      minDistance: 0,
    });

    return entities.filter((e) => e.id != player.id);
  }

  return [];
}

function resolveLocation(
  player: mc.Player,
  location: SpellExecutionLocation,
): mc.DimensionLocation {
  let loc = { x: 0, y: 0, z: 0 };
  console.log(JSON.stringify(location));

  if (location.location === "self") {
    loc = player.location;
  } else if (location.location === "projectile") {
    //
  } else {
    loc.x = location.location.x;
    loc.y = location.location.y;
    loc.z = location.location.z;
  }

  let dim = player.dimension;

  if (location.dimension === "self") {
  } else {
    dim = mc.world.getDimension(location.dimension);
  }

  return {
    dimension: dim,
    x: loc.x,
    y: loc.y,
    z: loc.z,
  };
}
