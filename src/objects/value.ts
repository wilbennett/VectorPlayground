import { BaseObject, IValue, TransformObject } from '.';
import {
  Category,
  DisplayType,
  EventFilter,
  IDisposable,
  Listener,
  Tristate,
  TypedEvent,
  ValueMode,
  ValueType,
} from '../core';
import * as D from '../decorators';
import { ChangeArgs, ChangeEventArgs, EventKind } from '../event-args';
import { Utils } from '../utils';

const { isEmpty } = Utils;

@D.dlogged({
  logAllMethods: true,
  logAllProps: true,
  methodState: self => self.propertyName,
  propState: self => self.propertyName,
  // methodSetLogIf: () => true,
  // propSetLogIf: () => true,
  methodSetLogIf: self => self.name === "opacity" || self.name === "angle",
  propSetLogIf: self => self.name === "opacity",
  exclude: ["propertyName"]
})
export class Value<T> extends BaseObject implements IValue {
  protected _settingsEmitter = new TypedEvent<ChangeArgs>(this);
  protected _settingsChangeArgs = new ChangeArgs();
  private _handleSourceChangedBound = this.handleSourceChanged.bind(this);
  private _sourceSubscription?: IDisposable;

  constructor(
    name: string,
    valueType: ValueType,
    defaultValue: T,
    category?: Category,
    value?: T,
    min?: number,
    max?: number,
    step?: number) {
    super(name, category || Category.value);

    if (min !== undefined) this._min = min;
    if (max !== undefined) this._max = max;
    if (step !== undefined) this._step = step;

    this._valueType = valueType;
    this._defaultValue = defaultValue;
    this._inputValue = value || defaultValue;

    this._caption = Utils.capitalizeUnder(this.name);
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

    includeIf(ValueMode.text, true);
    includeIf(ValueMode.constant, true);
    includeIf(ValueMode.textObject, true);
    includeIf(ValueMode.vector, true);
    includeIf(ValueMode.calculation, true);
    includeIf(ValueMode.transform, this.valueType === ValueType.transform);

    return <ValueMode>result;
  }

  get allowedValueTypes() { return this.valueType; }

  protected _defaultValue: T;
  get defaultValue() { return this._defaultValue; }
  set defaultValue(value) { this._defaultValue = value; }

  private _min?: number;
  get min() { return this._min; }
  set min(value) {
    if (this._min === value) return;
    if (!this._min && !value) return;

    this._settingsChangeArgs.setValues(this._min, value, this, "min");
    this._min = value;
    this.emitSettingsChange(this._settingsChangeArgs);
    this.calcValue();
  }

  private _max?: number;
  get max() { return this._max; }
  set max(value) {
    if (this._max === value) return;
    if (!this._max && !value) return;

    this._settingsChangeArgs.setValues(this._max, value, this, "max");
    this._max = value;
    this.emitSettingsChange(this._settingsChangeArgs);
    this.calcValue();
  }

  private _step?: number;
  get step() { return this._step; }
  set step(value) {
    if (this._step === value) return;
    if (!this._step && !value) return;

    this._settingsChangeArgs.setValues(this._step, value, this, "step");
    this._step = value;
    this.emitSettingsChange(this._settingsChangeArgs);
    this.calcValue();
  }

  private _displayType = DisplayType.text;
  get displayType() { return this._displayType; }
  set displayType(value) {
    if (this._displayType === value) return;

    this._settingsChangeArgs.setValues(this._displayType, value, this, "displayType");
    this._displayType = value;
    this.emitSettingsChange(this._settingsChangeArgs);
    this.calcValue();
  }

  protected _mode = ValueMode.text;
  get mode() { return this._mode; }
  set mode(value) {
    if (this._mode === value) return;

    this._settingsChangeArgs.setValues(this._mode, value, this, "mode");
    this.setMode(value);
    this.emitSettingsChange(this._settingsChangeArgs);
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
  get value() {
    if (isEmpty(this._value))
      this.calcValue();

    return this._value || this._defaultValue;
  }
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

    this._settingsChangeArgs.setValues(this._sourceValue, value, this, "sourceValue");
    this.setSourceValue(value);
    this.calcValue();
    this.emitSettingsChange(this._settingsChangeArgs);
  }

