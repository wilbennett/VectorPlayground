import { BoolValue, Calculation, FilteredList, NumberValue, VectorValue, Operation, TransformRef, TransformValue } from '..';
import { ChangeArgs, promisedWorld, TransformObject, Utils, ValueType, Vec, VectorObject } from '../../core';

let easings!: FilteredList<TransformObject<number>>;
const worldAssigned = promisedWorld.then(w => w);

worldAssigned.then(world => {
  easings = new FilteredList<TransformObject<number>>(o => o instanceof TransformObject && o.valueType === ValueType.number);
  world.addFilteredLists(easings);
});

export class VecEase extends Calculation {
  private _assigningRandom = false;
  private _currentPct: number = NaN;
  private _direction = NaN;
  private _step = NaN;
  private _stepCount = 0;
  private _remainSteps = 0;
  private _cyclesRemain = Infinity;

  constructor() {
    super(VecEase.name);

    this.start = new VectorValue("start", Vec.emptyPosition);
    this.end = new VectorValue("end", Vec.emptyPosition);
    this.duration = new NumberValue("duration", 1.5, undefined, undefined, 0.1);
    this.cycle = new BoolValue("cycle", false);
    this.easingX = new TransformValue("easingX", ValueType.number, 0);
    this.easingXRef = new TransformRef("easingX", this.easingX);
    this.easingY = new TransformValue("easingY", ValueType.number, 0);
    this.easingYRef = new TransformRef("easingY", this.easingY);
    this.random = new BoolValue("random", false);
    this.perCycle = new BoolValue("per_cycle", false);
    this.easeOnly = new BoolValue("ease_only", true);
    this.repeat = new NumberValue("repeat", -1, -1, Infinity, 1);
    this.resultObj = new VectorObject("result", Vec.emptyDirection);
    this.result = new VectorValue("result", Vec.emptyPosition);
    this.percent = new NumberValue("percent", 0);

    this.addChildren(
      this.start,
      this.end,
      this.duration,
      this.cycle,
      this.easingXRef,
      this.easingX,
      this.easingYRef,
      this.easingY,
      this.random,
      this.perCycle,
      this.easeOnly,
      this.repeat,
      this.resultObj,
      this.result,
      this.percent);

    this.resultObj.caption = `${this.title}`;
    this.result.captionRoot = `${this.title}`;
    this.result.sourceValue = this.resultObj.value;

    this.easingXRef.captionRoot = this.easingXRef.title;
    this.easingYRef.captionRoot = this.easingYRef.title;

    this._descriptionFormat = `<b>Ease: {func}</b><br/>Ease {funcstart} to {funcend} : {func}`;
    this._alwaysDirty = true;
  }

  easingX: TransformValue<number>;
  easingXRef: TransformRef<number>;
  easingY: TransformValue<number>;
  easingYRef: TransformRef<number>;
  start: VectorValue;
  end: VectorValue;
  duration: NumberValue;
  cycle: BoolValue;
  random: BoolValue;
  perCycle: BoolValue;
  easeOnly: BoolValue;
  repeat: NumberValue;
  resultObj: VectorObject;
  result: VectorValue;
  percent: NumberValue;

  protected updateCore() {
    const start = this.start.value;
    const end = this.end.value;
    const easingX = this.easingX;
    const easingY = this.easingY;
    let step = this._step;

    if (!start) return;
    if (!end) return;

    if (!easingX.transform || !easingY.transform) {
      if (!this.random.value) return;

      this.assignRandomEasing();
    }

    if (isNaN(this._direction)) {
      const duration = this.duration.value;

      if (isNaN(duration)) return;

      this._step = 1 / 60 / (duration / (this.cycle.value ? 2 : 1));
      this._stepCount = Math.round(1 / this._step) + 1;
      this._remainSteps = this._stepCount;
      step = this._step;
      this._currentPct = -step;
      this._direction = 1;
      this._cyclesRemain = this.repeat.value < 0 ? Infinity : this.repeat.value + 1;
    } else {
      if (this.cycle.value) {
        if (this._remainSteps <= 0) {
          this._currentPct += step * this._direction;
          this._direction = -this._direction;
          this._remainSteps = this._stepCount;

          if (this._direction === 1)
            this._cyclesRemain--;

          if (this.random.value && (this._direction == 1 || !this.perCycle.value))
            this.assignRandomEasing();
        }
      } else {
        if (this._remainSteps <= 0) {
          this._direction = 1;
          this._currentPct = -step;
          this._cyclesRemain--;
          this._remainSteps = this._stepCount;

          if (this.random.value)
            this.assignRandomEasing();
        }
      }
    }

    if (this._cyclesRemain <= 0) return;

    this._remainSteps--;
    let percentX: number;
    let percentY: number;

    if (this._remainSteps === 0) {
      percentX = this._direction > 0 ? 1 : 0;
      percentY = percentX;
    } else {
      percentX = this._currentPct + step * this._direction;
      percentY = percentX;
    }

    this._currentPct = percentX;
    percentX = Math.min(1, Math.max(0, percentX));

    this.percent.value = percentX * 100;
    percentX = easingX.transformValue(percentX)!;
    percentY = easingY.transformValue(percentY)!;
    const resultX = start.x + percentX * (end.x - start.x);
    const resultY = start.y + percentY * (end.y - start.y);

    if (isNaN(resultX)) return;
    if (isNaN(resultY)) return;
    if (!Number.isFinite(resultX)) return;
    if (!Number.isFinite(resultY)) return;

    this.resultObj.value.value = new Vec(resultX, resultY);
  }

  protected clearCalculatedVariables() {
    this._currentPct = NaN;
    this._direction = NaN;
  }

  protected onChildChanged(e: ChangeArgs) {
    super.onChildChanged(e);

    if (e.sender === this.result) return;
    if (e.sender === this.percent) return;
    if (this._assigningRandom) return;

    this.clearCalculatedVariables();
  }

  protected getRandomEasing() {
    if (easings.length === 0) return;

    const easeOnly = this.easeOnly.value;
    let easing: TransformObject<number>;

    while (easing = easings.items[Utils.randomInt(0, easings.length - 1)]) {
      if (easeOnly && !easing.name.startsWith("ease_")) continue;
      if (easing.owner !== this) break;
    }

    return easing;
  }

  protected assignRandomEasing() {
    if (easings.length === 0) return;

    let easingX = this.getRandomEasing();
    let easingY = this.getRandomEasing();

    this._assigningRandom = true;

    try {
      this.easingX.transform = easingX;
      this.easingY.transform = easingY;
    } finally {
      this._assigningRandom = false;
    }
  }

  protected calcDescription() {
    let format = this.descriptionFormat;
    format = format.replace(new RegExp(`{func}`, "g"), this.easingXRef.getMathText("t"));
    format = format.replace(new RegExp(`{func}`, "g"), this.easingYRef.getMathText("t"));
    format = format.replace(new RegExp(`{funcstart}`, "g"), this.start.getMathText());
    format = format.replace(new RegExp(`{funcend}`, "g"), this.end.getMathText());
    return format;
  }
}

worldAssigned.then(world => world.addObjects(new Operation(VecEase.name, VecEase)));
