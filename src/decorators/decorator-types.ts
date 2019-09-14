import { BaseObject } from '../objects';

export type ConditionFunction = (...x: any[]) => boolean;
export type MessageFactory = (self: BaseObject, ...a: any[]) => string;

// @ts-ignore - unused param.
export const DEFAULT_CONDITION = (...a: any[]) => true;
