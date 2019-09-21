import { Value } from '..';
import { DisplayType, ValueType } from '../../core';
import { Utils } from '../../utils';

const { toNumber, toString } = Utils;

export class NumberValue extends Value<number> {
  constructor(name: string, value?: number, min?: number, max?: number, step?: number) {
    super(name, ValueType.number, 0, undefined, value, min, max, step);

    this.displayType = DisplayType.number;
  }

  protected convertToString(value?: number) { return toString(value) || undefined; }
  protected convertFromString(value?: string) { return toNumber(value); }
}
