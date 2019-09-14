import { ComponentBase } from '..';
import {
  FilteredType,
  ICaptioned,
  IDisposable,
  IFilteredList,
  ListClearedArgs,
  ListItemAddedArgs,
  ListItemChangedArgs,
  ListItemRemovedArgs,
  ValueType,
} from '../../core';
import {
  autoAttribute,
  boolAttribute,
  component,
  hookChange,
  numberAttribute,
  wrapElementProperty,
} from '../decorators';
import template from './template.html';

const elTemplate = document.createElement('template');
elTemplate.innerHTML = template;

// @D.dlogged()
@component("filtered-select")
export class FilteredSelectElement extends ComponentBase {
  private _options: HTMLOptionElement[] = [];
  private _listSubscriptions: IDisposable[] = [];
  private _handleListClearedBound = this.handleListCleared.bind(this);
  private _handleListItemAddedBound = this.handleListItemAdded.bind(this);
  private _handleListItemRemovedBound = this.handleListItemRemoved.bind(this);
  private _handleListItemChangedBound = this.handleListItemChanged.bind(this);

  constructor() {
    super();

    // @ts-ignore - ancestor method.
    this.attachShadow({ mode: 'open' });
    // @ts-ignore - ancestor method.
    this.shadowRoot.appendChild(elTemplate.content.cloneNode(true));

    this._elValue = this.getSelectElement("select");
  }

  @hookChange
  @wrapElementProperty("selectedIndex", "selectedIndex")
  @wrapElementProperty("length", "length")
  private _elValue: HTMLSelectElement;
  // @ts-ignore - decorator implemented.
  valueElement: HTMLSelectElement;
  // @ts-ignore - decorator implemented.
  selectedIndex: number;
  // @ts-ignore - decorator implemented.
  length: number;

  // @ts-ignore - decorator implemented.
  @autoAttribute() valueType: ValueType;
  // @ts-ignore - decorator implemented.
  @numberAttribute() allowedValueTypes: ValueType;
  // @ts-ignore - decorator implemented.
  @numberAttribute() size: number;
  // @ts-ignore - decorator implemented.
  @autoAttribute() filteredType: FilteredType;
  // @ts-ignore - decorator implemented.
  @boolAttribute() includeEmptyItem: boolean;

  // @ts-ignore - decorator implemented.
  private _filteredList: IFilteredList;
  get filteredList() { return this._filteredList; }
  set filteredList(value) {
    if (value === this._filteredList) return;

    this._filteredList = value;
    this.createOptions();
    this.subscribeToList();
  }

  get value() { return this.filteredList && this.filteredList.get(this._elValue.selectedIndex); }
  set value(value) { this._elValue.selectedIndex = this.filteredList ? this._filteredList.indexOf(value) : -1; }

  // @ts-ignore - unused param.
  protected attributeChangedCore(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case "size":
        this._elValue.setAttribute(name, newValue);
        break;

      case "include-empty-item":
        if (this.includeEmptyItem)
          this.addEmptyFirstItem();
        else
          this.removeEmptyFirstItem();

        break;
    }
  }

  protected createOptions() {
    this.clear();

    if (!this._filteredList) return;

    this._options.push(...this._filteredList.items.map(this.createOption, this));
  }

  protected createOptionCore(value: string, caption?: string) {
    const option = document.createElement("option");
    option.text = caption || value;
    option.value = value;
    return option;
  }

  protected createOption(obj: ICaptioned) { return this.createOptionCore(obj.name, obj.caption); }

  protected addEmptyFirstItem() {
    let first = <HTMLOptionElement>this._elValue.firstChild;

    if (first && first.value === "") return;

    this._elValue.insertBefore(this.createOptionCore("", ""), first);
  }

  protected removeEmptyFirstItem() {
    let first = <HTMLOptionElement>this._elValue.firstChild;

    if (!first || first.value !== "") return;

    this._elValue.removeChild(first);
  }

  protected clear() {
    for (const option of this._options) {
      this._elValue.removeChild(option);
    }

    this._options.splice(0);
  }

  // @ts-ignore - unused param.
  protected handleListCleared(e: ListClearedArgs) { this.clear(); }

  protected handleListItemAdded(e: ListItemAddedArgs) {
    const option = this.createOption(e.item);
    this._options.splice(e.index, 0, option);

    if (this._options.length === 1 || e.index === this._options.length - 1)
      this._elValue.appendChild(option);
    else
      this._elValue.insertBefore(option, this._options[e.index + 1]);
  }

  protected handleListItemRemoved(e: ListItemRemovedArgs) {
    this._elValue.removeChild(this._options[e.index]);
    this._options.splice(e.index, 1);
  }

  protected handleListItemChanged(e: ListItemChangedArgs) {
    this._options[e.index].value = e.item.name;
    this._options[e.index].text = e.item.caption || e.item.name;
  }

  protected subscribeToList() {
    this.disposeListSubscriptions();

    if (!this._filteredList) return;

    this._listSubscriptions.push(
      this._filteredList.onCleared(this._handleListClearedBound),
      this._filteredList.onItemAdded(this._handleListItemAddedBound),
      this._filteredList.onItemRemoved(this._handleListItemRemovedBound),
      this._filteredList.onItemChanged(this._handleListItemChangedBound)
    );
  }

  protected disposeListSubscriptions() {
    if (this._listSubscriptions.length === 0) return;

    this._listSubscriptions.forEach(d => d.dispose());
    this._listSubscriptions.splice(0);
  }
}
