import { BaseObject } from '.';
import { Category, ChangeArgs, EventFilter, Listener, Tristate, TypedEvent, ValueType } from '../core';

export type TransformFunc<T> = (value: Tristate<T>) => Tristate<T>;

export class TransformObject<T> extends BaseObject {
  protected _settingsEmitter = new TypedEvent<ChangeArgs>(this);
  protected _settingsChangeArgs = new ChangeArgs();

  constructor(name: string, valueType: ValueType, category?: Category) {
    super(name, category || Category.transform);

    this._valueType = valueType;
    this.isGlobal = false;
    this._mathFormat = `${this.name}({input})`;
  }

  transform(value: Tristate<T>): Tristate<T> { return value; }

  isCircularTransform(path: BaseObject[]): boolean {
    return path.indexOf(this) >= 0;
  }

  onSettingsChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this._settingsEmitter.on(listener, filter);
  }

  offSettingsChanged(listener: Listener<ChangeArgs>) { this._settingsEmitter.off(listener); }

  protected emitSettingsChangeCore(e: ChangeArgs) {
    this._settingsEmitter.emit(e);
    e.sender = undefined;
  }

  protected emitSettingsChange(e: ChangeArgs) {
    if (!e.sender) return;

    this.emitSettingsChangeCore(e);
  }
}
