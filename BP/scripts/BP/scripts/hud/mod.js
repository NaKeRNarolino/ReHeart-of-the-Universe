import "./hud_displays";
import * as mc from "@minecraft/server";
mc.world.afterEvents.playerSpawn.subscribe((data) => {
    const player = data.player;
    if (data.initialSpawn) {
        player.runCommand("fog @s push naker_hotu:archae_fog naker_hotu:archae_fog");
    }
});
