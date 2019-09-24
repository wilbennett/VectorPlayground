import { ComponentBase, FilteredSelectElement } from '..';
import { Category, FilteredType, TransformKind, ValueType } from '../../core';
import { UiUtils } from '../../utils';
import {
  autoAttribute,
  boolAttribute,
  child,
  component,
  hookChange,
  hookEvent,
  numberAttribute,
  wrapElementProperty,
} from '../decorators';
import template from './template.html';

const { showElement, hideElement, displayElement } = UiUtils;

const elTemplate = document.createElement('template');
elTemplate.innerHTML = template;

@component("transform-value")
export class TransformValueElement extends ComponentBase {
  @hookEvent("click", "expand")
  private _elBtnExpand: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(elTemplate.content.cloneNode(true));

    this._elSourceValue = this.getFilteredElement("value");
    this._elTransform = this.getFilteredElement("transform");
    this._elModifier = this.getFilteredElement("modifier");

    this._elBtnExpand = this.getElement("expandbtn");
  }

  get userData() { return super.userData; }
  set userData(value) {
    super.userData = value;

    if (!this.isAllConnected) return;

    this.sourceValueElement.userData = value;
    this.transformElement.userData = value;
    this.modifierElement.userData = value;
  }

  // @ts-ignore - decorator implemented.
  @autoAttribute(Category.value) category: Category;
  // @ts-ignore - decorator implemented.
  @numberAttribute(ValueType.string) valueType: ValueType;
  // @ts-ignore - decorator implemented.
  @numberAttribute() allowedValueTypes: ValueType;
  // @ts-ignore - decorator implemented.
  @autoAttribute(TransformKind.constant) kind: TransformKind;
  // @ts-ignore - decorator implemented.
  @boolAttribute() autoShowTransform: boolean;
  // @ts-ignore - decorator implemented.
  @boolAttribute() hideSourceValue: boolean;
  // @ts-ignore - decorator implemented.
  @boolAttribute() hideModifier: boolean;

  @wrapElementProperty() @child @hookChange
  private _elSourceValue: FilteredSelectElement;
  // @ts-ignore - decorator implemented.
  sourceValueElement: FilteredSelectElement;
  // @ts-ignore - decorator implemented.
  sourceValue: any;

  @wrapElementProperty() @child @hookChange
  private _elTransform: FilteredSelectElement;
  // @ts-ignore - decorator implemented.
  transformElement: FilteredSelectElement;
  // @ts-ignore - decorator implemented.
  transform: any;

  @wrapElementProperty() @child @hookChange
  private _elModifier: FilteredSelectElement;
  // @ts-ignore - decorator implemented.
  modifierElement: FilteredSelectElement;
  // @ts-ignore - decorator implemented.
  modifier: any;

  get filteredSelects() { return [this._elSourceValue, this._elTransform, this._elModifier]; }

  // @ts-ignore - unused param.
  protected attributeChangedCore(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case "mode":
        this.hideSourceValue = newValue === TransformKind.transform;
        break;

      case "category":
      case "value-type":
      case "allowed-value-types":
        if (this.isAllConnected) {
          this.filteredSelects.forEach(s => s.setAttribute(name, newValue));
        }
        break;
    }
  }

  protected allConnected() {
    this._elSourceValue.filteredType = FilteredType.value;
    this._elTransform.filteredType = FilteredType.transform;
    this._elModifier.filteredType = FilteredType.transform;
  }

  protected updateVisibility() {
    const hideSourceValue = this.hideSourceValue;
    const hideMod = this.hideModifier;
    const haveValue = this.sourceValue;
    const haveTransform = this.transform;
    const haveModifier = this.modifier;
    const haveTransfromAndModifier = haveTransform && this.modifier;
    displayElement(this._elSourceValue, !hideSourceValue);
    displayElement(this._elTransform, hideSourceValue || (haveValue && (haveTransform || this.autoShowTransform)));
    displayElement(this._elModifier, (hideSourceValue || haveValue) && haveTransfromAndModifier && !hideMod);
    displayElement(this._elBtnExpand, (!haveTransform || (!haveModifier && !hideMod)) && !(hideSourceValue && hideMod));
  }

  protected getFilteredElement(id: string) { return this.getElement<FilteredSelectElement>(id); }

  // @ts-ignore - decorator implemented.
  private expand() {
    if (this._elTransform.style.display === "none") {
      showElement(this._elTransform);
      return;
    }

    if (!this.hideModifier && this._elModifier.style.display === "none") {
      showElement(this._elModifier);
      hideElement(this._elBtnExpand);
      return;
    }
  }
}
