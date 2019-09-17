import { CalcSettings, CalcValue, DrawObject, TextObject } from '..';
import { Category, IWorld, logEvent, promisedWorld, ValueMode, Vec } from '../../core';
import { ValueType } from '../../core/types';
import * as D from '../../decorators';
import { ChangeArgs } from '../../event-args';
import { Utils } from '../../utils';
import { BoolValue, ColorValue, NumberValue, VectorValue } from '../values';

// import { getVectorObjectFromSource } from './utils';

let world!: IWorld;
promisedWorld.then(w => world = w);

const { ONE_DEGREE, ONE_RADIAN, toNumber, toString } = Utils;
// const { checkType } = Utils;

// @D.dlogged({
//   setLogIf: args => args[0] === "result",
//   logCtor: false,
//   isDetail: false,
//   logAllProps: true,
//   propSetLogIf: self => self.name === "result",
//   propState: self => self.name,
//   logAllMethods: true,
//   methodSetLogIf: self => self.name === "result",
//   methodState: self => self.name,
// })
// @D.dlogged()
export class VectorObject extends DrawObject {
  private _drawOrigin: CalcSettings<Vec>;
  private _drawEnd: CalcSettings<Vec>;
  private _labelAngle: CalcSettings<number>;
  private _labelAngleDegrees: CalcSettings<number>;
  private _labelPosition: CalcSettings<Vec>;
  private _dataLabelPosition: CalcSettings<Vec>;
  private _calcSettings: CalcSettings<any>[];

  constructor(name: string, vector: Vec, public readonly isOrigin: boolean = false) {
    super(name, Category.vectorObject);

    const c = (caption: string) => `${this.name} ${caption}`;

    this._drawOrigin = new CalcSettings<Vec>(this.getDrawOrigin, this.vecToString, this.stringToVec, c("origin"));
    this._drawEnd = new CalcSettings<Vec>(this.getDrawEnd, this.vecToString, this.stringToVec, c("end"));
    this._labelAngle = new CalcSettings<number>(this.getLabelAngle, toString, toNumber, c("label angle"));
    this._labelAngleDegrees = new CalcSettings<number>(this.getLabelAngleDegrees, toString, toNumber, c("label angle deg"));
    this._labelPosition = new CalcSettings<Vec>(this.getLabelPosition, this.vecToString, this.stringToVec, c("label position"));
    this._dataLabelPosition = new CalcSettings<Vec>(this.getDataLabelPosition, this.vecToString, this.stringToVec, c("data position"));

    this._calcSettings = [
      this._drawOrigin,
      this._drawEnd,
      this._labelAngle,
      this._labelAngleDegrees,
      this._labelPosition,
      this._dataLabelPosition
    ];

    this.value = new VectorValue("value", vector);
    this.origin = new VectorValue("origin");
    this.end = new VectorValue("end");
    this.x = new NumberValue("x", vector.x);
    this.y = new NumberValue("y", vector.y);
    this.w = new NumberValue("w", vector.w);
    this.angle = new NumberValue("angle", vector.angle * ONE_RADIAN, -360, 360, 1);
    this.mag = new NumberValue("mag", vector.magnitude, 1, 100, 1);
    this.color = new ColorValue("color", "#0000FF");
    this.lineWidth = new NumberValue("line_width", 1, 1, 20, 1);
    this.rotate = new BoolValue("rotate", false);
    this.opacity = new NumberValue("opacity", 1, 0, 1, 0.1);
    this.rotateStep = new NumberValue("rotate_step", 0.1, -90, 90, 0.1);
    this.visible = new BoolValue("visible", true);

    this.drawOrigin = new CalcValue<Vec>("draw_origin", ValueType.vector, this._drawOrigin);
    this.drawEnd = new CalcValue<Vec>("draw_end", ValueType.vector, this._drawEnd);
    this.labelAngle = new CalcValue<number>("label_angle", ValueType.number, this._labelAngle);
    this.labelAngleDegrees = new CalcValue<number>("label_angle_degrees", ValueType.number, this._labelAngleDegrees);
    this.labelPosition = new CalcValue<Vec>("label_position", ValueType.vector, this._labelPosition);
    this.dataLabelPosition = new CalcValue<Vec>("data_label_position", ValueType.vector, this._dataLabelPosition);

    this.drawOrigin.isGlobal = false;
    this.drawEnd.isGlobal = false;
    this.labelAngle.isGlobal = false;
    this.labelAngleDegrees.isGlobal = false;
    this.labelPosition.isGlobal = false;
    this.dataLabelPosition.isGlobal = false;

    this.addChildren(
      this.x,
      this.y,
      this.w,
      this.value,
      this.angle,
      this.mag,
      this.color,
      this.lineWidth,
      this.opacity,
      this.origin,
      this.end,
      this.rotate,
      this.rotateStep,
      this.visible,
      this.drawOrigin,
      this.drawEnd,
      this.labelAngle,
      this.labelAngleDegrees,
      this.labelPosition,
      this.dataLabelPosition);

    if (!this.isOrigin) {
      this.label = this.createLabel();

      if (this.label)
        this.addChildren(this.label);
    }
  }

