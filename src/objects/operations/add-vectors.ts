import { Calc2Vec, Operation } from '..';
import { promisedWorld } from '../../core';

// let world: IWorld;
const worldAssigned = promisedWorld.then(w => w);

class AddCalculation extends Calc2Vec {
  constructor() {
    super("Add", (v1, v2) => v1.addN(v2), "", "", "{p1} + {p2}");
  }
}

worldAssigned.then(world => world.addObjects(new Operation("Add", AddCalculation)));
