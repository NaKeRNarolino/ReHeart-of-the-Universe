import * as mc from "@minecraft/server";
import { utils } from "../../utils/utils";

function blockType(dy: number): string {
  if (dy < 1) {
    if (Math.random() < 0.15) {
      return "minecraft:moss_block";
    } else {
      return "minecraft:grass_block";
    }
  }
  if (dy >= 1 && dy < 5) {
    if (Math.random() <= 0.15) {
      return "minecraft:stone";
    } else if (Math.random() <= 0.5) {
      return "minecraft:cobblestone";
    } else {
      return "minecraft:dirt";
    }
  }
  if (dy >= 5) {
    return "minecraft:stone";
  }

  return "minecraft:glass";
}

export function generateIsland(location: utils.DimensionLocation) {
  const maxBlocks = 500;

  const queue = [location.dimension.getBlock(location.location)];
  let blocks = 0;

  const startY = Math.floor(location.location.y);

  const vis: Set<string> = new Set();

  const serialize = (loc: mc.Vector3) => {
    return `${loc.x}:${loc.y}:${loc.z}`;
  };

  const serialize2 = (loc: mc.VectorXZ) => {
    return `${loc.x}:${loc.z}`;
  };

  const anythingOn: Set<String>[] = [];

  while (queue.length != 0 && blocks <= maxBlocks) {
    const block = queue.shift()!;

    if (vis.has(serialize(block.location))) continue;

    vis.add(serialize(block.location));

    const dy = startY - block.y;

    if (anythingOn[dy] == undefined) anythingOn[dy] = new Set();

    if (dy != 0) {
      if (
        !anythingOn[dy - 1].has(
          serialize2({ x: block.location.x, z: block.location.z }),
        )
      )
        continue;
    }

    anythingOn[dy].add(
      serialize2({ x: block.location.x, z: block.location.z }),
    );

    const ty = blockType(dy);

    location.dimension.setBlockType(block.location, ty);

    for (const side of [
      block.south(),
      block.north(),
      block.east(),
      block.west(),
    ]) {
      if (Math.random() <= Math.min(0.8, 1 - dy / 20)) queue.push(side);
    }

    if (Math.random() <= 0.9) queue.push(block.below());

    blocks++;
  }
}
