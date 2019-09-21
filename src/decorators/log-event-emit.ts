import { css, EVENT_CSS, IWorld, promisedWorld } from '../core';
import { EventArgs } from '../event-args';
import * as D from './dlog';

let world!: IWorld;
promisedWorld.then(w => world = w);

// @ts-ignore - unused param.
export function logEventEmit(constructorOrProto: Object, name: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function (...args: any[]) {
    if (world.debugEvents) {
      const e = args.find(a => a instanceof EventArgs);
      // @ts-ignore - missing property names.
      D.logd(...css`${EVENT_CSS}${e}`);
    }

    return originalMethod.apply(this, args);
  };

  return descriptor;
}
