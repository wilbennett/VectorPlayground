import { Calculation, Operation, TextObject, Value, VectorObject, VectorValue } from '..';
import { BaseObject, promisedWorld, Utils, ValueMode, Vec } from '../../core';

// let world: IWorld;
const worldAssigned = promisedWorld.then(w => w);

class AddCalculation extends Calculation {
  protected _resultProps: BaseObject[] = [];
  protected _captionFormats: [BaseObject, string][] = [];
  constructor() {
    super("Add");

    this.vector1 = new VectorValue("vector1");
    this.vector2 = new VectorValue("vector2");
    this.result = new VectorObject("result", Vec.emptyDirection);
    this.resultValue = new VectorValue("result");

    this.addChildren(this.vector1, this.vector2, this.result, this.resultValue);
    this.resultValue.caption = Utils.formatVectorName(this.resultValue.name);
    this.resultValue.sourceValue = this.result.value;
    this.addResultProps(this.resultValue);
    this.addCaptionFormat(this.result, "{p1} + {p2}");
    this.addCaptionFormat(this.resultValue, "{p1} + {p2}");
  }

  vector1: VectorValue;
  vector2: VectorValue;
  result: VectorObject;
  resultValue: VectorValue;

  protected addResultProps(...props: Value<any>[]) {
    this._resultProps.push(...props);
  }

  protected addCaptionFormat(obj: BaseObject, format: string) {
    this._captionFormats.push([obj, format]);
  }

  protected getDescriptionName(obj: BaseObject) {
    if (obj instanceof VectorObject)
      return obj.caption;

    if (obj instanceof TextObject)
      return obj.textValue;

    if (obj instanceof VectorValue)
      return obj.sourceValue ? obj.sourceValue.caption : Utils.formatVectorName(obj.name);

    if (!(obj instanceof Value)) return "XXX";

    switch (obj.mode) {
      case ValueMode.text: return obj.text;
      case ValueMode.constant: return obj.sourceValue ? obj.sourceValue.caption : obj.title;
      case ValueMode.text: return obj.sourceValue ? obj.sourceValue.caption : obj.title;
      default: return obj.title;
    }
  }

  protected calcCaption(format: string) {
    if (this._children) {
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        format = format.replace(new RegExp(`{p${i + 1}}`, "g"), this.getDescriptionName(child)!);
      }
    }
    return format;
  }

  protected updateCaptions() {
    for (const [obj, format] of this._captionFormats) {
      obj.caption = this.calcCaption(format);
    }
  }

  protected onChildChanged() {
    super.onChildChanged();
    this.updateCaptions();
  }

  protected updateCore() {
    if (!this.vector1.sourceValue) return;
    if (!this.vector2.sourceValue) return;

    this.result.value.value = this.vector1.value.addN(this.vector2.value);
    this.clean();
  }
}

class AddVectors extends Operation {
  constructor() {
    super("Add");
  }

  protected createCalculationCore() { return new AddCalculation(); };
}

worldAssigned.then(world => world.addObjects(new AddVectors()));
