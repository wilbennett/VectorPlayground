import { EventArgs, EventKind } from '.';
import { Tristate, Vec } from '../core';
import { TransformObject } from '../objects';

export class ChangeArgs extends EventArgs {
  constructor() {
    super();

    this.kind = EventKind.value;
  }

  oldValue: any;
  newValue: any;
  propName: Tristate<string>;

  setValues(oldValue: any, newValue: any, sender?: any, propName?: string | null) {
    this.oldValue = oldValue;
    this.newValue = newValue;
    this.sender = sender;
    this.propName = propName;
  }

  toString() {
    return this.propName
      ? `${super.toString()}: [${this.propName}] ${this.oldValue} => ${this.newValue}`
      : `${super.toString()}: ${this.oldValue} => ${this.newValue}`;
  }
}

export class ChangeEventArgs<T> extends ChangeArgs {
  oldValue: Tristate<T>;
  newValue: Tristate<T>;

  setValues(oldValue: Tristate<T>, newValue: Tristate<T>, sender?: any, propName?: string | null) {
    super.setValues(oldValue, newValue, sender, propName);
  }
}

export class CaptionChangeArgs extends ChangeEventArgs<string> { }
export class StringChangeArgs extends ChangeEventArgs<string> { }
export class ColorChangeArgs extends ChangeEventArgs<string> { }
export class NumberChangeArgs extends ChangeEventArgs<number> { }
export class BoolChangeArgs extends ChangeEventArgs<boolean> { }
export class VecChangeArgs extends ChangeEventArgs<Vec> { }
export class StringTransformChangeArgs extends ChangeEventArgs<TransformObject<string>> { }
export class ColorTransformChangeArgs extends ChangeEventArgs<TransformObject<string>> { }
export class NumberTransformChangeArgs extends ChangeEventArgs<TransformObject<number>> { }
export class BoolTransformChangeArgs extends ChangeEventArgs<TransformObject<boolean>> { }
export class VectorTransformChangeArgs extends ChangeEventArgs<TransformObject<Vec>> { }
