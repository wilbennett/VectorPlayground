export class Vec {
  constructor();
  constructor(x: number, y: number, w?: number);
  constructor(public x: number = 0, public y: number = 0, public w: number = 1) {
  }

  get isPoint() { return this.w !== 0; }
  get isDirection() { return this.w === 0; }
  get isScaled() { return this.w !== 0 && this.w !== 1; }
  get magnitudeSquared() { return this.x * this.x + this.y * this.y; }
  get magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y); }

  get angle() {
    const res = Math.atan2(this.y, this.x);
    return res >= 0 ? res : res + 2 * Math.PI;
  }

  static get emptyPosition() { return new Vec(0, 0, 1); }
  static get emptyDirection() { return new Vec(0, 0, 0); }

  equals(other: Vec) {
    return this.x === other.x && this.y === other.y && this.w === other.w;
  }

  cartesianO(result: Vec) {
    return this.isScaled ? result.withXYW(this.x / this.w, this.y / this.w, 1) : this.withWO(result, 1);
  }
  cartesianN() { return this.cartesianO(new Vec()); }
  cartesian() { return this.cartesianO(this); }

  directionO(result: Vec) {
    // let res = this.isScaled ? this.cartesianO(result) : this.cloneO(result);
    let res = this.cloneO(result);
    return res.withW(0);
  }
  directionN() { return this.directionO(new Vec()); }
  direction() { return this.directionO(this); }

  withXO(result: Vec, value: number) { return result.withXYW(value, this.y, this.w); }
  withXN(value: number) { return new Vec(value, this.y, this.w); }
  withX(value: number) {
    this.x = value;
    return this;
  }

  withYO(result: Vec, value: number) { return result.withXYW(this.x, value, this.w); }
  withYN(value: number) { return new Vec(this.x, value, this.w); }
  withY(value: number) {
    this.y = value;
    return this;
  }

  withWO(result: Vec, value: number) { return result.withXYW(this.x, this.y, value); }
  withWN(value: number) { return new Vec(this.x, this.y, value); }
  withW(value: number) {
    this.w = value;
    return this;
  }

  withXYW(x: number, y: number, w: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    return this;
  }

  copyFrom(other: Vec) {
    this.x = other.x;
    this.y = other.y;
    this.w = other.w;
    return this;
  }

  displaceByO(result: Vec, other: Vec) { return result.withXYW(this.x + other.x, this.y + other.y, this.w); }
  displaceByN(other: Vec) { return this.displaceByO(new Vec(), other); }
  displaceBy(other: Vec) { return this.displaceByO(this, other); }

  addO(result: Vec, other: Vec) { return result.withXYW(this.x + other.x, this.y + other.y, this.w + other.w); }
  addN(other: Vec) { return this.addO(new Vec(), other); }
  add(other: Vec) { return this.addO(this, other); }

  addScaledO(result: Vec, other: Vec, scale: number) {
    return result.withXYW(this.x + other.x * scale, this.y + other.y * scale, this.w + other.w * scale);
  }
  addScaledN(other: Vec, scale: number) { return this.addScaledO(new Vec(), other, scale); }
  addScaled(other: Vec, scale: number) { return this.addScaledO(this, other, scale); }

  subO(result: Vec, other: Vec) { return result.withXYW(this.x - other.x, this.y - other.y, this.w - other.w); }
  subN(other: Vec) { return this.subO(new Vec(), other); }
  sub(other: Vec) { return this.subO(this, other); }

  scaleO(result: Vec, scale: number) { return result.withXYW(this.x * scale, this.y * scale, this.w * scale); }
  scaleN(scale: number) { return this.scaleO(new Vec(), scale); }
  scale(scale: number) { return this.scaleO(this, scale); }

  multO(result: Vec, scaleX: number, scaleY: number) { return result.withXYW(this.x * scaleX, this.y * scaleY, this.w); }
  multN(scaleX: number, scaleY: number) { return this.multO(new Vec(), scaleX, scaleY); }
  mult(scaleX: number, scaleY: number) { return this.multO(this, scaleX, scaleY); }

  divO(result: Vec, scale: number) { scale = 1 / scale; return result.withXYW(this.x * scale, this.y * scale, this.w * scale); }
  divN(scale: number) { return this.divO(new Vec(), scale); }
  div(scale: number) { return this.divO(this, scale); }

  normalizeO(result: Vec) { const scale = 1 / this.magnitude; return result.withXYW(this.x * scale, this.y * scale, this.w); }
  normalizeN() { return this.normalizeO(new Vec()); }
  normalize() { return this.normalizeO(this); }

  normalizeScaleO(result: Vec, scale: number) {
    scale /= this.magnitude;
    return result.withXYW(this.x * scale, this.y * scale, this.w * scale);
  }
  normalizeScaleN(scale: number) { return this.normalizeScaleO(new Vec(), scale); }
  normalizeScale(scale: number) { return this.normalizeScaleO(this, scale); }

  negateO(result: Vec) { return result.withXYW(-this.x, -this.y, this.w); }
  negateN() { return this.negateO(new Vec()); }
  negate() { return this.negateO(this); }

  perpLeftO(result: Vec) { return result.withXYW(-this.y, this.x, this.w); }
  perpLeftN() { return this.perpLeftO(new Vec()); }
  perpLeft() { return this.perpLeftO(this); }

  perpRightO(result: Vec) { return result.withXYW(this.y, -this.x, this.w); }
  perpRightN() { return this.perpRightO(new Vec()); }
  perpRight() { return this.perpRightO(this); }

  midPointO(result: Vec) { return this.scaleO(result, 0.5); }
  midPointN() { return this.midPointO(new Vec()); }
  midPoint() { return this.midPointO(this); }

  leftNormalO(result: Vec) { return this.perpLeftO(result).normalize(); }
  leftNormalN() { return this.leftNormalO(new Vec()); }
  leftNormal() { return this.leftNormalO(this); }

  rightNormalO(result: Vec) { return this.perpRightO(result).normalize(); }
  rightNormalN() { return this.rightNormalO(new Vec()); }
  rightNormal() { return this.rightNormalO(this); }

  cloneO(result: Vec) { return result.withXYW(this.x, this.y, this.w); }
  clone() { return new Vec(this.x, this.y, this.w); }

  dot(other: Vec) { return this.x * other.x + this.y * other.y + 0; }
  cross(other: Vec) { return this.x * other.y - this.y * other.x; }

  split(normal: Vec, parallel: Vec, tangent: Vec) {
    const dot = this.dot(normal);
    normal.scaleO(parallel, dot).withW(0);
    this.subO(tangent, parallel).withW(0);
    return this;
  }

  projectOnO(result: Vec, other: Vec) {
    const dot = this.dot(other);
    const t = dot / other.dot(other);
    return result.withXYW(this.x * t, this.y * t, 0);
  }
  projectOnN(other: Vec) { return this.projectOnO(new Vec(), other); }
  projectOn(other: Vec) { return this.projectOnO(this, other); }

  projectOnNormalO(result: Vec, normalized: Vec) {
    const dot = this.dot(normalized);
    return result.withXYW(normalized.x * dot, normalized.y * dot, 0);
  }
  projectOnNormalN(normalized: Vec) { return this.projectOnNormalO(new Vec(), normalized); }
  projectOnNormal(normalized: Vec) { return this.projectOnNormalO(this, normalized); }

  reflectOffNormalO(result: Vec, normal: Vec, parallel?: Vec, tangent?: Vec) {
    parallel = parallel || new Vec();
    tangent = tangent || new Vec();
    this.split(normal, parallel, tangent);
    return tangent.subO(result, parallel);
  }
  reflectOffNormalN(normal: Vec, parallel?: Vec, tangent?: Vec) {
    return this.reflectOffNormalO(new Vec(), normal, parallel, tangent);
  }
  reflectOffNormal(normal: Vec, parallel?: Vec, tangent?: Vec) {
    return this.reflectOffNormalO(this, normal, parallel, tangent);
  }

  reflectO(result: Vec, other: Vec, parallel?: Vec, tangent?: Vec) {
    return other.reflectOffNormalO(result, this.leftNormalN(), parallel, tangent);
  }
  reflectN(other: Vec, parallel?: Vec, tangent?: Vec) {
    return other.reflectOffNormalO(new Vec(), this.leftNormalN(), parallel, tangent);
  }
  reflect(other: Vec, parallel?: Vec, tangent?: Vec) {
    return other.reflectOffNormalO(other, this.leftNormalN(), parallel, tangent);
  }

  reflectOffO(result: Vec, other: Vec, parallel?: Vec, tangent?: Vec) {
    return this.reflectOffNormalO(result, other.leftNormalN(), parallel, tangent);
  }
  reflectOffN(other: Vec, parallel?: Vec, tangent?: Vec) {
    return this.reflectOffNormalO(new Vec(), other.leftNormalN(), parallel, tangent);
  }
  reflectOff(other: Vec, parallel?: Vec, tangent?: Vec) {
    return this.reflectOffNormalO(this, other.leftNormalN(), parallel, tangent);
  }

  clampO(result: Vec, min: Vec, max: Vec) {
    const x = this.x < min.x ? min.x : this.x > max.x ? max.x : this.x;
    const y = this.y < min.y ? min.y : this.y > max.y ? max.y : this.y;
    const w = this.w < min.w ? min.w : this.w > max.w ? max.w : this.w;
    return result.withXYW(x, y, w);
  }
  clampN(min: Vec, max: Vec) { return this.clampO(new Vec(), min, max); }
  clamp(min: Vec, max: Vec) { return this.clampO(this, min, max); }

  rotateO(result: Vec, radians: number) {
    const sin = Math.sin(radians);
    const cos = Math.cos(radians);
    const x = this.x;
    const y = this.y;

    return result.withXYW(x * cos - y * sin, x * sin + y * cos, this.w);
  }
  rotateN(radians: number) { return this.rotateO(new Vec(), radians); }
  rotate(radians: number) { return this.rotateO(this, radians); }

  draw(ctx: CanvasRenderingContext2D, radius: number) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  toString() {
    return this.isPoint
      ? `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.w.toFixed(2)})`
      : `[${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.w.toFixed(2)}]`;
  }

  static fromPolarO(result: Vec, radians: number, magnitude: number, w: number = 1) {
    return result.withXYW(Math.cos(radians) * magnitude, Math.sin(radians) * magnitude, w);
  }
  static fromPolar(radians: number, magnitude: number, w: number = 1) {
    return this.fromPolarO(new Vec(), radians, magnitude, w);
  }
}

