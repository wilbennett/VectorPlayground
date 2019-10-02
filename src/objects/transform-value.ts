import { TransformObject, Value } from '.';
import { Category, Tristate, ValueMode, ValueType } from '../core';

export class TransformValue<T> extends Value<T> {
  constructor(name: string, valueType: ValueType, defaultValue: T) {
    super(name, valueType, defaultValue, Category.transformValue);

    this.readOnlyText = true;
    this._allowedModes = ValueMode.transform;
    this.mode = ValueMode.transform;
  }

  transformValue(value: Tristate<T>): Tristate<T> {
    if (!this.transform) return value;

    value = this.transform.transform(value);

    if (!this.modifier) return value;

    value = this.modifier.transform(value);
    return value;
  }

  // @ts-ignore - unused param.
  protected convertToString(value: Tristate<T>): Tristate<string> { return ""; }
  // @ts-ignore - unused param.
  protected convertFromString(value: string): Tristate<TransformObject<T>> { return undefined; }
}
