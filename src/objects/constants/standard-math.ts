import { ValueType } from '../../core';
import { constant } from '../decorators';

// @ts-ignore - decoraator implemented.
class StandardMath {
  @constant(ValueType.number) e = Math.E;
  @constant(ValueType.number) LN10 = Math.LN10;
  @constant(ValueType.number) LN2 = Math.LN2;
  @constant(ValueType.number) LOG10e = Math.LOG10E;
  @constant(ValueType.number) LOG2ε = Math.LOG2E;
  @constant(ValueType.number) π = Math.PI;
  @constant(ValueType.number) "SQRT½" = Math.SQRT1_2;
  @constant(ValueType.number) SQRT2 = Math.SQRT2;
}
