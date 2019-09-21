import { Value } from '..';
import { DisplayType, ValueType } from '../../core';
import { Utils } from '../../utils';

console.log("BoolValue init start");
const { toString } = Utils;

const falseStrings = ["false"];

export class BoolValue extends Value<boolean> {
  constructor(name: string, value?: boolean) {
    super(name, ValueType.bool, false, undefined, value);

    this.displayType = DisplayType.checkbox;
  }

  protected convertToString(value?: boolean) {
    const result = toString(value);
    return !!result && !falseStrings.find(s => s === result.toLowerCase()) ? "true" : "";
  }

  protected convertFromString(value?: string) {
    return !!value && !falseStrings.find(s => s === value.toLowerCase());
  }
}
console.log("BoolValue init end");
