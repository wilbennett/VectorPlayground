/*
import { ValueBase } from '.';
import { IDisposable, ValueMode, ValueType } from '../core';
import { ChangeArgs, ChangeEventArgs, EventKind } from '../event-args';

export class Value<T> extends ValueBase<T> {
  private _handleSourceChangedBound = this.handleSourceChanged.bind(this);
  private _sourceSubscription?: IDisposable;

  constructor(
    name: string, valueType: ValueType, value?: T, min?: number, max?: number, step?: number) {
    super(name, valueType, undefined, min, max, step);

    this._value = value;
  }

  protected _sourceValue?: ValueBase<T>;
  get sourceValue() { return this._sourceValue; }
  set sourceValue(value) {
    if (value === this._sourceValue) return;

    this.setSourceValue(value);
    this.calcValue();
  }

  protected setSourceValue(value?: ValueBase<T>) {
    this._sourceSubscription && this._sourceSubscription.dispose();
    this._sourceSubscription = undefined;
    this._sourceValue = value;

    if (!value) return;

    this._sourceSubscription = value.onChanged(
      this._handleSourceChangedBound,
      e => e instanceof ChangeEventArgs && e.sender === value && e.kind == EventKind.value);
  }

  protected calcValue() {
    if (this.mode === ValueMode.text)
      return super.calcValue();

    if (!this.sourceValue) return;

    this._inputValue = this.sourceValue.value;
    super.calcValue();
  }

  protected handleSourceChanged(args: ChangeArgs) {
    const e = args as ChangeEventArgs<T>;

    if (!(e instanceof ChangeEventArgs)) return;

    this.calcValue();
  }
}
//*/
