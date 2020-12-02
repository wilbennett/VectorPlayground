import { Calculation, NumberValue, Operation, VectorValue } from '..';
import { promisedWorld } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

export class Cross extends Calculation {
  constructor() {
    super(Cross.name);

    this.vector1 = new VectorValue("vector1");
    this.vector2 = new VectorValue("vector2");
    this.result = new NumberValue("result");

    this.addChildren(this.vector1, this.vector2, this.result);
    this.result.captionRoot = this.result.title;
    this.result.readOnlyText = true;
    this.addResultProps(this.result);

    this._descriptionFormat = "<b>{p1} X {p2}</b><br/>{p1}.x * {p2}.y - {p1}.y * {p2}.x";
    this.addCaptionFormat(this.result, "{p1} X {p2}");
  }

  vector1: VectorValue;
  vector2: VectorValue;
  result: NumberValue;

  protected updateCore() {
    if (!this.vector1.sourceValue) return;
    if (!this.vector2.sourceValue) return;

    this.result.value = this.vector1.value.cross(this.vector2.value);
  }
}

worldAssigned.then(world => world.addObjects(new Operation(Cross.name, Cross)));
