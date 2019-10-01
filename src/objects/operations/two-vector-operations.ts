import { Calc2VecFunc } from '..';
import { calc2vec } from '../decorators';

type T = Calc2VecFunc;

// @ts-ignore - decorator implemented.
class TwoVectorOperations {
  @calc2vec("<b>{p1} + {p2}</b><br/>[{p1}.x + {p2}.x, {p1}.y + {p2}.y, {p1}.w + {p2}.w]", "", "", "{p1} + {p2}")
  Add: T = (v1, v2) => v1.addN(v2);

  @calc2vec("<b>{p1} - {p2}</b><br/>[{p1}.x - {p2}.x, {p1}.y - {p2}.y, {p1}.w - {p2}.w]", "", "", "{p1} - {p2}")
  Subtract: T = (v1, v2) => v1.subN(v2);

  @calc2vec("<b>{p1} reflect {p2}</b>", "", "", "{p1} k {p2}")
  Reflect: T = (v1, v2) => v2.reflectOffN(v1);

  @calc2vec("<b>{p1} reflect off of {p2}</b>", "", "", "{p1} ʞ {p2}")
  Reflect_off: T = (v1, v2) => v1.reflectOffN(v2);
}
