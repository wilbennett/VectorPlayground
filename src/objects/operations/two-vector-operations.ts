import { Calc2VecFunc } from '..';
import { calc2vec } from '../decorators';

type T = Calc2VecFunc;

// @ts-ignore - decorator implemented.
class TwoVectorOperations {
  @calc2vec("", "", "{p1} + {p2}") Add: T = (v1, v2) => v1.addN(v2);
  @calc2vec("", "", "{p1} - {p2}") Subtract: T = (v1, v2) => v1.subN(v2);
}