  protected _transform?: TransformObject<T>;
  get transform() { return this._transform; }
  set transform(value) {
    if (value === this._transform) return;

    this._settingsChangeArgs.setValues(this._transform, value, this, "transform");
    this._transform = value;
    this.calcValue();
    this.emitSettingsChange(this._settingsChangeArgs);
  }

  protected _modifier?: TransformObject<T>;
  get modifier() { return this._modifier; }
  set modifier(value) {
    if (value === this._modifier) return;

    this._settingsChangeArgs.setValues(this._modifier, value, this, "modifier");
    this._modifier = value;
    this.calcValue();
    this.emitSettingsChange(this._settingsChangeArgs);
  }

  assignFrom(source: IValue) {
    this.mode = source.mode;
    this.displayType = source.displayType;
    // this.allowedModes = source.allowedModes;
    // this.allowedValueTypes = source.allowedValueTypes;
    this.alwaysShowText = source.alwaysShowText;
    this.readOnlyText = source.readOnlyText;
    this.sourceValue = source.sourceValue;
    this.transform = source.transform;
    this.modifier = source.modifier;
    this.text = source.text;

    if (source.min !== undefined)
      this.min = source.min;

    if (source.max !== undefined)
      this.max = source.max;

    if (source.step !== undefined)
      this.step = source.step;
  }

  assignTo(target: IValue) {
    // if (this.propertyName === "u.x") {
    //   console.log(new Error().stack);
    // }
    if (isEmpty(this._value))
      this.calcValue();
    // else D.logd(`${this.propertyName}: NOT EMPTY: ${this._value}`);

    target.mode = this.mode;
    target.displayType = this.displayType;
    target.allowedModes = this.allowedModes;
    target.allowedValueTypes = this.allowedValueTypes;
    target.alwaysShowText = this.alwaysShowText;
    target.readOnlyText = this.readOnlyText;
    target.sourceValue = this.sourceValue;
    target.transform = this.transform;
    target.modifier = this.modifier;
    target.text = this.text;

    if (this.min !== undefined)
      target.min = this.min;

    if (this.max !== undefined)
      target.max = this.max;

    if (this.step !== undefined)
      target.step = this.step;
  }

  protected calcOwnerText(owner: BaseObject) {
    switch (owner.category) {
      case Category.vectorObject:
        return `${Utils.formatVectorName(owner.name)}`;
      default:
        return `[${owner.name.replace("_", " ")}]`;
    }
  }

  protected setOwner(owner: BaseObject) {
    super.setOwner(owner);
    this._propertyName = undefined;

    if (this.owner)
      this._caption = `${this.calcOwnerText(this.owner)} ${Utils.capitalizeUnder(this.name)}`;
    else
      this._caption = `${Utils.capitalizeUnder(this.name)}`;
  }

  protected emitChange(e: ChangeArgs) {
    super.emitChange(e);
  }

  protected emitSettingsChange(e: ChangeArgs) {
    this._settingsEmitter.emit(e);
  }

  onSettingsChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this._settingsEmitter.on(listener, filter);
  }

  offSettingsChanged(listener: Listener<ChangeArgs>) { this._settingsEmitter.off(listener); }

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
      e => e instanceof ChangeEventArgs && e.kind == EventKind.value);
  }

  protected setValue(value: Tristate<T>) {
    // if (isEmpty(value))
    //   value = this._defaultValue;

    if (value === this._value) {
      // const text = this.convertToString(value) || "";

      // if (text !== this._text)
      //   this._text = text;

      return;
    }

    this._valueChangeArgs.setValues(this._value, value, this);
    // if (this.propertyName === "u.x") {
    //   D.logd(`${this.propertyName}.setValue: ${this._value} -> ${value}`);
    //   // console.log(new Error().stack);
    // }
    this._value = value;

    // if (this.mode !== ValueMode.text)
    const text = this.convertToString(value) || "";

    if (text !== this._text) {
      this._settingsChangeArgs.setValues(this._text, value, this, "text");
      this._text = text;
      this.emitSettingsChange(this._settingsChangeArgs);
    }

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
