import { Category, ICaptioned, IDisposable, IWorld, promisedWorld, Utils, ValueType } from '../core';
import { ChangeArgs, EventKind, StringChangeArgs } from '../event-args';
import { EventFilter, Listener, TypedEvent } from '../events';

console.log("BaseObject init start");
let world!: IWorld;
promisedWorld.then(w => world = w);

const { hasValue } = Utils;

export const CHAR_CODE_Z = "z".charCodeAt(0);

// @D.dlogged()
export class BaseObject implements IDisposable, ICaptioned {
  protected _changeEmitter = new TypedEvent<ChangeArgs>(this);
  protected _settingsEmitter = new TypedEvent<ChangeArgs>(this);
  private _handleChildChangedBound = this.handleChildChanged.bind(this);
  private _handleChildSettingsChangedBound = this.handleChildSettingsChanged.bind(this);
  private _changeSubscription?: IDisposable;
  private _settingsChangeSubscription?: IDisposable;
  private _processingChange = false;

  private _disposables?: IDisposable[];
  private get disposables() { return this._disposables || (this._disposables = []); }

  constructor(name: string, public readonly category: Category) {
    this._captionArgs = new StringChangeArgs();
    this._captionArgs.kind = EventKind.caption;

    if (category === Category.value) {
      this._name = name;
      this._caption = name;
    } else if (name === "__empty__") {
      this._name = name;
      this._caption = name;
      this.isGlobal = false;
      this.isLocal = false;
    } else {
      this._name = world.getUniqueName(category, name);
      // this._caption = world.getUniqueName(category, this._name);
      this._captionRoot = Utils.capitalizeUnder(this._name);
    }

    this._title = Utils.capitalizeUnder(this._name);
  }

  static empty = new BaseObject("__empty__", Category.misc);
  protected static changeEmitter = new TypedEvent<ChangeArgs>({});
  protected static settingsEmitter = new TypedEvent<ChangeArgs>({});

