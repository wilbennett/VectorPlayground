import { ComponentBase } from '..';
import {
  CaptionMode,
  Category,
  FilteredType,
  ICaptioned,
  IDisposable,
  IFilteredList,
  ListClearedArgs,
  ListEventArgs,
  ListItemAddedArgs,
  ListItemChangedArgs,
  ListItemRemovedArgs,
  ListSelectedItemChangedArgs,
  ValueType,
} from '../../core';
import * as D from '../../decorators/dlog';
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

@D.dlogged({
  // logAllProps: true,
  // logAllMethods: true,
})
@component("filtered-select")
export class FilteredSelectElement extends ComponentBase {
  private _options: HTMLOptionElement[] = [];
  private _listSubscriptions: IDisposable[] = [];
  private _handleListChangedBound = this.handleListChanged.bind(this);

  constructor() {
    super();

    // @ts-ignore - ancestor method.
    this.attachShadow({ mode: 'open' });
    // @ts-ignore - ancestor method.
    this.shadowRoot.appendChild(elTemplate.content.cloneNode(true));

    this._elValue = this.getSelectElement("select");
  }

  @hookChange
  @wrapElementProperty("length", "length")
  private _elValue: HTMLSelectElement;
  // @ts-ignore - decorator implemented.
  valueElement: HTMLSelectElement;
  // @ts-ignore - decorator implemented.
  length: number;

  // @ts-ignore - decorator implemented.
  @autoAttribute(Category.value) category: Category;
  // @ts-ignore - decorator implemented.
  @autoAttribute() valueType: ValueType;
  // @ts-ignore - decorator implemented.
  @numberAttribute() allowedValueTypes: ValueType;
  // @ts-ignore - decorator implemented.
  @boolAttribute() allowOwnerAsSource: boolean;
  // @ts-ignore - decorator implemented.
  @numberAttribute() size: number;
  // @ts-ignore - decorator implemented.
  @autoAttribute() filteredType: FilteredType;
  // @ts-ignore - decorator implemented.
  @boolAttribute() includeEmptyItem: boolean;

  get selectedIndex() { return this._elValue.selectedIndex; }
  set selectedIndex(value) {
    this._elValue.selectedIndex = -1;
    if (value !== this._elValue.selectedIndex)
      this._elValue.selectedIndex = value;

    if (!this.filteredList) return;

    const index = value - (this.includeEmptyItem ? 1 : 0);

    this.filteredList.selectedIndex = index;
  }

  // @ts-ignore - decorator implemented.
  private _filteredList: IFilteredList;
  get filteredList() { return this._filteredList; }
  set filteredList(value) {
    if (value === this._filteredList) return;

    this._filteredList = value;
    this.createOptions();
    this.subscribeToList();
  }

  get value(): any {
    if (!this.filteredList) return undefined;

    const index = this._elValue.selectedIndex - (this.includeEmptyItem ? 1 : 0);
    return this.filteredList.get(index);
  }
  set value(value) {
    if (!this.filteredList) return;

    const index = this._filteredList.indexOf(value) + (this.includeEmptyItem ? 1 : 0);

    if (index === this._elValue.selectedIndex) return;

    this.selectedIndex = index;
  }

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

  protected handleChange(e: Event) {
    this.selectedIndex = this._elValue.selectedIndex;
    super.handleChange(e);
  }

  protected createOptions() {
    this.clear();

    if (!this._filteredList) return;

    this._options.push(...this._filteredList.items.map(this.createOption, this));
    this._options.forEach(option => this._elValue.appendChild(option));
  }

  protected createOptionCore(value: string, caption?: string) {
    const option = document.createElement("option");
    option.text = caption || value;
    option.value = value;
    D.dlogDetail(`Created option: `, option);
    return option;
  }

  protected createOption(obj: ICaptioned) {
    if (this.filteredList.captionMode === CaptionMode.caption)
      return this.createOptionCore(obj.name, obj.caption);

    return this.createOptionCore(obj.name, obj.title);
  }

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

  protected handleListSelectedItemChanged(e: ListSelectedItemChangedArgs) {
    const newIndex = e.newIndex + (this.includeEmptyItem ? 1 : 0);
    this.selectedIndex = newIndex;
  }

  protected handleListChanged(e: ListEventArgs) {
    if (e instanceof ListClearedArgs) return this.handleListCleared(e);
    if (e instanceof ListItemAddedArgs) return this.handleListItemAdded(e);
    if (e instanceof ListItemRemovedArgs) return this.handleListItemRemoved(e);
    if (e instanceof ListItemChangedArgs) return this.handleListItemChanged(e);
    if (e instanceof ListSelectedItemChangedArgs) return this.handleListSelectedItemChanged(e);
  }

  protected subscribeToList() {
    this.disposeListSubscriptions();

    if (!this._filteredList) return;

    this._listSubscriptions.push(this._filteredList.onListChanged(this._handleListChangedBound));
  }

  protected disposeListSubscriptions() {
    if (this._listSubscriptions.length === 0) return;

    this._listSubscriptions.forEach(d => d.dispose());
    this._listSubscriptions.splice(0);
  }
}
