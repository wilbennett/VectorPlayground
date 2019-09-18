import { BaseObject, IValue, TransformObject } from '.';
import { Category, Tristate, ValueMode, ValueType, IDisposable } from '../core';
import * as D from '../decorators';
import { ChangeEventArgs, EventKind, ChangeArgs } from '../event-args';

@D.dlogged()
export class Value<T> extends BaseObject implements IValue {
  private _handleSourceChangedBound = this.handleSourceChanged.bind(this);
  private _sourceSubscription?: IDisposable;

  constructor(
    name: string,
    public readonly valueType: ValueType,
    category?: Category,
    value?: T,
     min?: number,
    max?: number,
    step?: number) {
    super(name, category || Category.value);

    if (min !== undefined) this._min = min;
    if (max !== undefined) this._max = max;
    if (step !== undefined) this._step = step;
  
      this._value = value;
}

  protected _propertyName?: string;
  get propertyName() {
    return this._propertyName || (this._propertyName = this.owner ? `${this.owner.name}.${this.name}` : this.name);
  }

  protected _alwaysShowText = false;
  get alwaysShowText() { return this._alwaysShowText; }
  // @ts-ignore - unused param.
  set alwaysShowText(value) { }

  protected _readOnlyText = false;
  get readOnlyText() { return this._readOnlyText; }
  // @ts-ignore - unused param.
  set readOnlyText(value) { }

  protected _allowTransform = false;
  get allowTransform() { return this._allowTransform; }
  // @ts-ignore - unused param.
  set allowTransform(value) { }

  get allowedModes(): ValueMode {
    let result = 0;

    const includeIf = (value: ValueMode, condition: boolean) => condition && (result |= value);

    includeIf(ValueMode.text, this.valueType !== ValueType.transform && this.valueType !== ValueType.vector);
    includeIf(ValueMode.constant, true);
    includeIf(ValueMode.textObject, this.valueType !== ValueType.transform && this.valueType !== ValueType.vector);
    includeIf(ValueMode.vector, this.valueType === ValueType.vector);
    includeIf(ValueMode.calculation, true);
    includeIf(ValueMode.transform, this.valueType === ValueType.transform);

    return <ValueMode>result;
  }

  get allowedTypes() { return this.valueType; }

  private _min?: number;
  get min() { return this._min; }
  set min(value) {
    if (this._min === value) return;
    if (!this._min && !value) return;

    this._min = value;
    this.calcValue();
  }

  private _max?: number;
  get max() { return this._max; }
  set max(value) {
    if (this._max === value) return;
    if (!this._max && !value) return;

    this._max = value;
    this.calcValue();
  }

  private _step?: number;
  get step() { return this._step; }
  set step(value) {
    if (this._step === value) return;
    if (!this._step && !value) return;

    this._step = value;
    this.calcValue();
  }

  protected _mode = ValueMode.text;
  get mode() { return this._mode; }
  set mode(value) {
    if (this._mode === value) return;

    this.setMode(value);
  }

  protected _text: string = "";
  get text() { return this._text; }
  set text(value) {
    if (!(this.allowedModes & ValueMode.text)) return;
    if (this.readOnlyText) return;
    if (this._mode !== ValueMode.text) return;
    if (value === this._text) return;

    this.setText(value);
  }

  protected _valueChangeArgs = new ChangeEventArgs<T>();
  protected _value: Tristate<T>;
  protected _inputValue: Tristate<T>;
  @D.clog(self => self.propertyName || self.name)
  get value() { return this._value; }
  set value(value) {
    if (this.mode !== ValueMode.text) return;
    if (value === this._inputValue) return;

    this._inputValue = value;
    this.calcValue();
  }

  protected _sourceValue?: Value<T>;
  get sourceValue() { return this._sourceValue; }
  set sourceValue(value) {
    if (value === this._sourceValue) return;

    this.setSourceValue(value);
    this.calcValue();
  }

  protected _transform?: TransformObject<T>;
  get transform() { return this._transform; }
  set transform(value) {
    if (value === this._transform) return;

    this._transform = value;
    this.calcValue();
  }

  protected _modifier?: TransformObject<T>;
  get modifier() { return this._modifier; }
  set modifier(value) {
    if (value === this._modifier) return;

    this._modifier = value;
    this.calcValue();
  }

  protected convertToString(value: Tristate<T>): Tristate<string> { return "" + value; }
  protected convertFromString(value: string): Tristate<T> { return <T><any>value; }
  // @ts-ignore - unused param.
  protected validateValue(value?: Tristate<T>) { return true; }

  protected setMode(value: ValueMode) {
    this._mode = value;
    this.calcValue();
  }

  protected setText(value: string) {
    this._text = value;
    this._inputValue = this.convertFromString(this._text);
    this.calcValue();
  }

  protected setSourceValue(value?: Value<T>) {
    this._sourceSubscription && this._sourceSubscription.dispose();
    this._sourceSubscription = undefined;
    this._sourceValue = value;

    if (!value) return;

    this._sourceSubscription = value.onChanged(
      this._handleSourceChangedBound,
      e => e instanceof ChangeEventArgs && e.sender === value && e.kind == EventKind.value);
  }

  protected setValue(value: Tristate<T>) {
    if (value === this._value) {
      const text = this.convertToString(value) || "";

      if (text !== this._text)
        this._text = text;

      return;
    }

    this._valueChangeArgs.setValues(this._value, value);
    this._value = value;

    if (this.mode !== ValueMode.text)
      this._text = this.convertToString(value) || "";

    this.emitChange(this._valueChangeArgs);
  }

  protected calcValue() {
    if (this.mode !== ValueMode.text) {
      if (!this.sourceValue) return;

      this._inputValue = this.sourceValue.value;
    }

    let result = this._inputValue;

    if (!this.validateValue(result)) {
      this.setValue(undefined);
      return;
    }

    if (this.transform)
      result = this.transform.transform(result);

    if (this.modifier)
      result = this.modifier.transform(result);

    this.setValue(result);
  }

  protected handleSourceChanged(args: ChangeArgs) {
    const e = args as ChangeEventArgs<T>;

    if (!(e instanceof ChangeEventArgs)) return;

    this.calcValue();
  }
}
