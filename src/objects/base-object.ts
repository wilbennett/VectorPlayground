import { Category, ICaptioned, IDisposable, IWorld, promisedWorld } from '../core';
import * as D from '../decorators';
import { ChangeArgs, EventKind, StringChangeArgs } from '../event-args';
import { EventFilter, Listener, TypedEvent } from '../events';

console.log("BaseObject init start");
let world!: IWorld;
promisedWorld.then(w => world = w);

@D.dlogged()
export class BaseObject implements IDisposable, ICaptioned {
  private _handleChildChangedBound = this.handleChildChanged.bind(this);
  private _changeSubscription?: IDisposable;
  private _processingChange = false;

  private _disposables?: IDisposable[];
  private get disposables() { return this._disposables || (this._disposables = []); }

  constructor(name: string, public readonly category: Category) {
    if (category === Category.value) {
      this.name = name;
      this.caption = name;
    } else if (name === "__empty__") {
      this.name = name;
      this.caption = name;
      this.isGlobal = false;
      this.isLocal = false;
    } else {
      this.name = world.getUniqueName(category, name);
      this._caption = world.getUniqueName(category, this.name);
    }

    this._captionArgs = new StringChangeArgs();
    this._captionArgs.kind = EventKind.caption;
  }

  static empty = new BaseObject("__empty__", Category.misc);
  protected static changeEmitter = new TypedEvent<ChangeArgs>({});

  static onChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this.changeEmitter.on(listener, filter);
  }

  static offChanged(listener: Listener<ChangeArgs>) { this.changeEmitter.off(listener); }

  readonly name: string;
  isGlobal = true;
  isLocal = true;

  protected _owner?: BaseObject;
  get owner() { return this._owner; }

  protected _children?: BaseObject[];
  get children() { return this._children; }

  protected _captionArgs: StringChangeArgs;
  protected _caption?: string;
  get caption() { return this._caption; }
  set caption(value) {
    if (this._caption === this._caption) return;

    this._captionArgs.setValues(this._caption, value);
    this._caption = value ? world.getUniqueCaption(this.category, value) : undefined;
    this.emitChange(this._captionArgs);
  }

  onChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return BaseObject.changeEmitter.on(listener, filter);
  }

  offChanged(listener: Listener<ChangeArgs>) { BaseObject.changeEmitter.off(listener); }

  onCaptionChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return BaseObject.changeEmitter.on(listener, filter);
  }

  offCaptionChanged(listener: Listener<ChangeArgs>) { BaseObject.changeEmitter.off(listener); }

  protected emitChange(e: ChangeArgs) {
    e.sender = e.sender || this;
    BaseObject.changeEmitter.emit(e);
  }

  protected addChildren(...children: BaseObject[]) {
    this._children = this._children || [];

    children.forEach(child => child._owner = this);

    this._children.push(...children);
    world.addObjects(...children);

    if (!this._changeSubscription) {
      this._changeSubscription = BaseObject.onChanged(this._handleChildChangedBound, e => e.sender.owner === this);
      this.disposables.push(this._changeSubscription);
    }
  }

  // @ts-ignore - unused param.
  protected onChildChanged(e: ChangeArgs) { }

  protected handleChildChanged(e: ChangeArgs) {
    if (this._processingChange) return;
    this._processingChange = true;

    try {
      this.onChildChanged(e);
    } finally {
      this._processingChange = false;
    }
  }

  protected addDisposable(disposable: IDisposable) {
    this.disposables.push(disposable);
    return disposable;
  }

  protected removeDisposable(disposable: IDisposable) {
    this.disposables.remove(disposable);
    return disposable;
  }

  protected disposeCore() { }

  dispose() {
    this.disposeCore();

    if (this._children) {
      this._children.forEach(child => child.offChanged(this._handleChildChangedBound));
      world.removeObjects(...this._children);
    }

    world.removeObjects(this);
    this._children = undefined;

    if (this._disposables) {
      this._disposables.forEach(d => d.dispose());
      this._disposables = undefined;
    }
  }
}
console.log("BaseObject init end");
