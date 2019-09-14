import { BaseObject } from '.';
import { Category, ValueType } from '../core';

export class TransformObject<T> extends BaseObject {
  constructor(name: string, public readonly valueType: ValueType, category?: Category) {
    super(name, category || Category.transform);
  }

  private _adjustOrigin = false;
  get adjustOrigin() { return this._adjustOrigin; }

  transform(value?: T | null) { return value; }
}
