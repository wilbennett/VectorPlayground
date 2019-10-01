import { BaseObject, Calculation } from '.';
import { Category, Constructor } from '../core';

// let world: IWorld;
// promisedWorld.then(w => world = w);

export class Operation extends BaseObject {
  constructor(name: string, public readonly calculationConstructor: Constructor<Calculation>) {
    super(name, Category.operation);
  }

  protected createCalculationCore(): Calculation { return new this.calculationConstructor(); }

  createCalculation() {
    const calculation = this.createCalculationCore();
    return calculation;
  };
}
