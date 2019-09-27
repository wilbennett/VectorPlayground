import { BoolValue, CalcSettings, CalcValue, ColorValue, DrawObject, NumberValue, TextObject, VectorValue } from '..';
import { Category, IWorld, logEvent, promisedWorld, ValueMode, Vec } from '../../core';
import { DisplayType, ValueType } from '../../core/types';
import * as D from '../../decorators';
import { ChangeArgs } from '../../event-args';
import { Utils } from '../../utils';

console.log("VectorObject init start");
// import { getVectorObjectFromSource } from './utils';

let world!: IWorld;
promisedWorld.then(w => world = w);

const { ONE_DEGREE, ONE_RADIAN, toNumber, toString } = Utils;
// const { checkType } = Utils;

@D.dlogged({
  // setLogIf: args => args[0] !== "origin",
  logCtor: false,
  isDetail: false,
  logAllProps: true,
  // propSetLogIf: () => true,
  propState: self => self.name,
  logAllMethods: true,
  // methodSetLogIf: () => true,
  methodState: self => self.name,
})
// @D.dlogged()
export class VectorObject extends DrawObject {
  private _settingValue = false;
  private _assigningValues = false;
  private _drawOrigin: CalcSettings<Vec>;
  private _drawEnd: CalcSettings<Vec>;
  private _labelAngle: CalcSettings<number>;
  private _labelAngleDegrees: CalcSettings<number>;
  private _labelPosition: CalcSettings<Vec>;
  private _dataLabelPosition: CalcSettings<Vec>;
  private _calcSettings: CalcSettings<any>[];

  constructor(name: string, vector: Vec, public readonly isOrigin: boolean = false) {
    super(name, Category.vectorObject);

    const nameText = Utils.formatVectorName(this.name);
    const c = (caption: string) => `${nameText} ${caption}`;

    this._drawOrigin = new CalcSettings<Vec>(this.getDrawOrigin, this.vecToString, this.stringToVec, c("Draw Origin"));
    this._drawEnd = new CalcSettings<Vec>(this.getDrawEnd, this.vecToString, this.stringToVec, c("Draw End"));
    this._labelAngle = new CalcSettings<number>(this.getLabelAngle, toString, toNumber, c("Label Angle"));
    this._labelAngleDegrees = new CalcSettings<number>(this.getLabelAngleDegrees, toString, toNumber, c("Label Angle°"));
    this._labelPosition = new CalcSettings<Vec>(this.getLabelPosition, this.vecToString, this.stringToVec, c("Label Position"));
    this._dataLabelPosition = new CalcSettings<Vec>(this.getDataLabelPosition, this.vecToString, this.stringToVec, c("Data Position"));

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
    this.angle = new NumberValue("angle", vector.angle * ONE_RADIAN, 0, 360, 1);
    this.mag = new NumberValue("mag", vector.magnitude, 1, 100, 1);
    this.color = new ColorValue("color", "#0000FF");
    this.lineWidth = new NumberValue("line_width", 1, 1, 20, 1);
    this.rotate = new BoolValue("rotate", false);
    this.opacity = new NumberValue("opacity", 1, 0, 1, 0.1);
    this.rotateStep = new NumberValue("rotate_step", 1, -90, 90, 0.1);
    this.visible = new BoolValue("visible", true);

    this.drawOrigin = new CalcValue<Vec>("draw_origin", ValueType.vector, Vec.emptyPosition, this._drawOrigin);
    this.drawEnd = new CalcValue<Vec>("draw_end", ValueType.vector, Vec.emptyPosition, this._drawEnd);
    this.labelAngle = new CalcValue<number>("label_angle", ValueType.number, 0, this._labelAngle);
    this.labelAngleDegrees = new CalcValue<number>("label_angle_degrees", ValueType.number, 0, this._labelAngleDegrees);
    this.labelPosition = new CalcValue<Vec>("label_position", ValueType.vector, Vec.emptyPosition, this._labelPosition);
    this.dataPosition = new CalcValue<Vec>("data_position", ValueType.vector, Vec.emptyPosition, this._dataLabelPosition);

    this.drawOrigin.isGlobal = false;
    this.drawEnd.isGlobal = false;
    this.labelAngle.isGlobal = false;
    this.labelAngleDegrees.isGlobal = false;
    this.labelPosition.isGlobal = false;
    this.dataPosition.isGlobal = false;

    this.angle.displayType = DisplayType.range;
    this.mag.displayType = DisplayType.range;
    this.lineWidth.displayType = DisplayType.range;
    this.opacity.displayType = DisplayType.range;

    this.value.mode = ValueMode.text;
    this.value.caption = nameText;

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
      this.dataPosition);

    if (!this.isOrigin) {
      this.label = this.createLabel();
      this.addChildren(this.label);
      this.setLabelReferences();
    }

