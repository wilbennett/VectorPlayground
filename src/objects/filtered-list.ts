import { BaseObject } from '.';
import { Category, ICaptioned, IDisposable, SelectFilter } from '../core';
import { EventArgs, StringChangeArgs } from '../event-args';
import { Listener, TypedEvent } from '../events';

export class ListEventArgs extends EventArgs {
}

export class ListClearedArgs extends ListEventArgs {
  setValues() { this.sender = undefined; }
}

export class ListItemArgs extends ListEventArgs {
  constructor(index?: number, item?: ICaptioned) {
    super();

    this.index = index || -1;
    this.item = item || BaseObject.empty;
  }

  index: number;
  item: ICaptioned;

  setValues(index: number, item: ICaptioned) {
    this.index = index;
    this.item = item;
    this.sender = undefined;
  }
}

export class ListItemAddedArgs extends ListItemArgs { }
export class ListItemRemovedArgs extends ListItemArgs { }
export class ListItemChangedArgs extends ListItemArgs { }

export interface IFilteredList {
  readonly length: number;
  readonly items: ICaptioned[];

  clear(): void;
  get(index: number): ICaptioned;
  indexOf(obj: ICaptioned): number;
  add(obj: BaseObject): boolean;
  remove(obj: BaseObject): boolean;

  onCleared(listener: Listener<ListClearedArgs>): IDisposable;
  offCleared(listener: Listener<ListClearedArgs>): void;
  onItemAdded(listener: Listener<ListItemAddedArgs>): IDisposable;
  offItemAdded(listener: Listener<ListItemAddedArgs>): void;
  onItemRemoved(listener: Listener<ListItemRemovedArgs>): IDisposable;
  offItemRemoved(listener: Listener<ListItemRemovedArgs>): void;
  onItemChanged(listener: Listener<ListItemChangedArgs>): IDisposable;
  offItemChanged(listener: Listener<ListItemChangedArgs>): void;
}

export class FilteredList<T extends BaseObject> extends BaseObject implements IFilteredList {
  private _clearedEmitter = new TypedEvent<ListClearedArgs>(this);
  private _addedEmitter = new TypedEvent<ListItemAddedArgs>(this);
  private _removedEmitter = new TypedEvent<ListItemRemovedArgs>(this);
  private _changedEmitter = new TypedEvent<ListItemChangedArgs>(this);
  private _clearedArgs = new ListClearedArgs();
  private _addedArgs = new ListItemAddedArgs();
  private _removedArgs = new ListItemRemovedArgs();
  private _changedArgs = new ListItemChangedArgs();
  private _handleCaptionChangedBound = this.handleCaptionChanged.bind(this);

  constructor(public readonly filter: SelectFilter) {
    super("filteredList", Category.utils);
  }

  readonly items: T[] = [];
  get length() { return this.items.length; }
  *[Symbol.iterator]() { yield* this.items; }

  indexOf(obj: ICaptioned) { return this.items.indexOf(obj as T); }

  clear() {
    for (const obj of this.items) {
      obj.offCaptionChanged(this._handleCaptionChangedBound);
    }

    this.items.splice(0, this.items.length);
    this._clearedArgs.setValues();
    this._clearedEmitter.emit(this._clearedArgs);
  }

  get(index: number) { return this.items[index]; }

  add(obj: T) {
    if (!this.filter(obj)) return false;

    this._addedArgs.setValues(this.items.length, obj);
    obj.onCaptionChanged(this._handleCaptionChangedBound);
    this.items.push(obj);
    this._addedEmitter.emit(this._addedArgs);
    return true;
  }

  remove(obj: T) {
    const index = this.items.indexOf(obj);

    if (index < 0) return false;

    this.items.splice(index, 1);
    obj.offCaptionChanged(this._handleCaptionChangedBound);
    this._removedArgs.setValues(index, obj);
    this._removedEmitter.emit(this._removedArgs);
    return true;
  }

  onCleared(listener: Listener<ListClearedArgs>) { return this._clearedEmitter.on(listener); }
  offCleared(listener: Listener<ListClearedArgs>) { this._clearedEmitter.off(listener); }
  onItemAdded(listener: Listener<ListItemAddedArgs>) { return this._addedEmitter.on(listener); }
  offItemAdded(listener: Listener<ListItemAddedArgs>) { this._addedEmitter.off(listener); }
  onItemRemoved(listener: Listener<ListItemRemovedArgs>) { return this._removedEmitter.on(listener); }
  offItemRemoved(listener: Listener<ListItemRemovedArgs>) { this._removedEmitter.off(listener); }
  onItemChanged(listener: Listener<ListItemChangedArgs>) { return this._changedEmitter.on(listener); }
  offItemChanged(listener: Listener<ListItemChangedArgs>) { this._changedEmitter.off(listener); }

  protected disposeCore() {
    this.clear();
  }

  private handleCaptionChanged(e: StringChangeArgs) {
    const obj = e.sender;
    const index = this.items.indexOf(obj);

    if (index < 0) return;

    this._changedArgs.setValues(index, obj);
    this._changedEmitter.emit(this._changedArgs);
  }
}
