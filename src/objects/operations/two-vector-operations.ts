import { Calc2VecFunc } from '..';
import { calc2vec } from '../decorators';

// @ts-ignore - decorator implemented.
class TwoVectorOperations {
  @calc2vec("", "", "{p1} + {p2}") Add: Calc2VecFunc = (v1, v2) => v1.addN(v2);
  @calc2vec("", "", "{p1} - {p2}") Subtract: Calc2VecFunc = (v1, v2) => v1.subN(v2);
}
