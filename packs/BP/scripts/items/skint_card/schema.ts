import * as mc from "@minecraft/server";

export type SkintCardData = {
  name: string;
  data: SkintCardSpellData;
};

export type SkintCardSpellData =
  | SkintCardSpellInplaceData
  | SkintCardProjectileData;

export type SkintCardProjectileData = {
  type: "projectile";
  target: SpellTarget;
  projectileSettings: SpellProjectileSettings;
  action: SpellAction;
};

export type SpellProjectileSettings = {
  phasing: boolean;
  homing: number;
};

export type SkintCardSpellInplaceData = {
  type: "inplace";
  target: SpellTarget;
  action: SpellAction;
};

export type SpellTarget = "self" | CustomSpellSelectorTarget;
export type SpellExecutionLocation = {
  location: "self" | "projectile" | mc.Vector3;
  dimension: "self" | string;
};

export type CustomSpellSelectorTarget = {
  entityType: string;
  readFrom: SpellExecutionLocation;
  reach: number;
};

export type SpellAction = SpellHealAction | SpellDamageAction;

export type SpellHealAction = {
  type: "heal";
  amount: number;
};

export type SpellDamageAction = {
  type: "damage";
  amount: number;
};

const selfHeal: SkintCardData = {
  name: "Self Heal",
  data: {
    type: "inplace",
    action: {
      type: "heal",
      amount: 5,
    },
    target: "self",
  },
};

const damagingProjectile: SkintCardData = {
  name: "Projectile",
  data: {
    type: "projectile",
    projectileSettings: {
      phasing: true,
      homing: 0.1,
    },
    target: {
      entityType: "*",
      reach: 2,
      readFrom: {
        location: "projectile",
        dimension: "self",
      },
    },
    action: {
      type: "damage",
      amount: 10,
    },
  },
};
