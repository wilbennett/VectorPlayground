import { TransformObject, TransformValue } from '.';
import { Tristate } from '../core';

export class TransformRef<T> extends TransformObject<T> {
  constructor(name: string, public readonly sourceValue: TransformValue<T>) {
    super(name, sourceValue.valueType);
  }

  transform(value: Tristate<T>): Tristate<T> {
    return this.sourceValue.transformValue(value);
  }
}
