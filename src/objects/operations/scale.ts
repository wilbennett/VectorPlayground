import { Calculation, NumberValue, Operation, VectorObject, VectorValue } from '..';
import { promisedWorld, Vec } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

export class Scale extends Calculation {
  constructor() {
    super(Scale.name);

    this.vector = new VectorValue("vector");
    this.scale = new NumberValue("scale", 1);
    this.result = new VectorObject("result", Vec.emptyDirection);
    this.resultValue = new VectorValue("result");

    this.addChildren(this.vector, this.scale, this.result, this.resultValue);
    this.resultValue.captionRoot = this.resultValue.title;
    this.resultValue.sourceValue = this.result.value;
    this.addResultProps(this.resultValue);

    this._descriptionFormat = "<b>{p1} * {p2}</b><br/>[{p1}.x * {p2}, {p1}.y * {p2}, {p1}.w * {p2}]";
    this.addCaptionFormat(this.result, "{p1} * {p2}");
  }

  vector: VectorValue;
  scale: NumberValue;
  result: VectorObject;
  resultValue: VectorValue;

  protected updateCore() {
    if (!this.vector.sourceValue) return;

    this.result.value.value = this.vector.value.scaleN(this.scale.value);
  }
}

worldAssigned.then(world => world.addObjects(new Operation(Scale.name, Scale)));
