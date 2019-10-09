import { Tristate, ValueType } from '../../core';
import { Utils } from '../../utils';
import { transform } from '../decorators';

const isNum = Utils.isNumber;

type TriNum = Tristate<number>;

// @ts-ignore - unused.
class Easings {
  @transform(ValueType.number, "linear({input})") static ease_linear = (t: TriNum) => t;
  @transform(ValueType.number, "smooth({input})") static ease_smooth_step = (t: TriNum) => isNum(t) ? t * t * (3 - 2 * t) : NaN;
  @transform(ValueType.number, "smoother({input})") static ease_smoother_step = (t: TriNum) => isNum(t) ? t * t * t * (t * (t * 6 - 15) + 10) : NaN;

  @transform(ValueType.number, "in({input}²)") static ease_in_quad = (t: TriNum) => isNum(t) ? t * t : NaN;
  @transform(ValueType.number, "in({input}³)") static ease_in_cubic = (t: TriNum) => isNum(t) ? t * t * t : NaN;
  @transform(ValueType.number, "in({input}⁴)") static ease_in_quartic = (t: TriNum) => isNum(t) ? t * t * t * t : NaN;
  @transform(ValueType.number, "in back({input})") static ease_in_back = (t: TriNum) => isNum(t) ? t * t * ((1.70158 + 1) * t - 1.70158) : NaN;
  @transform(ValueType.number, "in elastic({input})") static ease_in_elastic = (t: TriNum) => isNum(t) ? t === 1 ? 1 : 0.04 * t / (--t) * Math.sin(25 * t) : NaN;
  @transform(ValueType.number, "in elastic2({input})") static ease_in_elastic2 = makeElastic2(3);
  @transform(ValueType.number, "in elastic3({input})") static ease_in_elastic3 = makeElastic3(3, 3);
  @transform(ValueType.number, "in bounce({input})") static ease_in_bounce = makeBounce(3);
  @transform(ValueType.number, "in bounce2({input})") static ease_in_bounce2 = makeBounce2(3);

  @transform(ValueType.number, "in catN84({input})") static ease_in_catN84 = (t: TriNum) => isNum(t) ? catmullRom(t, -8, 4) : NaN;
  @transform(ValueType.number, "in cat10({input})") static ease_in_cat10 = (t: TriNum) => isNum(t) ? catmullRom(t, 1, 0) : NaN;
  @transform(ValueType.number, "in cat2N1({input})") static ease_in_cat2N1 = (t: TriNum) => isNum(t) ? catmullRom(t, 2, -1) : NaN;
  @transform(ValueType.number, "in cat010({input})") static ease_in_cat010 = (t: TriNum) => isNum(t) ? catmullRom(t, 0, 10) : NaN;
  @transform(ValueType.number, "in catN101({input})") static ease_in_catN101 = (t: TriNum) => isNum(t) ? catmullRom(t, -10, 1) : NaN;

  @transform(ValueType.number, "out({input}²)") static ease_out_quad = (t: TriNum) => isNum(t) ? 1 - (t = 1 - t) * t : NaN;
  @transform(ValueType.number, "out({input}³)") static ease_out_cubic = (t: TriNum) => isNum(t) ? 1 - (t = 1 - t) * t * t : NaN;
  @transform(ValueType.number, "out({input}⁴)") static ease_out_quartic = (t: TriNum) => isNum(t) ? 1 - (t = 1 - t) * t * t * t : NaN;
  @transform(ValueType.number, "out back({input})") static ease_out_back = (t: TriNum) => isNum(t) ? 1 - ((t = 1 - t) * t * ((1.70158 + 1) * t - 1.70158)) : NaN;
  @transform(ValueType.number, "out elastic({input})") static ease_out_elastic = (t: TriNum) => isNum(t) ? t === 0 ? 0 : (0.04 - 0.04 / t) * Math.sin(25 * t) + 1 : NaN;
  @transform(ValueType.number, "out elastic2({input})") static ease_out_elastic2 = (t: TriNum) => isNum(t) ? out(makeElastic2(3), t) : NaN;
  @transform(ValueType.number, "out bounce({input})") static ease_out_bounce = (t: TriNum) => isNum(t) ? out(makeBounce(3), t) : NaN;
  @transform(ValueType.number, "out bounce2({input})") static ease_out_bounce2 = (t: TriNum) => isNum(t) ? out(makeBounce2(3), t) : NaN;

  @transform(ValueType.number, "out catN84({input})") static ease_out_catN84 = (t: TriNum) => { return isNum(t) ? 1 - catmullRom(1 - t, -8, 4) : NaN; }
  @transform(ValueType.number, "out cat10({input})") static ease_out_cat10 = (t: TriNum) => { return isNum(t) ? 1 - catmullRom(1 - t, 1, 0) : NaN; }
  @transform(ValueType.number, "out cat2N1({input})") static ease_out_cat2N1 = (t: TriNum) => { return isNum(t) ? 1 - catmullRom(1 - t, 2, -1) : NaN; }
  @transform(ValueType.number, "out cat010({input})") static ease_out_cat010 = (t: TriNum) => { return isNum(t) ? 1 - catmullRom(1 - t, 0, 10) : NaN; }
  @transform(ValueType.number, "out catN101({input})") static ease_out_catN101 = (t: TriNum) => { return isNum(t) ? 1 - catmullRom(1 - t, -10, 1) : NaN; }

