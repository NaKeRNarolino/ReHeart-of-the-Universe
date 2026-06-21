import * as mc from "@minecraft/server";
import { openConfig } from "../config/mod";
function configCommand(origin) {
    if (origin.sourceEntity?.typeId != "minecraft:player")
        return {
            status: mc.CustomCommandStatus.Failure,
        };
    mc.system.run(() => openConfig(origin.sourceEntity));
    return {
        status: mc.CustomCommandStatus.Success,
    };
}
export function register(registry) {
    registry.registerCommand({
        permissionLevel: mc.CommandPermissionLevel.Host,
        description: "HOTU Config",
        name: "naker_hotu:config",
    }, configCommand);
}
