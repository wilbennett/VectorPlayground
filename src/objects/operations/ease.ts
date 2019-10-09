import { BoolValue, Calculation, FilteredList, NumberValue, Operation, TransformRef, TransformValue } from '..';
import { ChangeArgs, promisedWorld, TransformObject, Utils, ValueType } from '../../core';

let easings!: FilteredList<TransformObject<number>>;
const worldAssigned = promisedWorld.then(w => w);

worldAssigned.then(world => {
  easings = new FilteredList<TransformObject<number>>(o => o instanceof TransformObject && o.valueType === ValueType.number);
  world.addFilteredLists(easings);
});

export class Ease extends Calculation {
  private _currentPct: number = NaN;
  private _direction = NaN;
  private _step = NaN;

  constructor() {
    super(Ease.name);

    this.start = new NumberValue("start", 0, undefined, undefined, 0.1);
    this.end = new NumberValue("end", 10, undefined, undefined, 0.1);
    this.duration = new NumberValue("duration", 1, undefined, undefined, 0.1);
    this.cycle = new BoolValue("cycle", false);
    this.easing = new TransformValue("easing", ValueType.number, 0);
    this.easingRef = new TransformRef("easing", this.easing);
    this.random = new BoolValue("random", false);
    this.perCycle = new BoolValue("per_cycle", false);
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
      this.result,
      this.percent);

    this.easingRef.captionRoot = this.easingRef.title;

    this._descriptionFormat = `<b>Ease {func}</b><br/>Ease {funcstart} to {funcend} : {func}`;
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
  result: NumberValue;
  percent: NumberValue;

  protected updateCore() {
    const start = this.start.value;
    const end = this.end.value;
    const percent = this.percent;
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

      this._step = 1 / 60 / duration;
      step = this._step;
      this._currentPct = -step;
      this._direction = 1;
    }

    let currentPct = this._currentPct + step * this._direction;

    if (this.cycle.value) {
      if (currentPct < 0 || currentPct > 1) {
        this._direction = -this._direction;
        currentPct += step * this._direction;

        if (this.random.value && (this._direction == 1 || !this.perCycle.value))
          this.assignRandomEasing();
      }
    } else {
      if (currentPct < 0 || currentPct > 1) {
        this._direction = 1;
        currentPct = 0;

        if (this.random.value)
          this.assignRandomEasing();
      }
    }

    this._currentPct = currentPct;

    percent.value = currentPct;
    currentPct = easing.transformValue(currentPct)!;

    if (isNaN(currentPct)) return;

    this.result.value = start + currentPct * (end - start);
  }

  protected clearCalculatedVariables() {
    this._currentPct = NaN;
    this._direction = NaN;
  }

  protected onChildChanged(e: ChangeArgs) {
    super.onChildChanged(e);

    if (e.sender === this.result) return;
    if (e.sender === this.percent) return;

    this.clearCalculatedVariables();
  }

  protected assignRandomEasing() {
    if (easings.length === 0) return;

    let easing: TransformObject<number>;

    while (easing = easings.items[Utils.randomInt(0, easings.length - 1)]) {
      if (easing.owner !== this) break;
    }

    this.easing.transform = easing;
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
