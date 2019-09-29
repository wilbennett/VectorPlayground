import { BaseObject, Calculation } from '.';
import { Category } from '../core';

// let world: IWorld;
// promisedWorld.then(w => world = w);

export abstract class Operation extends BaseObject {
  constructor(name: string) {
    super(name, Category.operation);
  }

  protected abstract createCalculationCore(): Calculation;

  createCalculation() {
    const calculation = this.createCalculationCore();
    return calculation;
  };
}
