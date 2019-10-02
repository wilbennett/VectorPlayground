import { BaseObject } from '.';
import { Category, Tristate, ValueType } from '../core';

export type TransformFunc<T> = (value: Tristate<T>) => Tristate<T>;

export class TransformObject<T> extends BaseObject {
  constructor(name: string, valueType: ValueType, category?: Category) {
    super(name, category || Category.transform);

    this._valueType = valueType;
    this.isGlobal = false;
  }

  transform(value: Tristate<T>): Tristate<T> { return value; }

  protected calcOwnerText(owner: BaseObject) {
    switch (owner.category) {
      case Category.vectorObject:
        return `${owner.caption}`;
      default:
        return `[${owner.caption}]`;
    }
  }

  protected calcCaption() {
    const owner = this.owner;

    return owner
      ? `${this.calcOwnerText(owner)}${this.captionRoot && ` ${this.captionRoot}`}`
      : `${this.captionRoot}`;
  }

  protected setOwner(owner: BaseObject) {
    super.setOwner(owner);

    if (!this._caption)
      this.caption = this.calcCaption();
  }

  protected ownerCaptionChanged() {
    this.caption = this.calcCaption();
  }
}
