import { ComponentBase, FilteredSelectElement, TransformValueElement } from '..';
import { DisplayType, TransformKind, ValueMode, ValueType } from '../../core';
import { UiUtils } from '../../utils';
import {
  attribute,
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

@component("value-select")
export class ValueSelectElement extends ComponentBase {
  @hookEvent("click", "expand")
  private _elBtnExpand: HTMLElement;
  @hookEvent("click", "showDialog")
  private _elBtnMode: HTMLElement;
  @hookEvent("dblclick", "acceptDialog")
  private _elSelectMode: HTMLSelectElement;
  private _elBackground: HTMLElement;
  private _elDialog: HTMLElement;
  @hookEvent("click", "acceptDialog")
  // @ts-ignore - decorator implemented.
  private _elBtnOk: HTMLElement;
  @hookEvent("click", "cancelDialog")
  // @ts-ignore - decorator implemented.
  private _elBtnCancel: HTMLElement;

  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.appendChild(elTemplate.content.cloneNode(true));

    this._elText = this.getInputElement("output");
    this._elTextTransform = this.getElement<TransformValueElement>("text");
    this._elConstant = this.getElement<TransformValueElement>("constant");
    this._elTextObject = this.getElement<TransformValueElement>("textobject");
    this._elVector = this.getElement<TransformValueElement>("vector");
    this._elCalculation = this.getElement<TransformValueElement>("calculation");
    this._elTransformation = this.getElement<TransformValueElement>("transform");

    this._elBtnExpand = this.getElement("expandbtn");
    this._elBtnMode = this.getElement("modebtn");
    this._elSelectMode = this.getSelectElement("selectmode");
    this._elBackground = this.getElement("background");
    this._elDialog = this.getElement("dialog");
    this._elBtnOk = this.getElement("okbtn");
    this._elBtnCancel = this.getElement("cancelbtn");
  }

  get userData() { return super.userData; }
  set userData(value) {
    super.userData = value;

    if (!this.isAllConnected) return;

    this._elTextTransform.userData = value;
    this._elConstant.userData = value;
    this._elTextObject.userData = value;
    this._elVector.userData = value;
    this._elCalculation.userData = value;
    this._elTransformation.userData = value;
  }


  // @ts-ignore - decorator implemented.
  @numberAttribute(ValueMode.text) mode: ValueMode;
  // @ts-ignore - decorator implemented.
  @numberAttribute() allowedModes: ValueMode;
  // @ts-ignore - decorator implemented.
  @numberAttribute(ValueType.string) valueType: ValueType;
  // @ts-ignore - decorator implemented.
  @numberAttribute() allowedValueTypes: ValueType;
  // @ts-ignore - decorator implemented.
  @attribute("type", DisplayType.text) displayType: DisplayType;
  // @ts-ignore - decorator implemented.
  @numberAttribute() min: number;
  // @ts-ignore - decorator implemented.
  @numberAttribute() max: number;
  // @ts-ignore - decorator implemented.
  @numberAttribute() step: number;
  // @ts-ignore - decorator implemented.
  @boolAttribute() alwaysShowText: boolean;
  // @ts-ignore - decorator implemented.
  @boolAttribute() readOnlyText: boolean;

  calculationTransformFilter: (o: any) => boolean = () => true;

  @wrapElementProperty("value") @hookChange
  private _elText: HTMLInputElement;
  // @ts-ignore - decorator implemented.
  textElement: HTMLInputElement;
  get text() {
    return this.isCheckbox
      ? (this._elText.checked ? "true" : "")
      : this._elText.value;
  }
  set text(value) {
    if (this._elText.value === value) return;

    if (this.isCheckbox)
      this._elText.checked = value !== null && value !== undefined && value !== "";
    else
      this._elText.value = value || "";

    this.updateVisibility();
  }

  @wrapElementProperty("sourceValue", null) @child @hookChange
  private _elTextTransform: TransformValueElement;
  // @ts-ignore - decorator implemented.
  textTransformElement: TransformValueElement;

  @wrapElementProperty("sourceValue", null) @child @hookChange
  private _elConstant: TransformValueElement;
  // @ts-ignore - decorator implemented.
  constantElement: TransformValueElement;

  @wrapElementProperty("sourceValue", null) @child @hookChange
  private _elTextObject: TransformValueElement;
  // @ts-ignore - decorator implemented.
  textObjectElement: TransformValueElement;

  @wrapElementProperty("sourceValue", null) @child @hookChange
  private _elVector: TransformValueElement;
  // @ts-ignore - decorator implemented.
  vectorElement: TransformValueElement;

  @wrapElementProperty("sourceValue", null) @child @hookChange
  private _elCalculation: TransformValueElement;
  // @ts-ignore - decorator implemented.
  calculationElement: TransformValueElement;

  @wrapElementProperty("sourceValue", null) @child @hookChange
  private _elTransformation: TransformValueElement;
  // @ts-ignore - decorator implemented.
  transformationElement: TransformValueElement;

  @wrapElementProperty("sourceValue", "sourceValue", null)
  @wrapElementProperty("transform", "transform", null)
  @wrapElementProperty("modifier", "modifier", null)
  private get elTransform() {
    return this.mode === ValueMode.text ? this._elTextTransform
      : this.mode === ValueMode.constant ? this._elConstant
        : this.mode === ValueMode.textObject ? this._elTextObject
          : this.mode === ValueMode.vector ? this._elVector
            : this.mode === ValueMode.calculation ? this._elCalculation
              : this._elTransformation;
  }

  get sourceValueElement(): FilteredSelectElement { return this.elTransform.sourceValueElement; }
  get transformElement(): FilteredSelectElement { return this.elTransform.transformElement; }
  get modifierElement(): FilteredSelectElement { return this.elTransform.modifierElement; }

  sourceValue: any;
  transform: any;
  modifier: any;

  get filteredSelects() {
    return [
      ...this._elTextTransform.filteredSelects,
      ...this._elConstant.filteredSelects,
      ...this._elTextObject.filteredSelects,
      ...this._elVector.filteredSelects,
      ...this._elCalculation.filteredSelects,
      ...this._elTransformation.filteredSelects
    ];
  }

  protected get isCheckbox() {
    return this.displayType === DisplayType.checkbox && this.mode === ValueMode.text;
  }

  // @ts-ignore - unused param.
  protected attributeChangedCore(name: string, oldValue: string, newValue: string) {
    switch (name) {
      case "type":
      case "min":
      case "max":
      case "step":
        this._elText.setAttribute(name, newValue);
        break;

      case "value-type":
        if (this.isAllConnected) {
          this._elTextTransform.valueType = this.valueType;
          this._elConstant.valueType = this.valueType;
          this._elTextObject.valueType = this.valueType;
          this._elVector.valueType = this.valueType;
          this._elCalculation.valueType = this.valueType;
          this._elTransformation.valueType = this.valueType;
        }
        break;

      case "allowed-value-types":
        if (this.isAllConnected) {
          this._elTextTransform.allowedValueTypes = this.allowedValueTypes;
          this._elConstant.allowedValueTypes = this.allowedValueTypes;
          this._elTextObject.allowedValueTypes = this.allowedValueTypes;
          this._elVector.allowedValueTypes = this.allowedValueTypes;
          this._elCalculation.allowedValueTypes = this.allowedValueTypes;
          this._elTransformation.allowedValueTypes = this.allowedValueTypes;
        }
        break;
    }
  }

  protected allConnected() {
    super.allConnected();

    this._elTextTransform.kind = TransformKind.text;
    this._elConstant.kind = TransformKind.constant;
    this._elTextObject.kind = TransformKind.textObject;
    this._elVector.kind = TransformKind.vector;
    this._elCalculation.kind = TransformKind.calculation;
    this._elTransformation.kind = TransformKind.transform;

    this._elTextTransform.hideSourceValue = true;
    this._elTransformation.hideSourceValue = true;

    // HACK: Dynamically created instances don't accept the first value change without this.
    // TODO: Investigate.
    // setTimeout(() => this.raiseChange(), 1);
    setTimeout(() => this.raiseCustomEvent(new CustomEvent("change", { bubbles: true, detail: "HACK" })), 1);
  }

  protected hideAll() {
    hideElement(this._elTextTransform);
    hideElement(this._elConstant);
    hideElement(this._elTextObject);
    hideElement(this._elVector);
    hideElement(this._elCalculation);
    hideElement(this._elTransformation);
  }

  protected updateVisibility() {
    this.hideAll();
    this._elText.disabled = this.readOnlyText;

    displayElement(this._elText,
      this.alwaysShowText && (this.allowedModes & ValueMode.text) || this.mode === ValueMode.text);
    // showElement(this._elText);

    switch (this.mode) {
      case ValueMode.text:
        displayElement(this._elTextTransform, !!this.elTransform.sourceValue);
        displayElement(this._elBtnExpand, this.elTransform.style.display === "none");
        break;
      case ValueMode.constant: showElement(this._elConstant); break;
      case ValueMode.textObject: showElement(this._elTextObject); break;
      case ValueMode.vector: showElement(this._elVector); break;
      case ValueMode.calculation: showElement(this._elCalculation); break;
      case ValueMode.transform: showElement(this._elTransformation); break;
    }

    let visibleCount = 0;

    const incVisible = (mode: ValueMode) => visibleCount += (mode & this.allowedModes) ? 1 : 0;

    incVisible(ValueMode.text);
    incVisible(ValueMode.constant);
    incVisible(ValueMode.textObject);
    incVisible(ValueMode.vector);
    incVisible(ValueMode.calculation);
    incVisible(ValueMode.transform);

    displayElement(this._elBtnMode, visibleCount > 1);

    if (!this._isAllConnected) return;

    this._elTextTransform.update();
    this._elConstant.update();
    this._elTextObject.update();
    this._elVector.update();
    this._elCalculation.update();
    this._elTransformation.update();
  }

  // @ts-ignore - decorator implemented.
  private expand() {
    showElement(this._elTextTransform);
    hideElement(this._elBtnExpand);
  }

  protected getFilteredElement(id: string) { return this.getElement<FilteredSelectElement>(id); }

  // @ts-ignore - decorator implemented.
  private showDialog() {
    this.populateSelectMode();
    showElement(this._elBackground, "block");

    this.centerElement(this._elDialog, this._elBtnMode);

    this._elSelectMode.focus();
  }

  private hideDialog(update: boolean) {
    hideElement(this._elBackground);

    if (!update) return;

    this.mode = +this._elSelectMode.value as ValueMode;
    this.updateVisibility();
    this.raiseChange();
  }

  // @ts-ignore - decorator implemented.
  private acceptDialog() { this.hideDialog(true); }
  // @ts-ignore - decorator implemented.
  private cancelDialog() { this.hideDialog(false); }

  private populateSelectMode() {
    const list = this._elSelectMode;

    while (list.children.length > 0) {
      list.removeChild(list.lastChild!);
    }

    const add = (mode: ValueMode, caption: string) => {
      if (!(mode & this.allowedModes)) return;

      const option = document.createElement("option");
      option.text = caption || "" + mode;
      option.value = "" + mode;
      list.add(option);
    };

    add(ValueMode.text, "Value");
    add(ValueMode.constant, "Constant");
    add(ValueMode.textObject, "Text Object");
    add(ValueMode.vector, "Vector");
    add(ValueMode.calculation, "Calculation");
    add(ValueMode.transform, "Function");

    list.size = list.length;
  }
}
