import { Tristate, Vec } from '../../core';
import { transform } from '../decorators';

type TriVec = Tristate<Vec>;

// @ts-ignore - unused param.
class VectorTransforms {
  @transform() normalize = (v: TriVec) => v ? v.normalizeN() : Vec.emptyDirection;
  @transform() midpoint = (v: TriVec) => v ? v.midPointN() : Vec.emptyDirection;
  @transform() negate = (v: TriVec) => v ? v.negateN() : Vec.emptyDirection;
  @transform() leftNormal = (v: TriVec) => v ? v.leftNormalN() : Vec.emptyDirection;
  @transform() rightNormal = (v: TriVec) => v ? v.rightNormalN() : Vec.emptyDirection;
  @transform() perpLeft = (v: TriVec) => v ? v.perpLeftN() : Vec.emptyDirection;
  @transform() perpRight = (v: TriVec) => v ? v.perpRightN() : Vec.emptyDirection;
  @transform() cartesian = (v: TriVec) => v ? v.cartesianN() : Vec.emptyDirection;
  @transform() direction = (v: TriVec) => v ? v.directionN() : Vec.emptyDirection;
  @transform() clone = (v: TriVec) => v ? v.clone() : Vec.emptyDirection;
}
