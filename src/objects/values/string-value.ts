import { ValueBase } from '..';
import { ValueType } from '../../core';

export class StringValue extends ValueBase<string> {
  constructor(name: string, value?: string) {
    super(name, ValueType.string, undefined, value);
  }

  protected convertToString(value: string) { return value; }
  protected convertFromString(value: string) { return value; }
}
