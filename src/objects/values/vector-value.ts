import { Value, VectorObject } from '..';
import { ValueMode, ValueType, Vec } from '../../core';
import { Utils } from '../../utils';

const { toString, checkType } = Utils;

export class VectorValue extends Value<Vec> {
  constructor(name: string, value?: Vec) {
    super(name, ValueType.vector, undefined, value);

    this._readOnlyText = true;
    this._alwaysShowText = false;
    this.mode = ValueMode.vector;
  }

  get allowedModes() { return ValueMode.vector | ValueMode.calculation; }

  // get sourceValue(): VectorValue | undefined { return <VectorValue>this._sourceValue; }
  // set sourceValue(value) {
  //   if (value === this._sourceValue) return;

  //   this.setSourceValue(value);
  //   this.calcValue();
  // }

  private _vectorObject?: VectorObject;
  get vectorObject() {
    if (this._vectorObject) return this._vectorObject;

    const obj = checkType(VectorObject, this.sourceValue && this.sourceValue.owner);
    // @ts-ignore - incompatible type.
    this._vectorObject = obj ? obj : new VectorObject("temp", this.value || Vec.emptyDirection);
    return this._vectorObject;
  }

  protected convertToString(value?: Vec) { return toString(value) || undefined; }
  // @ts-ignore - unused param.
  protected convertFromString(value?: string) { return undefined; }

  protected setSourceValue(value?: Value<Vec>) {
    super.setSourceValue(value);
    this._vectorObject = undefined;
  }
}