  static onChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this.changeEmitter.on(listener, filter);
  }

  static offChanged(listener: Listener<ChangeArgs>) { this.changeEmitter.off(listener); }

  static onSettingsChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this.settingsEmitter.on(listener, filter);
  }

  static offSettingsChanged(listener: Listener<ChangeArgs>) { this.settingsEmitter.off(listener); }

  protected _name: string;
  get name() { return this._name; }

  isGlobal = true;
  isLocal = true;

  protected _owner?: BaseObject;
  get owner() { return this._owner; }

  get isOwned() {
    return !!this._owner
      && (this.category === Category.vectorObject || this.category === Category.textObject);
  }

  protected _children?: BaseObject[];
  get children() { return this._children; }

  protected _captionRoot?: string;
  get captionRoot() {
    return this._captionRoot !== undefined ? this._captionRoot : Utils.capitalizeUnder(this.name);
  }
  set captionRoot(value) { this._captionRoot = value; }

  protected _captionArgs: StringChangeArgs;
  protected _caption?: string;
  get caption() {
    return this._caption || this.captionRoot;
  }
  set caption(value) {
    if (value === this._caption) return;

    value = world.getUniqueCaption(this.category, hasValue(value) ? value : this.captionRoot);
    this._captionArgs.setValues(this._caption, value, this);
    this._caption = value;
    this.captionChanged(value);

    if (this._children)
      this._children.forEach(child => child.ownerCaptionChanged(value));

    this.emitChange(this._captionArgs);
  }

  protected _title?: string;
  get title() { return this._title || Utils.capitalizeUnder(this.name); }
  set title(value) {
    if (this._title === this._title) return;

    this._captionArgs.setValues(this._caption, value, this);
    this._title = value;
    this.emitChange(this._captionArgs);
  }

  protected _valueType = ValueType.string;
  get valueType() { return this._valueType; }

  protected _stripUnicode: boolean = false;
  get stripUnicode() { return this._stripUnicode; }
  set stripUnicode(value) { this._stripUnicode = value; }

  protected _mathFormat: string = `{input}`;
  get mathFormat() { return this._mathFormat; }
  set mathFormat(value) { this._mathFormat = value; }

  removeUnicode(text: string): string {
    return text.replace(/\u0305/ug, "");
    // return text.split("").filter(s => s.charCodeAt(0) <= CHAR_CODE_Z).join("");
  }

  getMathText(input?: string): string {
    if (input && this.stripUnicode)
      input = this.removeUnicode(input);

    return this.mathFormat.replace(/\{input\}/g, input || "");
  }

  //*
  onChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this._changeEmitter.on(listener, filter);
  }

  offChanged(listener: Listener<ChangeArgs>) { this._changeEmitter.off(listener); }

  onCaptionChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this._changeEmitter.on(listener, filter);
  }

  offCaptionChanged(listener: Listener<ChangeArgs>) { this._changeEmitter.off(listener); }

  onSettingsChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return this._settingsEmitter.on(listener, filter);
  }

  offSettingsChanged(listener: Listener<ChangeArgs>) { this._settingsEmitter.off(listener); }

  // @logEventEmit
  protected emitChange(e: ChangeArgs) {
    e.sender = e.sender || this;
    this._changeEmitter.emit(e);
    BaseObject.changeEmitter.emit(e);
    e.sender = undefined;
  }

  // @logEventEmit
  protected emitSettingsChange(e: ChangeArgs) {
    e.sender = e.sender || this;
    this._settingsEmitter.emit(e);
    BaseObject.settingsEmitter.emit(e);
    e.sender = undefined;
  }
  /*/
  onChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return BaseObject.changeEmitter.on(listener, e => e.sender === this && (!filter || filter(e)));
  }

  offChanged(listener: Listener<ChangeArgs>) { BaseObject.changeEmitter.off(listener); }

  onCaptionChanged(listener: Listener<ChangeArgs>, filter?: EventFilter) {
    return BaseObject.changeEmitter.on(listener, e => e.sender === this && (!filter || filter(e)));
  }

  offCaptionChanged(listener: Listener<ChangeArgs>) { BaseObject.changeEmitter.off(listener); }

  @logEventEmit
  protected emitChange(e: ChangeArgs) {
    e.sender = e.sender || this;
    BaseObject.changeEmitter.emit(e);
  }
  //*/

  protected calcOwnerText(owner: BaseObject) {
    switch (owner.category) {
      case Category.vectorObject:
        return `${owner.caption}`;
      default:
        return `[${owner.caption}]`;
    }
  }

  protected calcCaption() {
    const owner = this.owner;

    return owner
      ? `${this.calcOwnerText(owner)}${this.captionRoot && ` ${this.captionRoot}`}`
      : `${this.captionRoot}`;
  }

  protected setOwner(owner: BaseObject) {
    this._owner = owner;

    if (!this._caption)
      this.caption = this.calcCaption();
  }

  protected addChildren(...children: BaseObject[]) {
    this._children = this._children || [];

    children.forEach(child => child.setOwner(this));

    this._children.push(...children);
    this.disposables.push(...children);
    world.addObjects(...children);

    if (!this._changeSubscription) {
      this._changeSubscription = BaseObject.onChanged(
        this._handleChildChangedBound,
        e => e.sender && e.sender.owner === this);

      this.disposables.push(this._changeSubscription);
    }

    if (!this._settingsChangeSubscription) {
      this._settingsChangeSubscription = BaseObject.onSettingsChanged(
        this._handleChildSettingsChangedBound,
        e => e.sender && e.sender.owner === this);

      this.disposables.push(this._changeSubscription);
    }
  }

  // @ts-ignore - unused param.
  protected ownerCaptionChanged(caption: string) { this.caption = this.calcCaption(); }
  // @ts-ignore - unused param.
  protected captionChanged(caption: string) { }
  // @ts-ignore - unused param.
  protected onChildChanged(e: ChangeArgs) { }
  // @ts-ignore - unused param.
  protected onChildSettingsChanged(e: ChangeArgs) { }

  protected handleChildChanged(e: ChangeArgs) {
    if (this._processingChange) return;
    this._processingChange = true;

    try {
      this.onChildChanged(e);
    } finally {
      this._processingChange = false;
    }
  }

  protected handleChildSettingsChanged(e: ChangeArgs) {
    if (this._processingChange) return;
    this._processingChange = true;

    try {
      this.onChildSettingsChanged(e);
    } finally {
      this._processingChange = false;
    }
  }

  addDisposable(disposable: IDisposable) {
    this.disposables.push(disposable);
    return disposable;
  }

  removeDisposable(disposable: IDisposable) {
    this.disposables.remove(disposable);
    return disposable;
  }

  protected disposeCore() { }

  dispose() {
    this.disposeCore();

    if (this._disposables) {
      this._disposables.forEach(d => d.dispose());
      this._disposables = undefined;
    }

    world.removeObjects(this);
    this._children = undefined;
  }
}
console.log("BaseObject init end");
