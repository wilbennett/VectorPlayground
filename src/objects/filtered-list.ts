import { BaseObject, ObjectFilter } from '.';
import { CaptionMode, Category, ICaptioned, IDisposable } from '../core';
import { EventArgs, StringChangeArgs } from '../event-args';
import { Listener, TypedEvent } from '../events';

export enum ListChangeKind {
  cleared,
  itemAdded,
  itemRemoved,
  itemChanged,
  selectionChanged
}

export class ListEventArgs extends EventArgs {
  get listChangeKind() { return ListChangeKind.cleared; }
}

export class ListClearedArgs extends ListEventArgs {
  get listChangeKind() { return ListChangeKind.cleared; }
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

export class ListItemAddedArgs extends ListItemArgs {
  get listChangeKind() { return ListChangeKind.itemAdded; }
}

export class ListItemRemovedArgs extends ListItemArgs {
  get listChangeKind() { return ListChangeKind.itemRemoved; }
}

export class ListItemChangedArgs extends ListItemArgs {
  get listChangeKind() { return ListChangeKind.itemChanged; }
}

export class ListSelectedItemChangedArgs extends ListEventArgs {

  constructor(oldIndex?: number, newIndex?: number, oldItem?: ICaptioned, newItem?: ICaptioned) {
    super();

    this.oldIndex = oldIndex || -1;
    this.newIndex = newIndex || -1;
    this.oldItem = oldItem || BaseObject.empty;
    this.newItem = newItem || BaseObject.empty;
  }

  oldIndex: number;
  newIndex: number;
  oldItem: ICaptioned;
  newItem: ICaptioned;
  get listChangeKind() { return ListChangeKind.selectionChanged; }

  setValues(oldIndex: number, newIndex: number, oldItem: ICaptioned, newItem: ICaptioned) {
    this.oldIndex = oldIndex;
    this.newIndex = newIndex;
    this.oldItem = oldItem;
    this.newItem = newItem;
    this.sender = undefined;
  }
}

export interface IFilteredList {
  readonly length: number;
  readonly items: ICaptioned[];
  readonly selectedIndex: number;
  readonly captionMode: CaptionMode;

  clear(): void;
  get(index: number): ICaptioned;
  indexOf(obj: ICaptioned): number;
  add(obj: BaseObject): boolean;
  remove(obj: BaseObject): boolean;

  onListChanged(listener: Listener<ListEventArgs>): IDisposable;
  offListChanged(listener: Listener<ListEventArgs>): void;
}

export class FilteredList<T extends BaseObject> extends BaseObject implements IFilteredList {
  private _emitter = new TypedEvent<ListEventArgs>(this);
  private _handleCaptionChangedBound = this.handleCaptionChanged.bind(this);

  constructor(public readonly filter: ObjectFilter) {
    super("filteredList", Category.utils);
  }

  captionMode: CaptionMode = CaptionMode.caption;
  readonly items: T[] = [];
  get length() { return this.items.length; }
  *[Symbol.iterator]() { yield* this.items; }

  private _selectedArgs = new ListSelectedItemChangedArgs();
  private _selectedIndex = -1;
  get selectedIndex() { return this._selectedIndex; }
  set selectedIndex(value) {
    if (value === this._selectedIndex) return;

    this._selectedArgs.setValues(this._selectedIndex, value, this.get(this._selectedIndex), this.get(value));
    this._selectedIndex = value;
    this.emit(this._selectedArgs);
  }

  get value() { return this._selectedIndex >= 0 ? this.items[this._selectedIndex] : BaseObject.empty; }

  indexOf(obj: ICaptioned) { return this.items.indexOf(obj as T); }

  private _clearedArgs = new ListClearedArgs();
  clear() {
    for (const obj of this.items) {
      obj.offCaptionChanged(this._handleCaptionChangedBound);
    }

    this.items.splice(0, this.items.length);
    this._clearedArgs.setValues();
    this.emit(this._clearedArgs);
  }

  get(index: number) { return index >= 0 && index < this.items.length ? this.items[index] : BaseObject.empty; }

  private _addedArgs = new ListItemAddedArgs();
  add(obj: T) {
    if (!this.filter(obj)) return false;

    this._addedArgs.setValues(this.items.length, obj);
    obj.onCaptionChanged(this._handleCaptionChangedBound);
    this.items.push(obj);
    this.emit(this._addedArgs);
    return true;
  }

  private _removedArgs = new ListItemRemovedArgs();
  remove(obj: T) {
    const index = this.items.indexOf(obj);

    if (index < 0) return false;

    this.items.splice(index, 1);
    obj.offCaptionChanged(this._handleCaptionChangedBound);
    this._removedArgs.setValues(index, obj);
    this.emit(this._removedArgs);
    return true;
  }

  onListChanged(listener: Listener<ListEventArgs>) { return this._emitter.on(listener); }
  offListChanged(listener: Listener<ListEventArgs>) { this._emitter.off(listener); }

  protected disposeCore() {
    this.clear();
  }

  private emit(args: ListEventArgs) { this._emitter.emit(args); }

  private _changedArgs = new ListItemChangedArgs();
  private handleCaptionChanged(e: StringChangeArgs) {
    const obj = e.sender;
    const index = this.items.indexOf(obj);

    if (index < 0) return;

    this._changedArgs.setValues(index, obj);
    this.emit(this._changedArgs);
  }
}
