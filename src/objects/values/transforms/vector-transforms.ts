import { TransformObject } from '../..';
import { IWorld, promisedWorld, Tristate, ValueType, Vec } from '../../../core';

let world!: IWorld;
const worldAssigned = promisedWorld.then(w => world = w);

export class Midpoint extends TransformObject<Vec> {
    constructor() {
        super("midpoint", ValueType.vector);
    }

    transform(value: Tristate<Vec>) { return value ? value.midPointN() : Vec.emptyDirection; }
}

worldAssigned.then(() => world.addObjects(new Midpoint()));