  readonly value: VectorValue;
  readonly origin: VectorValue;
  readonly end: VectorValue;
  readonly label?: TextObject;

  readonly x: NumberValue;
  readonly y: NumberValue;
  readonly w: NumberValue;
  readonly angle: NumberValue;
  readonly mag: NumberValue;
  readonly color: ColorValue;
  readonly lineWidth: NumberValue;
  readonly opacity: NumberValue;
  readonly rotate: BoolValue;
  readonly rotateStep: NumberValue;
  readonly visible: BoolValue;

  readonly drawOrigin: CalcValue<Vec>;
  readonly drawEnd: CalcValue<Vec>;
  readonly labelAngle: CalcValue<number>;
  readonly labelAngleDegrees: CalcValue<number>;
  readonly labelPosition: CalcValue<Vec>;
  readonly dataLabelPosition: CalcValue<Vec>;

  render(ctx: CanvasRenderingContext2D) {
    if (this.isOrigin) return;

    let vector = this.value.value || Vec.emptyDirection;

    if (this.rotate && this !== world.origin) {
      vector = vector.rotateN((this.rotateStep.value || 0) * ONE_DEGREE);
      this.value.value = vector;
    }

    if (!this.visible) return;

    world.drawVector(
      ctx,
      vector,
      this.drawOrigin.value!,
      this.lineWidth.value || 1,
      this.opacity.value || 1,
      this.color.value || "#000000");
  }

  private createPolar() {
    if (this.isOrigin) return;

    const angle = this.angle.value || 0;
    const mag = this.mag.value || 0;
    const w = this.w.value || 0;
    const vector = this.value.value;

    if (vector && angle === vector.angle && mag === vector.magnitude) return;

    this.value.value = Vec.fromPolar(angle * ONE_DEGREE, mag, w);
  }

  private createLabel() {
    if (this.isOrigin) return;

    const label = new TextObject(`${this.name}_label`, this.name);
    label.angle.mode = ValueMode.vector;
    label.angle.sourceValue = this.labelAngleDegrees;
    label.color.mode = ValueMode.vector;
    label.color.sourceValue = this.color;
    label.opacity.mode = ValueMode.vector;
    label.opacity.sourceValue = this.opacity;
    label.position.mode = ValueMode.vector;
    label.position.sourceValue = this.labelPosition;
    label.align.value = "center";
    label.visible.sourceValue = this.visible;
    return label;
  }

  private assignVectorValues() {
    const vector = this.value.value || Vec.emptyDirection;
    this.x.value = vector.x;
    this.y.value = vector.y;
    this.w.value = vector.w;
    this.angle.value = vector.angle * ONE_RADIAN;
    this.mag.value = vector.magnitude;
  }

