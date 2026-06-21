import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { StaminaManager } from "./manager";
import { MinecraftEffectTypes } from "@minecraft/vanilla-data";

mc.world.afterEvents.playerSpawn.subscribe((data) => {
  const { player } = data;

  StaminaManager.of(player).default();
});

mc.world.afterEvents.worldLoad.subscribe(() => {
  mc.system.runInterval(staminaMainLoop);
});

function staminaMainLoop() {
  const players = mc.world.getAllPlayers();

  for (const player of players) {
    if (player.getGameMode() == mc.GameMode.Survival) {
      handleRunning(player);
      handleJumping(player);
      genericAttributes(player);
    }
    tryIncrease(player);
  }
}

function tryIncrease(player: mc.Player) {
  const manager = StaminaManager.of(player);

  if (!manager.canIncrease()) return;

  manager.increase(1);
}

function genericAttributes(player: mc.Player) {
  const manager = StaminaManager.of(player);

  if (manager.get() > 0) return;

  player.addEffect(MinecraftEffectTypes.Slowness, 5, {
    amplifier: 1,
    showParticles: false,
  });
  player.addEffect(MinecraftEffectTypes.Weakness, 5, {
    amplifier: 250,
    showParticles: false,
  });
}

function handleJumping(player: mc.Player) {
  if (!player.isJumping) return;

  const manager = StaminaManager.of(player);

  manager.decrease(1);

  manager.setTimeToIncrease(3000);
}

function handleRunning(player: mc.Player) {
  if (!player.isSprinting) return;

  const manager = StaminaManager.of(player);

  manager.decrease(1);

  manager.setTimeToIncrease(3000);
}

mc.world.beforeEvents.playerBreakBlock.subscribe((data) => {
  const { player } = data;

  const manager = StaminaManager.of(player);

  if (manager.get() > 0) {
    manager.decrease(2);

    manager.setTimeToIncrease(3000);
  } else {
    data.cancel = true;
  }
});

mc.world.afterEvents.entityHitEntity.subscribe((data) => {
  const { damagingEntity } = data;

  if (damagingEntity.typeId == "minecraft:player") {
    const manager = StaminaManager.of(damagingEntity as mc.Player);

    manager.decrease(1);

    manager.setTimeToIncrease(3000);
  }
});
