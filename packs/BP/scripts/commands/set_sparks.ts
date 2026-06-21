import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "../utils/namespace";
import { SparkManager } from "../sparks/spark_manager";

mc.world.beforeEvents.chatSend.subscribe((data) => {
  if (data.message.startsWith("@setsparks")) {
    data.cancel = true;

    if (data.sender.playerPermissionLevel != mc.PlayerPermissionLevel.Operator) {
      data.sender.sendMessage(
        "[!] Использовать команду @setsparks могут только операторы."
      );
      return;
    }

    const args = data.message.split(" ");
    const name = args[1];
    const amount = parseInt(args[2]);

    mc.system.run(() => {
      const player = mc.world.getPlayers({
        name: name,
      });

      player[0]?.setDynamicProperty(SparkManager.dynamicPropertyId, amount);
    });
  }
});

function sparksCommand(
  origin: mc.CustomCommandOrigin,
  players: mc.Player[],
  action: string,
  amount?: number
): mc.CustomCommandResult {
  if (action == "set") {
    if (amount == undefined) {
      return {
        status: mc.CustomCommandStatus.Failure,
        message: "Для под-комманды `set` обязателен параметр `amount`.",
      };
    }

    if (amount < 0) {
      return {
        status: mc.CustomCommandStatus.Failure,
        message: "Количество спарков должно быть больше или равно нулю.",
      };
    }

    const playerNames = players.map((v) => v.name);

    for (const player of players) {
      const manager = new SparkManager(player);

      manager.set(amount);
    }

    return {
      status: mc.CustomCommandStatus.Success,
      message: `Успешно установлено количество спарков ${amount} для игроков: ${playerNames.join(
        ", "
      )}`,
    };
  } else {
    if (amount != undefined) {
      return {
        status: mc.CustomCommandStatus.Failure,
        message: "Для под-комманды `get` не требуется параметр `amount`.",
      };
    }

    let amounts: string[] = [""];

    for (const player of players) {
      const manager = new SparkManager(player);

      const v = manager.get();

      amounts.push(`${player.name}: ${v}, `);
    }

    return {
      status: mc.CustomCommandStatus.Success,
      message: `Успешно получены данные о количестве для игроков: ${amounts.join(
        ", "
      )}`,
    };
  }
}

export function register(registry: mc.CustomCommandRegistry) {
  registry.registerEnum(namespace.namespaced("spark_action"), ["get", "set"]);

  registry.registerCommand(
    {
      name: namespace.namespaced("sparks"),
      permissionLevel: mc.CommandPermissionLevel.GameDirectors,
      description:
        "Управление количеством спарков у игрока. Для операции `set` параметр `amount` обязателен.",
      mandatoryParameters: [
        {
          type: mc.CustomCommandParamType.PlayerSelector,
          name: "player",
        },
        {
          type: mc.CustomCommandParamType.Enum,
          name: namespace.namespaced("spark_action"),
        },
      ],
      optionalParameters: [
        {
          name: "amount",
          type: mc.CustomCommandParamType.Integer,
        },
      ],
    },
    sparksCommand
  );
}
