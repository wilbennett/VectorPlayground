import { BoolValue, ColorValue, DrawObject, NumberValue, StringValue, TextValue, VectorValue } from '..';
import { Category, DisplayType, IWorld, promisedWorld, Vec } from '../../core';
import { Utils } from '../../utils';

let world!: IWorld;
promisedWorld.then(w => world = w);

const { toNumber, toString } = Utils;

export class TextObject extends DrawObject {
  constructor(name: string, text: string) {
    super(name, Category.textObject);

    this.round = new BoolValue("round", false);
    this.roundTo = new NumberValue("round_to", 2);
    this.align = new StringValue("align", "start");
    this.visible = new BoolValue("visible", true);
    this.text = new TextValue("text", text);
    this.size = new NumberValue("size", 15);
    this.angle = new NumberValue("angle", 0);
    this.color = new ColorValue("color", "#0000FF");
    this.opacity = new NumberValue("opacity", 1, 0, 1);
    this.position = new VectorValue("position");

    this.text.alwaysShowText = true;

    this.round.displayType = DisplayType.checkbox;
    this.angle.displayType = DisplayType.range;
    this.opacity.displayType = DisplayType.range;
    this.visible.displayType = DisplayType.checkbox;

    this.addChildren(
      this.text,
      this.round,
      this.roundTo,
      this.size,
      this.color,
      this.angle,
      this.opacity,
      this.position,
      this.align,
      this.visible);
  }

  readonly round: BoolValue;
  readonly roundTo: NumberValue;
  readonly align: StringValue;
  readonly visible: BoolValue;
  readonly text: TextValue;
  readonly size: NumberValue;
  readonly angle: NumberValue;
  readonly color: ColorValue;
  readonly opacity: NumberValue;
  readonly position: VectorValue;

  private _textValue?: string;
  get textValue() {
    if (this._textValue !== undefined) return this._textValue || "";

    let value = this.text.value;

    if (this.round) {
      const num = toNumber(value);

      if (!isNaN(num)) {
        value = num.toFixed(this.roundTo.value || 0);
        this.text.value = value;
      }
    }

    this._textValue = value || "";
    return this._textValue;
  }
  set textValue(value) {
    if (this.round) {
      const num = toNumber(value);

      if (!isNaN(num))
        value = num.toFixed(this.roundTo.value || 0);
    }

    this._textValue = value;
    this.text.value = value;

    // if (this.text.mode === ValueSelectMode.value)
    //   this.clean();
  }

  get asNumber() { return toNumber(this.textValue); }
  set asNumber(value) { this.textValue = toString(value) || ""; }

  render(ctx: CanvasRenderingContext2D) {
    if (!this.visible) return;

    try {

      world.drawText(
        ctx,
        this.textValue || "",
        this.positionValue || Vec.emptyPosition,
        this.align.value || "start",
        this.angle.value || 0,
        this.size.value || 12,
        this.opacity.value || 1,
        this.color.value || "#000000");
    } catch {
    }
  }

  private _positionValue?: Vec;
  private get positionValue() {
    if (this._positionValue !== undefined) return this._positionValue;

    this._positionValue = this.position.value || world.origin.value.value || Vec.emptyPosition;
    return this._positionValue;

    /*
    if (!this.position.sourceValue) {
      this._positionValue = world.origin.value.value || Vec.emptyPosition;
      // dlogDetail(`${this.name} get positionValue: no settings returning origin ${this._positionValue}`);
      return this._positionValue;
    }

    let result = this.position.value || world.origin.value.value;
    const vector = this.position.vectorObject;
    const transform = this.position.transform && this.position.transform;
    result = !transform || transform.adjustOrigin ? vector.drawOrigin.addN(result) : result;
    result = result ? result.withW(1) : world.origin.vector;
    this._positionValue = result;
    // dlogDetail(`${this.name} get positionValue: calculated ${this._positionValue}`);
    return result;
    //*/
  }
}
