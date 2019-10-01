import 'reflect-metadata';

import { Calc2Vec, Calc2VecFunc, Operation } from '..';
import { Constructor, promisedWorld } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

function calc2vecClass(calc: Calc2VecFunc, ...captionFormats: string[]) {
  return function <T extends Constructor<{}>>(constructor: T) {
    const descendant = class extends Calc2Vec {
      constructor() {
        super(constructor.name, calc, ...captionFormats);
      }
    }

    worldAssigned.then(world => world.addObjects(new Operation(constructor.name, descendant)));
  }
}

function calc2vecp(...captionFormats: string[]) {
  // @ts-ignore - unused param.
  return function <T extends {}>(target: T | Constructor<T>, key: string | symbol, descriptor?: TypedPropertyDescriptor<T>) {
    const constructor = (typeof target === "function" ? target : target.constructor) as Constructor<T>;
    const name = key.toString();
    // @ts-ignore - index signature.
    const calc = <Calc2VecFunc>(target[name] || new constructor()[name]);

    const descendant = class extends Calc2Vec {
      constructor() {
        super(name, calc, ...captionFormats);
      }
    }

    worldAssigned.then(world => world.addObjects(new Operation(name, descendant)));
  }
}

export function calc2vec(calc: Calc2VecFunc, ...captionFormats: string[]): any;
export function calc2vec(...captionFormats: string[]): any;
export function calc2vec(param1?: Calc2VecFunc | string, ...args: any[]): any {
  // @ts-ignore - rest parameter count.
  return typeof param1 === "function"
    ? calc2vecClass(param1, ...args)
    : calc2vecp(param1!, ...args);
}
