import { Tristate, Vec, ValueType } from '../../core';
import { transform} from '../decorators';

type TriVec = Tristate<Vec>;

// @ts-ignore - unused param.
class VectorTransforms {
  @transform(ValueType.vector) normalize = (v: TriVec) => v ? v.normalizeN() : Vec.emptyDirection;
  @transform(ValueType.vector) midpoint = (v: TriVec) => v ? v.midPointN() : Vec.emptyDirection;
  @transform(ValueType.vector) negate = (v: TriVec) => v ? v.negateN() : Vec.emptyDirection;
  @transform(ValueType.vector) leftNormal = (v: TriVec) => v ? v.leftNormalN() : Vec.emptyDirection;
  @transform(ValueType.vector) rightNormal = (v: TriVec) => v ? v.rightNormalN() : Vec.emptyDirection;
  @transform(ValueType.vector) perpLeft = (v: TriVec) => v ? v.perpLeftN() : Vec.emptyDirection;
  @transform(ValueType.vector) perpRight = (v: TriVec) => v ? v.perpRightN() : Vec.emptyDirection;
  @transform(ValueType.vector) cartesian = (v: TriVec) => v ? v.cartesianN() : Vec.emptyDirection;
  @transform(ValueType.vector) direction = (v: TriVec) => v ? v.directionN() : Vec.emptyDirection;
  @transform(ValueType.vector) clone = (v: TriVec) => v ? v.clone() : Vec.emptyDirection;
}
