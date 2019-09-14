import { ConditionFunction, DEFAULT_CONDITION, EVENT_CSS, MessageFactory } from '.';
import { css, IWorld, promisedWorld } from '../core';
import * as D from './dlog';

let world!: IWorld;
promisedWorld.then(w => world = w);

export function preLogEventMsg(msg: string): any;
export function preLogEventMsg(condition: ConditionFunction, msg: string): any;
export function preLogEventMsg(msg: MessageFactory): any;
export function preLogEventMsg(condition: ConditionFunction, msg: MessageFactory): any;
export function preLogEventMsg(param1?: ConditionFunction | MessageFactory | string, param2?: MessageFactory | string): any {
  let condition: ConditionFunction;
  let msg: MessageFactory;

  if (arguments.length == 1) {
    condition = DEFAULT_CONDITION;
    msg = <MessageFactory>(typeof param1 === "string" ? () => param1 : param1);
  } else {
    condition = <ConditionFunction>param1;
    msg = (typeof param2 === "string" ? () => param2 : param2)!;
  }

  // @ts-ignore - unused param.
  return function (constructorOrProto: Object, name: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      if (world.debugEvents && condition(...args))
        // @ts-ignore - incompatible parameter.
        D.logd(...css`${EVENT_CSS}, ${msg(this, ...args)}`);

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
