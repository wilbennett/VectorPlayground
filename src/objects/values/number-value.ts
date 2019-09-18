import { Value } from '..';
import { ValueType } from '../../core';
import { Utils } from '../../utils';

const { toNumber, toString } = Utils;

export class NumberValue extends Value<number> {
  constructor(name: string, value?: number, min?: number, max?: number, step?: number) {
    super(name, ValueType.number, undefined, value, min, max, step);
  }

  protected convertToString(value?: number) { return toString(value) || undefined; }
  protected convertFromString(value?: string) { return toNumber(value); }
}