  @transform(ValueType.number, "inout({input}²)") static ease_inout_quad = (t: TriNum) => isNum(t) ? inOut(Easings.ease_in_quad, t) : NaN;
  @transform(ValueType.number, "inout({input}³)") static ease_inout_cubic = (t: TriNum) => isNum(t) ? inOut(Easings.ease_in_cubic, t) : NaN;
  @transform(ValueType.number, "inout({input}⁴)") static ease_inout_quartic = (t: TriNum) => isNum(t) ? inOut(Easings.ease_in_quartic, t) : NaN;
  @transform(ValueType.number, "inout back({input})") static ease_inout_back = (t: TriNum) => isNum(t) ? inOut(halfBack, t) : NaN;
  @transform(ValueType.number, "inout back2({input})") static ease_inout_back2 = (t: TriNum) => isNum(t) ? inOut(Easings.ease_in_back, t) : NaN;
  @transform(ValueType.number, "inout elastic({input})") static ease_inout_elastic = (t: TriNum) => isNum(t) ? inOut(Easings.ease_in_elastic, t) : NaN;
  @transform(ValueType.number, "inout elastic2({input})") static ease_inout_elastic2 = (t: TriNum) => isNum(t) ? inOut(makeElastic2(3), t) : NaN;
  @transform(ValueType.number, "inout bounce({input})") static ease_inout_bounce = (t: TriNum) => isNum(t) ? inOut(makeBounce(3), t) : NaN;
  @transform(ValueType.number, "inout bounce2({input})") static ease_inout_bounce2 = (t: TriNum) => isNum(t) ? inOut(makeBounce2(3), t) : NaN;

  @transform(ValueType.number, "inout catN84({input})") static ease_inout_catN84 = (t: TriNum) => isNum(t) ? inOut(Easings.ease_out_catN84, t) : NaN;
  @transform(ValueType.number, "inout cat10({input})") static ease_inout_cat10 = (t: TriNum) => isNum(t) ? inOut(Easings.ease_out_cat10, t) : NaN;
  @transform(ValueType.number, "inout cat2N1({input})") static ease_inout_cat2N1 = (t: TriNum) => isNum(t) ? inOut(Easings.ease_out_cat2N1, t) : NaN;
  @transform(ValueType.number, "inout cat010({input})") static ease_inout_cat010 = (t: TriNum) => isNum(t) ? inOut(Easings.ease_out_cat010, t) : NaN;
  @transform(ValueType.number, "inout catN101({input})") static ease_inout_catN101 = (t: TriNum) => isNum(t) ? inOut(Easings.ease_out_catN101, t) : NaN;
}

function out(ease: (x: number) => number, t: number) {
  return 1 - ease(1 - t);
}

function inOut(ease: (x: number) => number, t: number) {
  return t < 0.5
    ? ease(t * 2) * 0.5
    : (1 - ease((1 - t) * 2)) * 0.5 + 0.5;
}

function makeElastic2(crosses: number) {
  return (t: TriNum) => {
    if (!isNum(t)) return NaN;

    t = 1 - t;
    return 1 - (((1 - Math.cos(t * Math.PI * crosses)) * (1 - t)) + t);
  };
}

function makeElastic3(cycles: number, stiffness: number) {
  cycles = Math.max(cycles, 0);
  stiffness = Math.max(stiffness, 0);

  return (t: TriNum) => {
    if (!isNum(t)) return NaN;

    const exp = stiffness === 0 ? t : (Math.exp(stiffness * t) - 1) / (Math.exp(stiffness) - 1);
    return exp * (Math.sin((2 * Math.PI * cycles + Math.PI * 0.5) * t));
  }
}

function makeBounce(bounces: number) {
  const elastic = makeElastic2(bounces);

  return (t: TriNum) => {
    if (!isNum(t)) return NaN;

    const t2 = elastic(t);
    // return t2 <= 1 ? t2 : 2 - t2;
    return Math.abs(t2);
  }
}

// @ts-ignore - unused param.
function makeBounce2(bounces: number) {
  const elastic = Easings.ease_in_elastic;

  return (t: TriNum) => {
    if (!isNum(t)) return NaN;

    const t2 = elastic(t);
    // return t2 <= 1 ? t2 : 2 - t2;
    return Math.abs(t2);
  }
}

function halfBack(t: number) {
  const s = 1.70158 * 1.525;
  return t * t * ((s + 1) * t - s);
}

function catmullRom(t: number, p0: number, p3: number) {
  const p1 = 0;
  const p2 = 1;

  return 0.5 * (
    (2 * p1)
    + (-p0 + p2) * t
    + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t
    + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
  );
}
