import { ValueBase } from '..';
import { ValueType } from '../../core';
import { Utils } from '../../utils';

const { toString } = Utils;

const falseStrings = ["false"];

export class BoolValue extends ValueBase<boolean> {
  constructor(name: string, value?: boolean) {
    super(name, ValueType.bool, undefined, value);
  }

  protected convertToString(value?: boolean) { return toString(value) || undefined; }

  protected convertFromString(value?: string) {
    return !!value && !!falseStrings.find(s => s === value.toLowerCase());
  }
}
