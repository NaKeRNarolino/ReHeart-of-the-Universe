import * as mc from "@minecraft/server";
import { SparkManager } from "../sparks/spark_manager";
import { StaminaManager } from "../stamina/manager";
mc.system.runInterval(() => {
    for (const player of mc.world.getAllPlayers()) {
        const health = player.getComponent("health");
        const healthPercentage = Math.floor((health.currentValue / health.effectiveMax) * 100);
        const stamina = StaminaManager.of(player);
        const staminaPercentage = Math.floor((stamina.get() / stamina.getMax()) * 100);
        player.onScreenDisplay.setTitle(`s:${new SparkManager(player).get()},${healthPercentage},${staminaPercentage}`);
    }
});
