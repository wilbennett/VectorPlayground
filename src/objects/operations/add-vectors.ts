import { Calculation, Operation, VectorObject, VectorValue } from '..';
import { promisedWorld, Vec } from '../../core';

// let world: IWorld;
const worldAssigned = promisedWorld.then(w => w);

class AddCalculation extends Calculation {
  constructor() {
    super("Add");

    this.vector1 = new VectorValue("vector1");
    this.vector2 = new VectorValue("vector2");
    this.result = new VectorObject("result", Vec.emptyDirection);
    this.resultValue = new VectorValue("result");

    this.addChildren(this.vector1, this.vector2, this.result, this.resultValue);
    this.resultValue.captionRoot = this.resultValue.title;
    this.resultValue.sourceValue = this.result.value;
    this.addResultProps(this.resultValue);
    this.addCaptionFormat(this.result, "{p1} + {p2}");
  }

  vector1: VectorValue;
  vector2: VectorValue;
  result: VectorObject;
  resultValue: VectorValue;

  protected updateCore() {
    if (!this.vector1.sourceValue) return;
    if (!this.vector2.sourceValue) return;

    this.result.value.value = this.vector1.value.addN(this.vector2.value);
  }
}

worldAssigned.then(world => world.addObjects(new Operation("Add", AddCalculation)));
