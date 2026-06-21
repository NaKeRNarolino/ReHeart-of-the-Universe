import { Vector3Utils } from "@minecraft/math";
import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "./namespace";

export namespace utils {
  export interface DimensionLocation {
    dimension: mc.Dimension;
    location: mc.Vector3;
  }

  /**
   * @description Calculates points along two vectors.
   * @param locationA first vector
   * @param locationB second vector
   * @param numberOfPoints amount of points to calculate
   * @returns the points along two vectors
   */
  export function calculatePointsAlongLine(
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

  /**
   * @description Replicates the /clear command using native APIs.
   * @param player Player to uss the function on
   * @param typeId The typeId of item to remove
   * @param amount The amount of item to remove
   */
  export function clearFromPlayerInventory(
    player: mc.Player,
    typeId: string,
    amount: number,
  ) {
    let playerInventory = (
      player.getComponent("inventory") as mc.EntityInventoryComponent
    ).container!;
    let amountToDelete = amount;
    for (let i = 0; i < 36; i++) {
      if (amountToDelete > 0) {
        let item = playerInventory.getItem(i);
        if (item != undefined) {
          if (item.typeId == typeId) {
            if (item.amount < amountToDelete) {
              amountToDelete -= item.amount;
              playerInventory.setItem(i, undefined);
            } else {
              let it =
                item.amount - amountToDelete > 0
                  ? new mc.ItemStack(typeId, item.amount - amountToDelete)
                  : undefined;
              playerInventory.setItem(i, it);
              amountToDelete -= item.amount;
            }
          }
        }
      }
    }
  }

  export function calculateLocalCoordinates(
    player: mc.Entity,
    vec3: mc.Vector3,
  ) {
    let ploc = player.getHeadLocation();
    let zVec = player.getViewDirection();
    let xVec = Vector3Utils.normalize({ x: zVec.z, y: 0, z: -zVec.x });
    let yVec = Vector3Utils.normalize(Vector3Utils.cross(zVec, xVec));
    let location = Vector3Utils.add(
      Vector3Utils.scale(xVec, vec3.x),
      Vector3Utils.add(
        Vector3Utils.scale(yVec, vec3.y),
        Vector3Utils.scale(zVec, vec3.z),
      ),
    );
    return Vector3Utils.add(ploc, location);
  }

  export function calculateLocalCoordinatesXZ(
    player: mc.Entity,
    vec3: mc.Vector3,
  ): mc.Vector3 {
    let ploc = player.getHeadLocation();
    // let vector3 = Vec3(vec3.x, vec3.y, vec3.z);
    let zVec = player.getViewDirection();
    zVec.y = 0;
    let xVec = Vector3Utils.normalize({ x: zVec.z, y: 0, z: -zVec.x });
    let yVec = Vector3Utils.normalize(Vector3Utils.cross(zVec, xVec));
    let location = Vector3Utils.add(
      Vector3Utils.scale(xVec, vec3.x),
      Vector3Utils.add(
        Vector3Utils.scale(yVec, vec3.y),
        Vector3Utils.scale(zVec, vec3.z),
      ),
    );

    return Vector3Utils.add(ploc, location);
  }

  export function absoluteToLocalCoordinates(
    player: mc.Entity,
    worldLocation: mc.Vector3,
  ) {
    const ploc = player.getHeadLocation();

    const relativePos = Vector3Utils.subtract(worldLocation, ploc);

    const zVec = player.getViewDirection();
    const xVec = Vector3Utils.normalize({ x: zVec.z, y: 0, z: -zVec.x });
    const yVec = Vector3Utils.normalize(Vector3Utils.cross(zVec, xVec));

    return {
      x: Vector3Utils.dot(relativePos, xVec),
      y: Vector3Utils.dot(relativePos, yVec),
      z: Vector3Utils.dot(relativePos, zVec),
    };
  }

  export class WorldDynamicProperty<T> {
    key: string;
    defNamespace: string;
    default: T;

    constructor(key: string, def: T, ns: string = namespace.namespace) {
      this.key = key;
      this.default = def;
      this.defNamespace = ns;
    }

    get(): T {
      return (
        (mc.world.getDynamicProperty(
          namespace.namespaced(this.key, this.defNamespace),
        ) as T) ?? this.default
      );
    }

    set(value: T) {
      mc.world.setDynamicProperty(
        namespace.namespaced(this.key, this.defNamespace),
        value as string | mc.Vector3 | boolean | number,
      );
    }
  }

  export class DependentObservable<
    T extends string | number | boolean | ui.UIRawMessage,
  > {
    private execute: (observable: ui.Observable<T>) => T;
    observable: ui.Observable<T>;
    constructor(
      executes: (observable: ui.Observable<T>) => T,
      defaultValue: T,
      dependsOn: ui.Observable<any>[],
    ) {
      this.execute = executes;
      this.observable = ui.Observable.create(defaultValue);

      for (const d of dependsOn) {
        d.subscribe((_) => {
          this.observable.setData(this.execute(this.observable));
        });
      }
    }
  }

  export class DDUISection {
    form: ui.CustomForm;
    obs: ui.Observable<boolean>;
    visibilityObs: ui.Observable<boolean>;
    parent?: DDUISection;

    visible(value: boolean) {
      this.obs.setData(value);
    }

    constructor(
      customForm: ui.CustomForm,
      builder: (
        form: ui.CustomForm,
        visibility: ui.Observable<boolean>,
        parent: DDUISection,
      ) => void,
      shown: boolean,
      par?: DDUISection,
    ) {
      this.obs = ui.Observable.create(shown);
      this.parent = par;
      this.visibilityObs =
        par == undefined
          ? this.obs
          : new DependentObservable<boolean>(
              () => this.obs.getData() && this.parent!.visibilityObs.getData(),
              shown && this.parent!.visibilityObs.getData(),
              [this.obs, this.parent!.visibilityObs],
            ).observable;

      builder(customForm, this.visibilityObs, this);
      this.form = customForm;
    }
  }
}
