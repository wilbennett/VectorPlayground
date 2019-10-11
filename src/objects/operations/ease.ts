import { BoolValue, Calculation, FilteredList, NumberValue, Operation, TransformRef, TransformValue } from '..';
import { ChangeArgs, promisedWorld, TransformObject, Utils, ValueType } from '../../core';

let easings!: FilteredList<TransformObject<number>>;
const worldAssigned = promisedWorld.then(w => w);

worldAssigned.then(world => {
  easings = new FilteredList<TransformObject<number>>(o => o instanceof TransformObject && o.valueType === ValueType.number);
  world.addFilteredLists(easings);
});

export class Ease extends Calculation {
  private _assigningRandom = false;
  private _currentPct: number = NaN;
  private _direction = NaN;
  private _step = NaN;
  private _stepCount = 0;
  private _remainSteps = 0;
  private _cyclesRemain = Infinity;

  constructor() {
    super(Ease.name);

    this.start = new NumberValue("start", 0, undefined, undefined, 0.1);
    this.end = new NumberValue("end", 10, undefined, undefined, 0.1);
    this.duration = new NumberValue("duration", 1.5, undefined, undefined, 0.1);
    this.cycle = new BoolValue("cycle", false);
    this.easing = new TransformValue("easing", ValueType.number, 0);
    this.easingRef = new TransformRef("easing", this.easing);
    this.random = new BoolValue("random", false);
    this.perCycle = new BoolValue("per_cycle", false);
    this.easeOnly = new BoolValue("ease_only", true);
    this.repeat = new NumberValue("repeat", -1, -1, Infinity, 1);
    this.result = new NumberValue("result", 0);
    this.percent = new NumberValue("percent", 0);

    this.addChildren(
      this.start,
      this.end,
      this.duration,
      this.cycle,
      this.easingRef,
      this.easing,
      this.random,
      this.perCycle,
      this.easeOnly,
      this.repeat,
      this.result,
      this.percent);

    this.easingRef.captionRoot = this.easingRef.title;

    this._descriptionFormat = `<b>Ease: {func}</b><br/>Ease {funcstart} to {funcend} : {func}`;
    this._alwaysDirty = true;
  }

  easing: TransformValue<number>;
  easingRef: TransformRef<number>;
  start: NumberValue;
  end: NumberValue;
  duration: NumberValue;
  cycle: BoolValue;
  random: BoolValue;
  perCycle: BoolValue;
  easeOnly: BoolValue;
  repeat: NumberValue;
  result: NumberValue;
  percent: NumberValue;

  protected updateCore() {
    const start = this.start.value;
    const end = this.end.value;
    const easing = this.easing;
    let step = this._step;

    if (isNaN(start)) return;
    if (isNaN(end)) return;

    if (!easing.transform) {
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
    let percent: number;

    if (this._remainSteps === 0) {
      percent = this._direction > 0 ? 1 : 0;
    } else {
      percent = this._currentPct + step * this._direction;
    }

    this._currentPct = percent;
    percent = Math.min(1, Math.max(0, percent));

    this.percent.value = percent * 100;
    percent = easing.transformValue(percent)!;
    const result = start + percent * (end - start);

    if (isNaN(result)) return;
    if (!Number.isFinite(result)) return;

    this.result.value = result;
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

  protected assignRandomEasing() {
    if (easings.length === 0) return;

    const easeOnly = this.easeOnly.value;
    let easing: TransformObject<number>;

    while (easing = easings.items[Utils.randomInt(0, easings.length - 1)]) {
      if (easeOnly && !easing.name.startsWith("ease_")) continue;
      if (easing.owner !== this) break;
    }

    this._assigningRandom = true;

    try {
      this.easing.transform = easing;
    } finally {
      this._assigningRandom = false;
    }
  }

  protected calcDescription() {
    let format = this.descriptionFormat;
    format = format.replace(new RegExp(`{func}`, "g"), this.easingRef.getMathText("t"));
    format = format.replace(new RegExp(`{funcstart}`, "g"), this.start.getMathText());
    format = format.replace(new RegExp(`{funcend}`, "g"), this.end.getMathText());
    return format;
  }
}

worldAssigned.then(world => world.addObjects(new Operation(Ease.name, Ease)));
