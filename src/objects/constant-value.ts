import { Value } from '.';
import { Category, ValueMode, ValueType } from '../core';

export class ConstantValue<T> extends Value<T> {
  constructor(name: string, valueType: ValueType, value: T) {
    super(name, valueType, value, Category.constant);

    this._alwaysShowText = false;
    this._readOnlyText = true;

    let caption = this.name;

    if (caption.length === 1 && caption.charCodeAt(0) > "z".charCodeAt(0)) {
      caption = " " + caption;
    }

    this.caption = caption.replace("_", "");

    this._inputValue = value;
    this._value = value;
    // this.calcValue();
  }

  get allowedModes() { return ValueMode.text; }

  get value() { return super.value; }
  // @ts-ignore - unused param.
  set value(value) { }
}
