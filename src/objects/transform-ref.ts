import { BaseObject, TransformObject, TransformValue } from '.';
import { Tristate } from '../core';

export class TransformRef<T> extends TransformObject<T> {
  constructor(name: string, public readonly sourceValue: TransformValue<T>) {
    super(name, sourceValue.valueType);

    this.addDisposable(this.sourceValue.onSettingsChanged(e => {
      this._settingsChangeArgs.setValues(e.oldValue, e.newValue, this, e.propName);
      this.emitSettingsChange(this._settingsChangeArgs);
    }));
  }

  transform(value: Tristate<T>): Tristate<T> {
    return !this.isCircularTransform([]) ? this.sourceValue.transformValue(value) : value;
  }

  getMathText(input?: string) {
    return !this.isCircularTransform([]) ? this.sourceValue.getMathText(input) : "*CIRCULAR*";
  }

  isCircularTransform(path: BaseObject[]) {
    if (path.indexOf(this) >= 0) return true;

    path.push(this);
    return this.sourceValue.isCircularTransform(path);
  }
}
