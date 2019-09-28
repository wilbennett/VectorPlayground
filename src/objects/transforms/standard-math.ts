import { Utils } from '../../utils';
import { transform } from '../decorators';
import { Tristate, ValueType } from '../../core';

const { isNumber, ONE_RADIAN, ONE_DEGREE } = Utils;

type TriNum = Tristate<number>;

// @ts-ignore - unused param.
class StandardMath {
  @transform(ValueType.number) abs = (x: TriNum) => isNumber(x) ? Math.abs(x) : NaN;
  @transform(ValueType.number) acos = Math.acos;
  @transform(ValueType.number) acosDeg = (x: TriNum) => isNumber(x) ? Math.acos(x) * ONE_RADIAN : NaN;
  @transform(ValueType.number) acosh = Math.acosh;
  @transform(ValueType.number) asin = Math.asin;
  @transform(ValueType.number) asinDeg = (x: TriNum) => isNumber(x) ? Math.asin(x) * ONE_RADIAN : NaN;
  @transform(ValueType.number) asinh = Math.asinh;
  @transform(ValueType.number) atan = Math.atan;
  @transform(ValueType.number) atanDeg = (x: TriNum) => isNumber(x) ? Math.atan(x) * ONE_RADIAN : NaN;
  @transform(ValueType.number) atanh = Math.atanh;
  @transform(ValueType.number) ceil = Math.ceil;
  @transform(ValueType.number) cbrt = Math.cbrt;
  @transform(ValueType.number) expm1 = Math.expm1;
  @transform(ValueType.number) clz32 = Math.clz32;
  @transform(ValueType.number) cos = Math.cos;
  @transform(ValueType.number) cosDeg = (x: TriNum) => isNumber(x) ? Math.cos(x * ONE_DEGREE) : NaN;
  @transform(ValueType.number) cosh = Math.cosh;
  @transform(ValueType.number) cube = (x: TriNum) => isNumber(x) ? x * x * x : NaN;
  @transform(ValueType.number) exp = Math.exp;
  @transform(ValueType.number) floor = Math.floor;
  @transform(ValueType.number) fround = Math.fround;
  @transform(ValueType.number) log = Math.log;
  @transform(ValueType.number) log1p = Math.log1p;
  @transform(ValueType.number) log2 = Math.log2;
  @transform(ValueType.number) log10 = Math.log10;
  @transform(ValueType.number) negative = (x: TriNum) => isNumber(x) ? -x : NaN;
  @transform(ValueType.number) RandomMax = (x: TriNum) => isNumber(x) ? Math.random() * x : NaN;
  @transform(ValueType.number) RandomMax1 = (x: TriNum) => isNumber(x) ? Math.random() * x : NaN;
  @transform(ValueType.number) round = Math.round;
  @transform(ValueType.number) sign = Math.sign;
  @transform(ValueType.number) sin = Math.sin;
  @transform(ValueType.number) sinDeg = (x: TriNum) => isNumber(x) ? Math.sin(x * ONE_DEGREE) : NaN;
  @transform(ValueType.number) sinh = Math.sinh;
  @transform(ValueType.number) sqr = (x: TriNum) => isNumber(x) ? x * x : NaN;
  @transform(ValueType.number) sqrt = Math.sqrt;
  @transform(ValueType.number) tan = Math.tan;
  @transform(ValueType.number) tanDeg = (x: TriNum) => isNumber(x) ? Math.tan(x) * ONE_RADIAN : NaN;
  @transform(ValueType.number) tanh = Math.tanh;
  @transform(ValueType.number) To_Degrees = (x: TriNum) => isNumber(x) ? x * ONE_RADIAN : NaN;
  @transform(ValueType.number) To_Radians = (x: TriNum) => isNumber(x) ? x * ONE_DEGREE : NaN;
  @transform(ValueType.number) trunc = Math.trunc;
}
