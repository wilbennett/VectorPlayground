import { BaseObject } from '.';
import { Category, Tristate, ValueType } from '../core';

export type TransformFunc<T> = (value: Tristate<T>) => Tristate<T>;

export class TransformObject<T> extends BaseObject {
  constructor(name: string, valueType: ValueType, category?: Category) {
    super(name, category || Category.transform);

    this._valueType = valueType;
    this.isGlobal = false;
    this._mathFormat = `${this.name}({input})`;
  }

  transform(value: Tristate<T>): Tristate<T> { return value; }
}
