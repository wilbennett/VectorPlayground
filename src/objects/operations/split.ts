import { Calculation, Operation, VectorObject, VectorValue } from '..';
import { promisedWorld, Utils, Vec } from '../../core';

const worldAssigned = promisedWorld.then(w => w);

export class Split extends Calculation {
  constructor() {
    super(Split.name);

    this.vector = new VectorValue("vector");
    this.normal = new VectorValue("normal");
    this.parallelObject = new VectorObject("parallel_object", Vec.emptyDirection);
    this.parallel = new VectorValue("parallel");
    this.tangentObject = new VectorObject("tangent_object", Vec.emptyDirection);
    this.tangent = new VectorValue("tangent");

    this.addChildren(this.vector, this.normal, this.parallelObject, this.parallel, this.tangentObject, this.tangent);
    this.parallel.captionRoot = this.parallel.title;
    this.parallel.sourceValue = this.parallelObject.value;
    this.tangent.captionRoot = this.tangent.title;
    this.tangent.sourceValue = this.tangentObject.value;
    this.addResultProps(this.parallel, this.tangent);

    this._descriptionFormat = `<b>split({p1}, {p2})</b><br/>${Utils.formatVectorName("parallel")}, ${Utils.formatVectorName("tangent")}`;
    this.addCaptionFormat(this.parallelObject, "par({p1}, {a2}\u0302)");
    this.addCaptionFormat(this.tangentObject, "tan({p1}, {a2}\u0302)");
  }

  vector: VectorValue;
  normal: VectorValue;
  parallelObject: VectorObject;
  parallel: VectorValue;
  tangentObject: VectorObject;
  tangent: VectorValue;

  protected updateCore() {
    if (!this.vector.sourceValue) return;
    if (!this.normal.sourceValue) return;

    const par = new Vec(0, 0);
    const tan = new Vec(0, 0);
    this.vector.value.split(this.normal.value.normalizeN(), par, tan);
    this.parallelObject.value.value = par;
    this.tangentObject.value.value = tan;
  }
}

worldAssigned.then(world => world.addObjects(new Operation(Split.name, Split)));
