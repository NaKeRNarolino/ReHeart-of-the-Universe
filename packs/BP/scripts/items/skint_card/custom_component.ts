import * as mc from "@minecraft/server";
import { openSkintCardUI } from "./ui";
import { utils } from "../../utils/utils";

export function getSkintFocusOrbLocation(player: mc.Player) {
  const localLocation = utils.calculateLocalCoordinatesXZ(player, {
    x: -0.3,
    y: 2.0,
    z: 1.5,
  });

  return localLocation;
}

export function getSkintFocusColor(player: mc.Player): {
  mvm: mc.MolangVariableMap;
  color?: mc.RGB;
} {
  const offhand = player
    .getComponent("equippable")
    ?.getEquipment(mc.EquipmentSlot.Offhand);

  offhand?.amount;

  const color = offhand!.getComponent("dyeable")?.color;

  const mvm = new mc.MolangVariableMap();

  if (color != undefined) {
    mvm.setFloat("color_red", color.red);
    mvm.setFloat("color_green", color.green);
    mvm.setFloat("color_blue", color.blue);
  }

  return { color: color, mvm: mvm };
}

export const SkintCardCustomComponent: mc.ItemCustomComponent = {
  onUse: (event) => {
    openSkintCardUI(event.source);
  },
};
