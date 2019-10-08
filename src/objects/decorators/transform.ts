import 'reflect-metadata';

import { TransformObject } from '..';
import { Constructor, promisedWorld, Tristate, ValueType } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

type CalcValue<T> = (v: Tristate<T>) => Tristate<T>;

function transformClass<TValue>(valueType: ValueType, compute: CalcValue<TValue>, mathFormat?: string, stripUnicode: boolean = false) {
  return function <T extends Constructor<TransformObject<TValue>>>(constructor: T) {
    const descendant: T = class extends constructor {
      // @ts-ignore - unused param.
      constructor(...args: any[]) {
        super(constructor.name, valueType);

        this.stripUnicode = stripUnicode;

        if (mathFormat !== undefined)
          this._mathFormat = mathFormat;
      }

      transform(value: Tristate<TValue>) { return compute(value); }
    }

    worldAssigned.then(world => world.addObjects(new descendant()));
  }
}

function transformp<TValue>(valueType: ValueType, mathFormat?: string, stripUnicode: boolean = false) {
  // @ts-ignore - unused param.
  return function <T extends {}>(target: T | Constructor<T>, key: string | symbol, descriptor?: TypedPropertyDescriptor<T>) {
    const constructor = (typeof target === "function" ? target : target.constructor) as Constructor<T>;
    const name = key.toString();
    // @ts-ignore - index signature.
    const func = <CalcValue<TValue>>(target[name] || new constructor()[name]);

    const descendant = class extends TransformObject<TValue> {
      constructor() {
        super(name, valueType);

        this.stripUnicode = stripUnicode;

        if (mathFormat !== undefined)
          this._mathFormat = mathFormat;
      }

      transform(value: Tristate<TValue>) { return func(value); }
    }

    worldAssigned.then(world => world.addObjects(new descendant()));
  }
}

export function transform<TValue>(valueType: ValueType, compute: CalcValue<TValue>, mathFormat?: string, stripUnicode?: boolean): any;
export function transform<TValue>(valueType: ValueType, mathFormat?: string, stripUnicode?: boolean): any;
export function transform<TValue>(...args: any[]): any {
  return args.length > 1 && typeof args[1] !== "string"
    // @ts-ignore - rest parameter count.
    ? transformClass<TValue>(...args)
    // @ts-ignore - rest parameter count.
    : transformp<TValue>(...args);
}
