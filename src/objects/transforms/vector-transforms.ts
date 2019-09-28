import { Tristate, Vec } from '../../core';
import { transform } from '../decorators';

type TriVec = Tristate<Vec>;

// @ts-ignore - unused param.
class VectorTransforms {
  @transform() midpoint = (v: TriVec) => v ? v.midPointN() : Vec.emptyDirection;
  @transform() negate = (v: TriVec) => v ? v.negateN() : Vec.emptyDirection;
}
