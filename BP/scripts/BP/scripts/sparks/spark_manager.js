import { namespace } from "../utils/namespace";
export class SparkManager {
    constructor(player) {
        this.player = player;
    }
    setup() {
        this.set(0);
    }
    get() {
        const amount = this.player.getDynamicProperty(SparkManager.dynamicPropertyId);
        if (amount == undefined) {
            this.setup();
            return 0;
        }
        else {
            return amount;
        }
    }
    set(value) {
        this.player.setDynamicProperty(SparkManager.dynamicPropertyId, value);
    }
    increase(value = 1) {
        this.player.setDynamicProperty(SparkManager.dynamicPropertyId, value + this.get());
    }
}
SparkManager.dynamicPropertyId = namespace.namespaced("sparks_amount");
