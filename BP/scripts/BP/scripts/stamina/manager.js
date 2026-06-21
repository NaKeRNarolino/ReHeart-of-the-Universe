import { namespace } from "../utils/namespace";
export class StaminaManager {
    constructor(player) {
        this.player = player;
    }
    static of(player) {
        return new StaminaManager(player);
    }
    increase(amount) {
        this.set(this.get() + amount);
        this.clamp();
    }
    clamp() {
        if (this.get() > this.getMax()) {
            this.set(this.getMax());
        }
        else if (this.get() < 0) {
            this.set(0);
        }
    }
    decrease(amount) {
        this.increase(-amount);
        this.clamp();
    }
    get() {
        return (this.player.getDynamicProperty(StaminaManager.propertyId) ?? 0);
    }
    getMax() {
        return (this.player.getDynamicProperty(StaminaManager.maxPropertyId) ?? 256);
    }
    set(amount) {
        this.player.setDynamicProperty(StaminaManager.propertyId, amount);
    }
    default() {
        this.player.setDynamicProperties({
            [StaminaManager.maxPropertyId]: 256,
            [StaminaManager.propertyId]: 256,
        });
    }
    canIncrease() {
        return ((this.player.getDynamicProperty(StaminaManager.canIncreasePropertyId) ?? 0) < Date.now());
    }
    setTimeToIncrease(amount) {
        this.player.setDynamicProperty(StaminaManager.canIncreasePropertyId, Date.now() + amount);
    }
}
StaminaManager.propertyId = namespace.namespaced("stamina");
StaminaManager.maxPropertyId = namespace.namespaced("max_stamina");
StaminaManager.canIncreasePropertyId = namespace.namespaced("stamina_can_increase");
