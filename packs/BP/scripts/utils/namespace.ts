export namespace namespace {
  export const namespace = "naker_hotu";

  export function namespaced(value: string, customNamespace?: string): string {
    return `${customNamespace ?? namespace}:${value}`;
  }
}
