import { Value } from '..';
import { ValueType } from '../../core';

export class TextValue extends Value<string> {
  constructor(name: string, value?: string) {
    super(name, ValueType.string, "", undefined, value);
  }

  protected convertToString(value: string) { return value; }
  protected convertFromString(value: string) { return value; }
}
