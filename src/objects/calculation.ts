import { BaseObject, TextObject, UpdatableObject, Value, VectorObject, VectorValue } from '.';
import { Category, Utils, ValueMode } from '../core';

export class Calculation extends UpdatableObject {
  protected _alwaysDirty = false;
  protected descriptionElement?: HTMLElement;
  protected deleteButton?: HTMLInputElement;
  protected _resultProps: BaseObject[] = [];
  protected _captionFormats: [BaseObject, string][] = [];

  constructor(name: string) {
    super(name, Category.calculation);
  }

  private _div?: HTMLDivElement;
  get div() { return this._div || (this._div = this.createDiv()[0]); }

  protected _content?: HTMLDivElement;
  get content() { return this._content || (this._content = this.createDiv()[1]); }

  update() {
    if (!this._isDirty) return;

    try {
      this.updateCore();
    } finally {
      if (!this._alwaysDirty)
        this.clean();
    }
  }

  protected _isDirty = false;
  protected get isDirty() { return this._isDirty; }

  protected dirty() { this._isDirty = true; }
  protected clean() { this._isDirty = false; }

  protected addResultProps(...props: Value<any>[]) {
    this._resultProps.push(...props);
  }

  protected addCaptionFormat(obj: BaseObject, format: string) {
    this._captionFormats.push([obj, format]);
  }

  protected getDescriptionName(obj: BaseObject) {
    if (obj instanceof VectorObject)
      return obj.caption;

    if (obj instanceof TextObject)
      return obj.textValue;

    if (obj instanceof VectorValue)
      return obj.sourceValue ? obj.sourceValue.caption : Utils.formatVectorName(obj.name);

    if (!(obj instanceof Value)) return "XXX";

    switch (obj.mode) {
      case ValueMode.text: return obj.text;
      case ValueMode.constant: return obj.sourceValue ? obj.sourceValue.caption : obj.title;
      case ValueMode.text: return obj.sourceValue ? obj.sourceValue.caption : obj.title;
      default: return obj.title;
    }
  }

  protected calcCaption(format: string) {
    if (this._children) {
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        format = format.replace(new RegExp(`{p${i + 1}}`, "g"), this.getDescriptionName(child));
      }
    }
    return format;
  }

  protected updateCaptions() {
    for (const [obj, format] of this._captionFormats) {
      obj.caption = this.calcCaption(format);
    }
  }

  protected onChildChanged() {
    this.dirty();
    this.updateCaptions();
  }

  protected createDiv() {
    const titleDiv = document.createElement("div");
    const descDiv = document.createElement("div");
    const div = document.createElement("div");
    this.descriptionElement = document.createElement("span");
    const content = document.createElement("div");
    this.deleteButton = document.createElement("input");
    const title = document.createElement("span");
    const description = this.descriptionElement;
    const deleteButton = this.deleteButton;

    div.className = "flexvert";
    titleDiv.className = "title";
    title.className = "calctitle";
    description.className = "description";
    content.className = "gridhoriz2";
    title.innerText = this.name;
    deleteButton.className = "deletebutton";
    deleteButton.type = "button";
    deleteButton.value = "[X]";
    deleteButton.addEventListener("click", this.dispose.bind(this));

    descDiv.appendChild(description);
    titleDiv.appendChild(title);
    titleDiv.appendChild(deleteButton);
    titleDiv.appendChild(descDiv);
    div.appendChild(titleDiv);
    div.appendChild(content);

    this._div = div;
    this._content = content;
    return [div, content];
  }
}
