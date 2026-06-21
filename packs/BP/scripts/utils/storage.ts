import * as mc from "@minecraft/server";
import * as ui from "@minecraft/server-ui";

export function SliceJSONAt32K(json: Object): {
  strings: string[];
  idx: number;
} {
  let str = JSON.stringify(json);
  let idx = Math.ceil(str.length / 32000);
  let strings = [];
  for (let i = 0; i < idx; i++) {
    strings.push(str.slice(i * 32000, (i + 1) * 32000));
  }

  return { strings, idx };
}

interface Storage {
  key: string;
  write(
    value: number | string | boolean | Object
  ): number | string | boolean | Object;
  access(): number | string | boolean | Object;
}

export class NumberStorage implements Storage {
  key: string;

  constructor(Key: string) {
    this.key = Key;
  }

  write(value: number): number {
    mc.world.setDynamicProperty(this.key, value);
    return mc.world.getDynamicProperty(this.key) as number;
  }

  access(): number {
    return mc.world.getDynamicProperty(this.key) as number;
  }
}

export class StringStorage implements Storage {
  key: string;

  constructor(Key: string) {
    this.key = Key;
  }

  write(value: string): string {
    mc.world.setDynamicProperty(this.key, value);
    return mc.world.getDynamicProperty(this.key) as string;
  }

  access(): string {
    return mc.world.getDynamicProperty(this.key) as string;
  }
}

export class BooleanStorage implements Storage {
  key: string;

  constructor(Key: string) {
    this.key = Key;
  }

  write(value: boolean): boolean {
    mc.world.setDynamicProperty(this.key, value);
    return mc.world.getDynamicProperty(this.key) as boolean;
  }

  access(): boolean {
    return mc.world.getDynamicProperty(this.key) as boolean;
  }
}

export class JSONStorage implements Storage {
  key: string;

  constructor(Key: string) {
    this.key = Key;
  }

  write(value: Object): Object {
    mc.world.setDynamicProperty(this.key, JSON.stringify(value));
    return value;
  }

  access(): Object {
    return JSON.parse(mc.world.getDynamicProperty(this.key) as string);
  }
}

export class MassiveJSONStorage implements Storage {
  key: string;

  constructor(Key: string) {
    this.key = Key;
  }

  write(value: Object): Object {
    const strso = SliceJSONAt32K(value);
    const strings = strso.strings;
    mc.world.setDynamicProperty(`${this.key}.idx`, strso.idx);
    for (let i = 0; i < strso.idx; i++) {
      mc.world.setDynamicProperty(`${this.key}:${i}`, strings[i]);
    }
    return value;
  }

  access(): Object {
    const idx = mc.world.getDynamicProperty(`${this.key}.idx`) as number;
    const strings = [];
    for (let i = 0; i < idx; i++) {
      strings.push(mc.world.getDynamicProperty(`${this.key}:${i}`) as string);
    }
    return JSON.parse(strings.join(""));
  }

  ifUnsetSetTo(value: Object): boolean {
    let checker = mc.world.getDynamicProperty(`${this.key}.idx`) == undefined;
    if (checker) {
      this.write(value);
    }
    return checker;
  }
}
