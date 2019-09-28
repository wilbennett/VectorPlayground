import { BaseObject } from '.';
import { Category, Tristate, ValueType } from '../core';
import { Utils } from '../utils';

export abstract class TransformObject<T> extends BaseObject {
  constructor(name: string, valueType: ValueType, category?: Category) {
    super(name, category || Category.transform);

    this._valueType = valueType;
    this.isGlobal = false;
    this.caption = Utils.capitalizeUnder(name);
  }

  abstract transform(value: Tristate<T>): Tristate<T>;
}
