import 'reflect-metadata';

import { ConstantValue } from '..';
import { Constructor, promisedWorld, ValueType } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

function constantClass<TValue>(valueType: ValueType, value: TValue) {
  return function <T extends Constructor<{}>>(constructor: T) {
    const descendant = class extends ConstantValue<TValue> {
      // @ts-ignore - unused param.
      constructor() {
        super(constructor.name, valueType, value);
      }
    }

    worldAssigned.then(world => world.addObjects(new descendant()));
  }
}

function constantp<TValue>(valueType: ValueType) {
  // @ts-ignore - unused param.
  return function <T extends {}>(target: T | Constructor<T>, key: string | symbol, descriptor?: TypedPropertyDescriptor<T>) {
    const constructor = (typeof target === "function" ? target : target.constructor) as Constructor<T>;
    const name = key.toString();
    // @ts-ignore - index signature.
    const value = <TValue>(target[name] || new constructor()[name]);

    const descendant = class extends ConstantValue<TValue> {
      constructor() {
        super(name, valueType, value);
      }
    }

    worldAssigned.then(world => world.addObjects(new descendant()));
  }
}

export function constant<TValue>(valueType: ValueType, value: TValue): any;
export function constant<TValue>(valueType: ValueType): any;
export function constant<TValue>(...args: any[]): any {
  // @ts-ignore - rest parameter count.
  return args.length === 2 ? constantClass<TValue>(...args) : constantp<TValue>(...args);
}
