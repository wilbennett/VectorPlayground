import { Calculation, ColorValue, NumberValue, Operation, TransformRef, TransformValue } from '..';
import { IWorld, promisedWorld, ValueType, Vec } from '../../core';

let world!: IWorld;
const worldAssigned = promisedWorld.then(w => world = w);

export class Graph extends Calculation {
  private _points?: Vec[];

  constructor() {
    super(Graph.name);

    this.graphFunction = new TransformValue("function", ValueType.number, 0);
    this.graphFunctionRef = new TransformRef("function", this.graphFunction);
    this.startX = new NumberValue("start_x", 0, undefined, undefined, 0.1);
    this.endX = new NumberValue("end_x", 10, undefined, undefined, 0.1);
    this.step = new NumberValue("step", 0.1, undefined, undefined, 0.1);
    this.scaleX = new NumberValue("x_scale", 1, undefined, undefined, 0.1);
    this.scaleY = new NumberValue("y_scale", 1, undefined, undefined, 0.1);
    this.offsetX = new NumberValue("x_offset", 0, undefined, undefined, 0.1);
    this.offsetY = new NumberValue("y_offset", 0, undefined, undefined, 0.1);
    this.color = new ColorValue("color", "#007755");
    this.thickness = new NumberValue("thickness", 1);

    this.addChildren(
      this.graphFunctionRef,
      this.graphFunction,
      this.startX,
      this.endX,
      this.step,
      this.scaleX,
      this.scaleY,
      this.offsetX,
      this.offsetY,
      this.color,
      this.thickness);

    this.graphFunctionRef.captionRoot = this.graphFunctionRef.title;

    this._descriptionFormat = `<b>graph {func}</b><br/>Graph {funcstart} to {funcend}`;
  }

  graphFunction: TransformValue<number>;
  graphFunctionRef: TransformRef<number>;
  startX: NumberValue;
  endX: NumberValue;
  step: NumberValue;
  scaleX: NumberValue;
  scaleY: NumberValue;
  offsetX: NumberValue;
  offsetY: NumberValue;
  color: ColorValue;
  thickness: NumberValue;

  protected renderCore(ctx: CanvasRenderingContext2D) {
    if (!this._points) return;

    const points = this._points;

    ctx.save();
    ctx.strokeStyle = this.color.value;
    ctx.lineWidth = world.convertThickness(this.thickness.value);
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }

    ctx.stroke();
    ctx.restore();
  }

  protected updateCore() {
    if (!this.graphFunction.transform) return;

    const count = Math.floor((this.endX.value - this.startX.value) / this.step.value + 1);

    this._points = new Array<Vec>(count);
    const points = this._points;
    const endX = this.endX.value;
    const scaleX = this.scaleX.value;
    const scaleY = this.scaleY.value;
    const offsetX = this.offsetX.value;
    const offsetY = this.offsetY.value;
    const step = this.step.value;
    let x = this.startX.value;

    for (let i = 0; i < count; i++) {
      const y = this.graphFunction.transformValue(x) || 0;
      points[i] = new Vec(x * scaleX + offsetX, y * scaleY + offsetY, 1);
      x = Math.min(x + step, endX);
    }
  }

  protected calcDescription() {
    let format = this.descriptionFormat;
    format = format.replace(new RegExp(`{func}`, "g"), this.graphFunctionRef.getMathText());
    format = format.replace(new RegExp(`{funcstart}`, "g"), this.graphFunctionRef.getMathText(this.startX.getMathText()));
    format = format.replace(new RegExp(`{funcend}`, "g"), this.graphFunctionRef.getMathText(this.endX.getMathText()));
    return format;
  }
}

worldAssigned.then(world => world.addObjects(new Operation(Graph.name, Graph)));
