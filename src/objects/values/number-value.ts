import { Value } from '..';
import { DisplayType, ValueMode, ValueType } from '../../core';
import { Utils } from '../../utils';

const { toNumber, toString } = Utils;

export class NumberValue extends Value<number> {
  constructor(name: string, value?: number, min?: number, max?: number, step?: number) {
    super(name, ValueType.number, 0, undefined, value, min, max, step);

    this.displayType = DisplayType.number;
  }

  getMathText(input?: string): string {
    input = input || "";
    const source = this.sourceValue;
    const sourceOwner = source && source.owner;

    switch (this.mode) {
      case ValueMode.text:
        input = this.mathFormat.replace(/\{input\}/g, this.text);
        break;
      case ValueMode.property:
        if (source) {
          input = source.mode === ValueMode.text
            ? source.mathFormat.replace(/\{input\}/g, sourceOwner ? sourceOwner.caption : source.caption)
            : source.getMathText(input);
        }
        break;
    }

    if (input && this.stripUnicode)
      input = this.removeUnicode(input);

    if (this.transform)
      input = this.transform.getMathText(input);

    if (this.modifier)
      input = this.modifier.getMathText(input);

    return input;
  }

  protected convertToString(value?: number) { return toString(value) || undefined; }
  protected convertFromString(value?: string) { return toNumber(value); }
}
