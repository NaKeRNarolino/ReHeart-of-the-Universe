import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "../../utils/namespace";
import { SkintCardData } from "./schema";
import { utils } from "../../utils/utils";

const dynamicPropertyId = namespace.namespaced("skint_card_data");

export function openSkintCardUI(player: mc.Player) {
  const form = ui.CustomForm.create(player, "SKINT CARD");
  const writable = { clientWritable: true };

  const data = {
    name: ui.Observable.create<string>("", writable),
    targetTypeIndex: ui.Observable.create<number>(0, writable),
    customEntity: ui.Observable.create<string>("minecraft:player", writable),
    customReach: ui.Observable.create<string>("5", writable),
    locTypeIndex: ui.Observable.create<number>(0, writable),
    locX: ui.Observable.create<string>("~", writable),
    locY: ui.Observable.create<string>("~", writable),
    locZ: ui.Observable.create<string>("~", writable),
    dimTypeIndex: ui.Observable.create<number>(0, writable),
    dimId: ui.Observable.create<string>("minecraft:overworld", writable),
    actionTypeIndex: ui.Observable.create<number>(0, writable),
    healAmount: ui.Observable.create<string>("5", writable),
    damageAmount: ui.Observable.create<string>("5", writable),
  };

  const WriteSection = new utils.DDUISection(
    form,
    (f, vis, self) => {
      f.textField("Spell Name", data.name, { visible: vis });

      f.dropdown(
        "Target Mode",
        data.targetTypeIndex,
        [
          { label: "Self", value: 0 },
          { label: "Custom Selector", value: 1 },
        ],
        { visible: vis },
      );

      const CustomTargetSection = new utils.DDUISection(
        f,
        (f2, vis2, self2) => {
          f2.textField("Entity Type", data.customEntity, { visible: vis2 });
          f2.textField("Reach Distance", data.customReach, { visible: vis2 });

          f2.dropdown(
            "Location Resolver",
            data.locTypeIndex,
            [
              { label: "Self", value: 0 },
              { label: "Fixed Vector", value: 1 },
            ],
            { visible: vis2 },
          );

          const VectorSection = new utils.DDUISection(
            f2,
            (f3, vis3, self3) => {
              f3.textField("X", data.locX, { visible: vis3 });
              f3.textField("Y", data.locY, { visible: vis3 });
              f3.textField("Z", data.locZ, { visible: vis3 });

              f3.dropdown(
                "Dimension Resolver",
                data.dimTypeIndex,
                [
                  { label: "Current", value: 0 },
                  { label: "Specific ID", value: 1 },
                ],
                { visible: vis3 },
              );

              const DimIdSection = new utils.DDUISection(
                f3,
                (f4, vis4) => {
                  f4.textField("Dimension ID", data.dimId, { visible: vis4 });
                },
                false,
                self3,
              );

              data.dimTypeIndex.subscribe((v) => DimIdSection.visible(v === 1));
            },
            false,
            self2,
          );

          data.locTypeIndex.subscribe((v) => VectorSection.visible(v === 1));
        },
        false,
        self,
      );

      data.targetTypeIndex.subscribe((v) =>
        CustomTargetSection.visible(v === 1),
      );

      f.dropdown(
        "Action Type",
        data.actionTypeIndex,
        [
          { label: "Heal", value: 0 },
          { label: "Damage", value: 1 },
        ],
        { visible: vis },
      );

      const HealActionSection = new utils.DDUISection(
        f,
        (f2, vis2) => {
          f2.textField("Heal Amount", data.healAmount, { visible: vis2 });
        },
        true,
        self,
      );

      const DamageActionSection = new utils.DDUISection(
        f,
        (f2, vis2) => {
          f2.textField("Damage Amount", data.damageAmount, { visible: vis2 });
        },
        false,
        self,
      );

      data.actionTypeIndex.subscribe((v) => {
        HealActionSection.visible(v === 0);
        DamageActionSection.visible(v === 1);
      });

      f.button(
        "Save to Card",
        () => {
          const isHeal = data.actionTypeIndex.getData() === 0;
          const spellData: SkintCardData = {
            name: data.name.getData(),
            data: {
              type: "inplace",
              target:
                data.targetTypeIndex.getData() === 0
                  ? "self"
                  : {
                      entityType: data.customEntity.getData(),
                      reach: parseFloat(data.customReach.getData()) || 5,
                      readFrom: {
                        location:
                          data.locTypeIndex.getData() === 0
                            ? "self"
                            : {
                                x:
                                  parseFloat(
                                    data.locX
                                      .getData()
                                      .replace(
                                        "~",
                                        player.location.x.toString(),
                                      ),
                                  ) || 0,
                                y:
                                  parseFloat(
                                    data.locY
                                      .getData()
                                      .replace(
                                        "~",
                                        player.location.y.toString(),
                                      ),
                                  ) || 0,
                                z:
                                  parseFloat(
                                    data.locZ
                                      .getData()
                                      .replace(
                                        "~",
                                        player.location.z.toString(),
                                      ),
                                  ) || 0,
                              },
                        dimension:
                          data.dimTypeIndex.getData() === 0
                            ? "self"
                            : data.dimId.getData(),
                      },
                    },
              action: isHeal
                ? {
                    type: "heal",
                    amount: parseFloat(data.healAmount.getData()) || 0,
                  }
                : {
                    type: "damage",
                    amount: parseFloat(data.damageAmount.getData()) || 0,
                  },
            },
          };

          const stack = player
            .getComponent("equippable")
            ?.getEquipment(mc.EquipmentSlot.Mainhand);
          if (stack) {
            stack.nameTag = data.name.getData();
            stack.setDynamicProperty(
              dynamicPropertyId,
              JSON.stringify(spellData),
            );
            player
              .getComponent("equippable")
              ?.setEquipment(mc.EquipmentSlot.Mainhand, stack);
            player.sendMessage(`§aSpell "${spellData.name}" saved!`);
          }
        },
        { visible: vis },
      );
    },
    false,
  );

  const HomeSection = new utils.DDUISection(
    form,
    (f, vis) => {
      f.button(
        "Write New Spell",
        () => {
          HomeSection.visible(false);
          WriteSection.visible(true);
        },
        { visible: vis },
      );
    },
    true,
  );

  form.show();
}
