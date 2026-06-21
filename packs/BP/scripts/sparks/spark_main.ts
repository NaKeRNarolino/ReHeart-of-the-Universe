import { Vector3Utils } from "@minecraft/math";
import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "../utils/namespace";

/**
 * @description Calculates points along two vectors.
 * @param locationA first vector
 * @param locationB second vector
 * @param numberOfPoints amount of points to calculate
 * @returns the points along two vectors
 */
function calculatePointsAlongLine(
  locationA: mc.Vector3,
  locationB: mc.Vector3,
  numberOfPoints: number,
): mc.Vector3[] {
  const points: mc.Vector3[] = [];
  for (let i = 0; i <= numberOfPoints; i++) {
    const t = i / numberOfPoints;
    const point = {
      x: locationA.x + (locationB.x - locationA.x) * t,
      y: locationA.y + (locationB.y - locationA.y) * t,
      z: locationA.z + (locationB.z - locationA.z) * t,
    };
    points.push(point);
  }
  return points;
}

// function Vector3(this: any, x: number, y: number, z: number): any {
//   this.x = x;
//   this.y = y;
//   this.z = z;
// }

// function generateCurve(vectors, numPoints) {
//   let curve = [];
//   for (let i = 0; i < vectors.length - 1; i++) {
//     for (let j = 0; j < numPoints; j++) {
//       let t = j / numPoints;
//       let t2 = t * t;
//       let t3 = t2 * t;
//       let v0 = vectors[i - 1] || vectors[i];
//       let v1 = vectors[i];
//       let v2 = vectors[i + 1] || vectors[i];
//       let v3 = vectors[i + 2] || vectors[i + 1] || vectors[i];
//       let x =
//         0.5 *
//         (2 * v1.x +
//           (-v0.x + v2.x) * t +
//           (2 * v0.x - 5 * v1.x + 4 * v2.x - v3.x) * t2 +
//           (-v0.x + 3 * v1.x - 3 * v2.x + v3.x) * t3);
//       let y =
//         0.5 *
//         (2 * v1.y +
//           (-v0.y + v2.y) * t +
//           (2 * v0.y - 5 * v1.y + 4 * v2.y - v3.y) * t2 +
//           (-v0.y + 3 * v1.y - 3 * v2.y + v3.y) * t3);
//       let z =
//         0.5 *
//         (2 * v1.z +
//           (-v0.z + v2.z) * t +
//           (2 * v0.z - 5 * v1.z + 4 * v2.z - v3.z) * t2 +
//           (-v0.z + 3 * v1.z - 3 * v2.z + v3.z) * t3);
//       curve.push(new Vector3(x, y, z));
//     }
//   }
//   return curve;
// }

export function summonSparks(
  dimension: mc.Dimension,
  location: mc.Vector3,
  amount: number,
  radius: number,
  onGrabSingle: (value: number, player: mc.Player) => void,
  valueFromOne: number = 1,
) {
  const count = amount / valueFromOne;
  const summonLocation = Vector3Utils.add(location, { x: 0, y: 1.5, z: 0 });
  const sparks: mc.Entity[] = [];
  for (let i = 0; i < count; i++) {
    const rnd = () => {
      return Math.random() * (radius / 10) * (Math.random() >= 0.5 ? 1 : -1);
    };
    const offsetX = rnd();
    const offsetZ = rnd();
    const offsetY = Math.random();

    const spark = dimension.spawnEntity<string>(
      namespace.namespaced("spark"),
      summonLocation,
    );
    spark.applyImpulse({ x: offsetX, y: offsetY / 5, z: offsetZ });
    sparks.push(spark);
  }

  mc.system.runTimeout(() => {
    // console.warn("all fell, starting to collect");
    let collectedAmount = 0;
    const run = mc.system.runInterval(() => {
      for (const spark of sparks) {
        if (!spark.isValid) continue;
        const player = spark.dimension.getPlayers({
          closest: 1,
          location: spark.location,
          minDistance: 0,
          maxDistance: 5,
        })[0];
        if (!player) continue;
        const targetLocation = Vector3Utils.add(player.location, {
          x: 0,
          y: 1.15,
          z: 0,
        });

        const points = calculatePointsAlongLine(
          spark.location,
          targetLocation,
          Vector3Utils.distance(spark.location, targetLocation) * 10,
        );
        // const points = generateCurve(
        //   [
        //     spark.location,
        //     {
        //       x: spark.location.x,
        //       y: targetLocation.y,
        //       z: spark.location.z,
        //     },
        //     targetLocation,
        //   ],
        //   Vector3Utils.distance(spark.location, targetLocation) * 10
        // );
        for (let i = 0; i < points.length; i++) {
          const point = points[i];
          mc.system.runTimeout(() => {
            if (!spark.isValid) return;
            spark.teleport(point);
            if (
              Vector3Utils.distance(
                Vector3Utils.add(player.location, {
                  x: 0,
                  y: 1.15,
                  z: 0,
                }),
                spark.location,
              ) < 0.05
            ) {
              collectedAmount++;
              spark.remove();
              onGrabSingle(valueFromOne, player);
              return;
            }
          }, i / 6);
        }
      }
      // console.warn(collectedAmount);
      if (collectedAmount >= count) {
        // console.warn("all done");
        mc.system.clearRun(run);
      }
    }, 5);
  }, 7);
}

mc.system.afterEvents.scriptEventReceive.subscribe((data) => {
  if (data.id == "spark:spark") {
    summonSparks(
      data.sourceEntity!.dimension,
      data.sourceEntity!.location,
      100,
      3,
      (v) => {
        // console.warn("Grabbed", v);
      },
    );
  }
});