    if (this.isOrigin) {
      this.origin.isLocal = false;
      this.end.isLocal = false;
      this.drawOrigin.isLocal = false;
      this.drawEnd.isLocal = false;
      this.labelAngle.isLocal = false;
      this.labelAngleDegrees.isLocal = false;
      this.labelPosition.isLocal = false;
      this.dataPosition.isLocal = false;
      this.angle.isLocal = false;
      this.mag.isLocal = false;
      this.color.isLocal = false;
      this.lineWidth.isLocal = false;
      this.opacity.isLocal = false;
      this.rotate.isLocal = false;
      this.rotateStep.isLocal = false;
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
  readonly dataPosition: CalcValue<Vec>;

  protected renderCore(ctx: CanvasRenderingContext2D) {
    if (this.isOrigin) return;
    if (!this.visible.value) return;

    world.drawVector(
      ctx,
      this.value.value,
      this.drawOrigin.value,
      this.lineWidth.value,
      this.opacity.value,
      this.color.value);
  }

  protected updateCore() {
    if (this.isOrigin) return;
    if (!this.rotate.value) return;

    let vector = this.value.value;
    this.setValue(vector.rotateN(this.rotateStep.value * ONE_DEGREE));
  }

  @D.setDlog() @D.clog(self => self.name)
  private createPolar() {
    if (this.isOrigin) return;

    const angle = this.angle.value;
    const mag = this.mag.value;
    const w = this.w.value;
    const vector = this.value.value;

    if (vector && angle === vector.angle && mag === vector.magnitude) return;

    this.setValue(Vec.fromPolar(angle * ONE_DEGREE, mag, w));
  }

  private createLabel() {
    const nameText = Utils.formatVectorName(this.name);
    return new TextObject(`${nameText}_label`, nameText);
  }

  private setLabelReferences() {
    if (!this.label) return;

    this.label.angle.mode = ValueMode.vector;
    this.label.angle.sourceValue = this.labelAngleDegrees;
    this.label.color.mode = ValueMode.vector;
    this.label.color.sourceValue = this.color;
    this.label.opacity.mode = ValueMode.vector;
    this.label.opacity.sourceValue = this.opacity;
    this.label.position.mode = ValueMode.vector;
    this.label.position.sourceValue = this.labelPosition;
    this.label.align.value = "center";
    this.label.visible.mode = ValueMode.vector;
    this.label.visible.sourceValue = this.visible;
  }

  private setValue(value: Vec): void;
  private setValue(x: number, y: number, w: number): void;
  private setValue(param1: Vec | number, y?: number, w?: number): void {
    if (this._settingValue) return;

    const value = param1 instanceof Vec
      ? param1
      : new Vec(param1, y!, w);

    this._settingValue = true;

    try {
      this.value.value = this.value.value !== value ? value : value.clone();
      this.assignVectorValues();
    } finally {
      this._settingValue = false;
    }
  }

  private assignVectorValues() {
    if (this._assigningValues) return;

    this._assigningValues = true;

    try {
      const vector = this.value.value;
      this.x.value = vector.x;
      this.y.value = vector.y;
      this.w.value = vector.w;
      this.angle.value = vector.angle * ONE_RADIAN;
      this.mag.value = vector.magnitude;
      this.clearCalcValues();
    } finally {
      this._assigningValues = false;
    }
  }

  private getDrawOrigin() {
    const vector = this.value.value;

    if (this.isOrigin) return vector;
    if (vector.isPoint) return world.origin.value.value;

    return world.origin.value.value;
    /*
    const endObject = getVectorObjectFromSource(this.end.sourceValue);

    if (endObject && endObject !== this) {
      let endPoint = this.end.value;

      if (endPoint !== vector) {
        const transform = this.end.transform;
        endPoint = !transform || transform.adjustOrigin ? endObject.drawOrigin.value!.addN(endPoint) : endPoint;

        const result = endPoint.sub(vector).withW(1);
        return result;
      }
    }

    if (!this.origin.sourceValue) return world.origin.value.value;

    let result = this.origin.value;

    if (!result || result === vector) return world.origin.value.value;

    const origin = getVectorObjectFromSource(this.origin.sourceValue);
    const transform = this.origin.transform;
    result = !transform || transform.adjustOrigin ? origin.drawOrigin.value!.addN(result) : result;
    result = result.withW(1);
    return result;
    //*/
  }

  private getDrawEnd() { return this.drawOrigin.value.addN(this.value.value); }

  @D.clog(self => self.name)
  private getLabelAngleDegrees() {
    const vector = this.value.value;

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

  @D.clog(self => self.name)
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

  @D.clog(self => self.name) @logEvent
  protected onChildChanged(e: ChangeArgs) {
    if (this.isOrigin) return;
    // D.dlog(`sender: ${e.sender && (e.sender.propertyName || e.sender.name)}, ${e.oldValue} => ${e.newValue}`);
    if (this._settingValue) return;
    if (this._assigningValues) return;
    if (e.sender instanceof CalcValue) return;

    if (e.sender === this.angle || e.sender === this.mag)
      return this.createPolar();

    if (e.sender === this.x || e.sender === this.y || e.sender === this.w)
      return this.setValue(this.x.value, this.y.value, this.w.value);

    if (e.sender === this.value)
      this.assignVectorValues();
  }

  private vecToString(value?: Vec) { return toString(value); }
  // @ts-ignore - unused param.
  private stringToVec(value?: string) { return undefined; }
}
console.log("VectorObject init end");
