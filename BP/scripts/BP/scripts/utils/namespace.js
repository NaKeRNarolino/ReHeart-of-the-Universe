export var namespace;
(function (namespace_1) {
    namespace_1.namespace = "naker_hotu";
    function namespaced(value, customNamespace) {
        return `${customNamespace ?? namespace_1.namespace}:${value}`;
    }
    namespace_1.namespaced = namespaced;
})(namespace || (namespace = {}));