  private getDrawOrigin() {
    const vector = this.value.value || Vec.emptyDirection;

    if (this.isOrigin) return vector;
    if (vector.isPoint) return world.origin.value.value || Vec.emptyDirection;

    return world.origin.value.value || Vec.emptyDirection;
    /*
    const endObject = getVectorObjectFromSource(this.end.sourceValue);

    if (endObject && endObject !== this) {
      let endPoint = this.end.value || Vec.emptyDirection;

      if (endPoint !== vector) {
        const transform = this.end.transform;
        endPoint = !transform || transform.adjustOrigin ? endObject.drawOrigin.value!.addN(endPoint) : endPoint;

        const result = endPoint.sub(vector).withW(1);
        return result;
      }
    }

    if (!this.origin.sourceValue) return world.origin.value.value || Vec.emptyDirection;

    let result = this.origin.value;

    if (!result || result === vector) return world.origin.value.value || Vec.emptyDirection;

    const origin = getVectorObjectFromSource(this.origin.sourceValue);
    const transform = this.origin.transform;
    result = !transform || transform.adjustOrigin ? origin.drawOrigin.value!.addN(result) : result;
    result = result.withW(1);
    return result;
    //*/
  }

  private getDrawEnd() { return this.drawOrigin.value!.addN(this.value.value || Vec.emptyDirection); }

  @D.clog(self => self.name)
  private getLabelAngleDegrees() {
    const vector = this.value.value || Vec.emptyDirection;

    if (this.isOrigin) return 0;
    if (!vector) return 0;

    const vAngle = vector.w === 0 ? vector.angle * ONE_RADIAN : 0;
    const result = vAngle < 90 || vAngle > 270 ? vAngle : vAngle + 180;
    return result;
  }

  @D.clog(self => self.name)
  private getLabelAngle() {
    const angle = this.getLabelAngleDegrees();
    return angle * ONE_DEGREE;
  }

  private getLabelPosition() {
    const vector = this.value.value;

    if (!vector) return undefined;

    if (vector.isPoint) {
      const result = vector.clone();
      result.y -= result.normalize().magnitude * 0.6;
      return result;
    }

    // const origin = this.origin.sourceValue;
    const vAngle = vector.angle * ONE_RADIAN;
    const initial = vAngle < 90 || vAngle > 270 ? vector.rightNormalN() : vector.leftNormalN();
    const result = initial.scale(0.6).add(this.drawOrigin.value!).add(vector.midPointN());
    // dlogDetail(`${this.name} get labelPos: calculated ${this._labelPos}`);
    return result;
  }

  @D.setDlog() @D.clog(self => self.name)
  private getDataLabelPosition() {
    const vector = this.value.value;

    if (!vector) return undefined;

    if (vector.isPoint) {
      const result = vector.clone();
      result.y += result.normalize().magnitude * 0.6;
      return result;
    }

    // const origin = this.origin.sourceValue;
    const vAngle = vector.angle * ONE_RADIAN;
    const initial = vAngle < 90 || vAngle > 270 ? vector.leftNormalN() : vector.rightNormalN();
    const result = initial.scale(0.6).add(this.drawOrigin.value!).add(vector.midPointN());
    return result;
  }

  @D.clog(self => self.name)
  private clearCalcValues() { this._calcSettings.forEach(cs => cs.setValue!.call(cs.instance, undefined)); }

  @D.setDlog() @D.clog(self => self.name) @logEvent
  protected onChildChanged(e: ChangeArgs) {
    if (this.isOrigin) return;
    // D.dlog(`sender: ${e.sender && (e.sender.propertyName || e.sender.name)}, ${e.oldValue} => ${e.newValue}`);
    if (e.sender instanceof CalcValue) return;

    this.clearCalcValues();

    if (e.sender === this.angle || e.sender === this.mag) {
      this.createPolar();
      return;
    }

    if (e.sender === this.x || e.sender === this.y || e.sender === this.w) {
      const vec = this.value.value || Vec.emptyDirection;

      if (e.sender === this.x)
        this.value.value = vec.withXYW(this.x.value || 0, vec.y, vec.w);
      else if (e.sender === this.y)
        this.value.value = vec.withXYW(vec.x, this.y.value || 0, vec.w);
      else if (e.sender === this.w)
        this.value.value = vec.withXYW(vec.x, vec.y, this.w.value || 0);

      this.assignVectorValues();
      return;
    }

    if (e.sender === this.value)
      this.assignVectorValues();
  }

  private vecToString(value?: Vec) { return toString(value); }
  // @ts-ignore - unused param.
  private stringToVec(value?: string) { return undefined; }
}
