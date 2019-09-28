import { BaseObject } from '.';
import { Category, ValueType } from '../core';
import { Utils } from '../utils';

export abstract class TransformObject<T> extends BaseObject {
  constructor(name: string, valueType: ValueType, category?: Category) {
    super(name, category || Category.transform);

    this._valueType = valueType;
    this.caption = Utils.capitalizeUnder(name);
  }

  abstract transform(value: T): T;
}
