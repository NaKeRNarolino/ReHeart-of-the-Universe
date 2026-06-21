import "./hud_displays";

import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

mc.world.afterEvents.playerSpawn.subscribe((data) => {
  const player = data.player;
  if (data.initialSpawn) {
    player.runCommand(
      "fog @s push naker_hotu:archae_fog naker_hotu:archae_fog"
    );
  }
});
