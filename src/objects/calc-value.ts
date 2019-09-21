import { Value } from '.';
import { Tristate, ValueMode, ValueType } from '../core';

type Getter<T> = () => Tristate<T>;
type ConvertToString<T> = (v?: T) => Tristate<string>;
type ConvertFromoString<T> = (v?: string) => Tristate<T>;

export class CalcSettings<T> {
    constructor(
        public readonly getValue: Getter<T>,
        public readonly convertToString: ConvertToString<T>,
        public readonly convertFromString: ConvertFromoString<T>,
        public readonly caption: string) {
    }

    setValue?: (v?: T) => void;
    instance?: CalcValue<T>;
}

export class CalcValue<T> extends Value<T> {
    constructor(
        name: string,
        valueType: ValueType,
        defaultValue: T,
        protected readonly settings: CalcSettings<T>) {
        super(name, valueType, defaultValue);

        settings.instance = this;
        settings.setValue = this.setValue;
        this.caption = settings.caption;

        this._alwaysShowText = true;
        this._readOnlyText = true;
        this._allowTransform = false;
    }

    get allowedModes() { return ValueMode.text; }

    get value() {
        if (this._value === undefined) {
            const newValue = this.settings.getValue.call(this.owner);

            if (newValue !== undefined)
                this.setValue(newValue);
        }

        return this._value || this._defaultValue;
    }
    // @ts-ignore - unused param.
    set value(value) { }

    protected convertToString(value?: T) { return this.settings.convertToString.call(this.owner, value); }
    protected convertFromString(value?: string) { return this.settings.convertFromString.call(this.owner, value); }
}
