import { Value } from '.';
import { Category, ValueMode, ValueType } from '../core';

export class ConstantValue<T> extends Value<T> {
  constructor(name: string, valueType: ValueType, value: T) {
    super(name, valueType, Category.constant);

    this._alwaysShowText = false;
    this._readOnlyText = true;

    this._inputValue = value;
    this._value = value;
    // this.calcValue();
  }

  get allowedModes() { return ValueMode.text; }

  get value() { return super.value; }
  // @ts-ignore - unused param.
  set value(value) { }
}
