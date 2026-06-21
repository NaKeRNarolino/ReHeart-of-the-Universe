const selfHeal = {
    name: "Self Heal",
    data: {
        type: "inplace",
        action: {
            type: "heal",
            amount: 5,
        },
        target: "self",
    },
};
const damagingProjectile = {
    name: "Projectile",
    data: {
        type: "projectile",
        projectileSettings: {
            phasing: true,
            homing: 0.1,
        },
        target: {
            entityType: "*",
            reach: 2,
            readFrom: {
                location: "projectile",
                dimension: "self",
            },
        },
        action: {
            type: "damage",
            amount: 10,
        },
    },
};
export {};
