import { Calculation, VectorObject, VectorValue } from '.';
import { Vec } from '../core';

export type Calc2VecFunc = (v1: Vec, v2: Vec) => Vec;

export class Calc2Vec extends Calculation {
  constructor(
    name: string,
    public readonly calc: Calc2VecFunc,
    descFormat: string = "",
    ...captionFormats: string[]) {
    super(name);

    this.vector1 = new VectorValue("vector1");
    this.vector2 = new VectorValue("vector2");
    this.result = new VectorObject("result", Vec.emptyDirection);
    this.resultValue = new VectorValue("result");

    this.addChildren(this.vector1, this.vector2, this.result, this.resultValue);
    this.resultValue.captionRoot = this.resultValue.title;
    this.resultValue.sourceValue = this.result.value;
    this.addResultProps(this.resultValue);

    if (descFormat)
      this._descriptionFormat = descFormat;

    const children = this.children!;

    for (let i = 0; i < captionFormats.length; i++) {
      if (!captionFormats[i]) continue;

      this.addCaptionFormat(children[i], captionFormats[i]);
    }
  }

  vector1: VectorValue;
  vector2: VectorValue;
  result: VectorObject;
  resultValue: VectorValue;

  protected updateCore() {
    if (!this.vector1.sourceValue) return;
    if (!this.vector2.sourceValue) return;

    this.result.value.value = this.calc(this.vector1.value, this.vector2.value);
  }
}
