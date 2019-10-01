import { Calculation, NumberValue, Operation, VectorObject, VectorValue } from '..';
import { promisedWorld, Utils, Vec } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

const { ONE_DEGREE } = Utils;

export class Rotate extends Calculation {
  constructor() {
    super(Rotate.name);

    this.vector = new VectorValue("vector");
    this.angle = new NumberValue("angle°", 1);
    this.result = new VectorObject("result", Vec.emptyDirection);
    this.resultValue = new VectorValue("result");

    this.addChildren(this.vector, this.angle, this.result, this.resultValue);
    this.resultValue.captionRoot = this.resultValue.title;
    this.resultValue.sourceValue = this.result.value;
    this.addResultProps(this.resultValue);

    this._descriptionFormat = "<b>rotate({p1}, {p2}°)</b><br/>[{p1}.x * cos({p2}°) - {p1}.y * sin({p2}°), {p1}.x * sin({p2}°) + {p1}.y * cos({p2}°), {p1}.w]";
    this.addCaptionFormat(this.result, "rotate({p1}, {p2}°)");
  }

  vector: VectorValue;
  angle: NumberValue;
  result: VectorObject;
  resultValue: VectorValue;

  protected updateCore() {
    if (!this.vector.sourceValue) return;

    this.result.value.value = this.vector.value.rotateN(this.angle.value * ONE_DEGREE);
  }
}

worldAssigned.then(world => world.addObjects(new Operation(Rotate.name, Rotate)));
