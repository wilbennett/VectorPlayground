import 'reflect-metadata';

import { TransformObject } from '..';
import { Constructor, promisedWorld, Tristate, ValueType } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

type CalcValue<T> = (v: Tristate<T>) => Tristate<T>;

function transformClass<TValue>(compute: CalcValue<TValue>) {
  return function <T extends Constructor<TransformObject<TValue>>>(constructor: T) {
    const descendant: T = class extends constructor {
      // @ts-ignore - unused param.
      constructor(...args: any[]) {
        super(constructor.name, ValueType.vector);
      }

      transform(value: Tristate<TValue>) { return compute(value); }
    }

    worldAssigned.then(world => world.addObjects(new descendant()));
  }
}

function transformp<TValue>() {
  // @ts-ignore - unused param.
  return function <T extends {}>(target: T | Constructor<T>, key: string | symbol, descriptor?: TypedPropertyDescriptor<T>) {
    const constructor = (typeof target === "function" ? target : target.constructor) as Constructor<T>;
    const name = key.toString();
    // @ts-ignore - index signature.
    const func = <CalcValue<TValue>>(target[name] || new constructor()[name]);

    const descendant = class extends TransformObject<TValue> {
      constructor() {
        super(name, ValueType.vector);
      }

      transform(value: Tristate<TValue>) { return func(value); }
    }

    worldAssigned.then(world => world.addObjects(new descendant()));
  }
}

export function transform<TValue>(compute: CalcValue<TValue>): any;
export function transform<TValue>(): any;
export function transform<TValue>(param1?: any, ...rest: any[]): any {
  return param1 && typeof param1 === "function"
    // @ts-ignore - rest parameter count.
    ? transformClass<TValue>(param1, ...rest)
    : transformp<TValue>();
}
