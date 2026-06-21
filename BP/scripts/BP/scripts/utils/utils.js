import { Vector3Utils } from "@minecraft/math";
import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";
import { namespace } from "./namespace";
export var utils;
(function (utils) {
    /**
     * @description Calculates points along two vectors.
     * @param locationA first vector
     * @param locationB second vector
     * @param numberOfPoints amount of points to calculate
     * @returns the points along two vectors
     */
    function calculatePointsAlongLine(locationA, locationB, numberOfPoints) {
        const points = [];
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
    utils.calculatePointsAlongLine = calculatePointsAlongLine;
    /**
     * @description Replicates the /clear command using native APIs.
     * @param player Player to uss the function on
     * @param typeId The typeId of item to remove
     * @param amount The amount of item to remove
     */
    function clearFromPlayerInventory(player, typeId, amount) {
        let playerInventory = player.getComponent("inventory").container;
        let amountToDelete = amount;
        for (let i = 0; i < 36; i++) {
            if (amountToDelete > 0) {
                let item = playerInventory.getItem(i);
                if (item != undefined) {
                    if (item.typeId == typeId) {
                        if (item.amount < amountToDelete) {
                            amountToDelete -= item.amount;
                            playerInventory.setItem(i, undefined);
                        }
                        else {
                            let it = item.amount - amountToDelete > 0
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
    utils.clearFromPlayerInventory = clearFromPlayerInventory;
    function calculateLocalCoordinates(player, vec3) {
        let ploc = player.getHeadLocation();
        let zVec = player.getViewDirection();
        let xVec = Vector3Utils.normalize({ x: zVec.z, y: 0, z: -zVec.x });
        let yVec = Vector3Utils.normalize(Vector3Utils.cross(zVec, xVec));
        let location = Vector3Utils.add(Vector3Utils.scale(xVec, vec3.x), Vector3Utils.add(Vector3Utils.scale(yVec, vec3.y), Vector3Utils.scale(zVec, vec3.z)));
        return Vector3Utils.add(ploc, location);
    }
    utils.calculateLocalCoordinates = calculateLocalCoordinates;
    function calculateLocalCoordinatesXZ(player, vec3) {
        let ploc = player.getHeadLocation();
        // let vector3 = Vec3(vec3.x, vec3.y, vec3.z);
        let zVec = player.getViewDirection();
        zVec.y = 0;
        let xVec = Vector3Utils.normalize({ x: zVec.z, y: 0, z: -zVec.x });
        let yVec = Vector3Utils.normalize(Vector3Utils.cross(zVec, xVec));
        let location = Vector3Utils.add(Vector3Utils.scale(xVec, vec3.x), Vector3Utils.add(Vector3Utils.scale(yVec, vec3.y), Vector3Utils.scale(zVec, vec3.z)));
        return Vector3Utils.add(ploc, location);
    }
    utils.calculateLocalCoordinatesXZ = calculateLocalCoordinatesXZ;
    function absoluteToLocalCoordinates(player, worldLocation) {
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
    utils.absoluteToLocalCoordinates = absoluteToLocalCoordinates;
    class WorldDynamicProperty {
        constructor(key, def, ns = namespace.namespace) {
            this.key = key;
            this.default = def;
            this.defNamespace = ns;
        }
        get() {
            return (mc.world.getDynamicProperty(namespace.namespaced(this.key, this.defNamespace)) ?? this.default);
        }
        set(value) {
            mc.world.setDynamicProperty(namespace.namespaced(this.key, this.defNamespace), value);
        }
    }
    utils.WorldDynamicProperty = WorldDynamicProperty;
    class DependentObservable {
        constructor(executes, defaultValue, dependsOn) {
            this.execute = executes;
            this.observable = ui.Observable.create(defaultValue);
            for (const d of dependsOn) {
                d.subscribe((_) => {
                    this.observable.setData(this.execute(this.observable));
                });
            }
        }
    }
    utils.DependentObservable = DependentObservable;
    class DDUISection {
        visible(value) {
            this.obs.setData(value);
        }
        constructor(customForm, builder, shown, par) {
            this.obs = ui.Observable.create(shown);
            this.parent = par;
            this.visibilityObs =
                par == undefined
                    ? this.obs
                    : new DependentObservable(() => this.obs.getData() && this.parent.visibilityObs.getData(), shown && this.parent.visibilityObs.getData(), [this.obs, this.parent.visibilityObs]).observable;
            builder(customForm, this.visibilityObs, this);
            this.form = customForm;
        }
    }
    utils.DDUISection = DDUISection;
})(utils || (utils = {}));
