import { Value } from '..';
import { ValueType } from '../../core';

export class ColorValue extends Value<string> {
  constructor(name: string, value?: string) {
    super(name, ValueType.color, undefined, value);
  }

  protected convertToString(value: string) { return value; }
  protected convertFromString(value: string) { return value; }

  protected validateValue(value: string) {
    if (!value) return false;
    if (!value.startsWith("#")) return false;
    if (value.length !== 4 && value.length !== 7) return false;

    const num = +("0x" + value.substr(1));
    return !isNaN(num);
  }
}
