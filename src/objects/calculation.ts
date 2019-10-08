import { BaseObject, DrawObject, TextObject, TransformRef, TransformValue, Value, VectorObject, VectorValue } from '.';
import { Category, Utils, ValueMode } from '../core';

export class Calculation extends DrawObject {
  protected _alwaysDirty = false;
  protected deleteButton?: HTMLInputElement;
  protected _resultProps: BaseObject[] = [];
  protected _captionFormats: [BaseObject, string][] = [];

  constructor(name: string) {
    super(name, Category.calculation);
  }

  protected _descriptionFormat: string = "";
  get descriptionFormat() { return this._descriptionFormat; }
  set descriptionFormat(value) {
    this._descriptionFormat = value;
    this._description = undefined;

    if (this.div)
      this.updateDescription();
  }

  protected _description?: string;
  get description() { return this._description || (this._description = this.calcDescription()); }
  set description(value) {
    this._description = value;

    if (this.div)
      this.updateDescription();
  }

  private _div?: HTMLDivElement;
  get div() { return this._div || (this._div = this.createDiv()[0]); }

  protected _content?: HTMLDivElement;
  get content() { return this._content || (this._content = this.createDiv()[1]); }

  protected _descriptionElement?: HTMLElement;
  protected get descriptionElement() {
    return this._descriptionElement || (this._descriptionElement = this.createDiv()[2]);
  }

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
    return obj.getMathText();
    /*
    if (obj instanceof VectorObject)
      return obj.caption;

    if (obj instanceof TextObject)
      return obj.textValue;

    if (obj instanceof TransformRef)
      obj = obj.sourceValue;

    if (obj instanceof TransformValue) {
      if (obj.transform) {
        return obj.transform.name;
      }

      return obj.name.replace("_", "");
    }

    if (obj instanceof VectorValue)
      return obj.getMathText();
    // return obj.sourceValue ? obj.sourceValue.caption : Utils.formatVectorName(obj.name);

    if (!(obj instanceof Value)) return "XXX";

    switch (obj.mode) {
      case ValueMode.text: return obj.text;
      case ValueMode.constant: return obj.sourceValue ? obj.sourceValue.caption : obj.title;
      case ValueMode.text: return obj.sourceValue ? obj.sourceValue.caption : obj.title;
      default: return obj.title;
    }
    //*/
  }

  protected getArgumentName(obj: BaseObject) {
    if (obj instanceof VectorObject)
      return obj.name.replace("_", "");

    if (obj instanceof TextObject)
      return obj.textValue;

    if (obj instanceof TransformRef)
      obj = obj.sourceValue;

    if (obj instanceof TransformValue) {
      if (obj.transform) {
        return obj.transform.name;
      }

      return obj.name.replace("_", "");
    }

    if (obj instanceof VectorValue) {
      if (obj.sourceValue)
        return obj.sourceValue.owner ? obj.sourceValue.owner.name.replace("_", "") : obj.name.replace("_", "");

      return obj.name.replace("_", "");
    }

    if (!(obj instanceof Value)) return "XXX";

    switch (obj.mode) {
      case ValueMode.text: return obj.text;
      case ValueMode.constant: return obj.sourceValue ? obj.sourceValue.name.replace("_", "") : obj.name.replace("_", "");
      case ValueMode.text: return obj.sourceValue ? obj.sourceValue.name.replace("_", "") : obj.name.replace("_", "");
      default: return obj.name.replace("_", "");
    }
  }

  protected replaceFormatStrings(format: string) {
    if (this._children) {
      for (let i = 0; i < this._children.length; i++) {
        const child = this._children[i];
        format = format.replace(new RegExp(`{p${i + 1}}`, "g"), this.getDescriptionName(child));
        format = format.replace(new RegExp(`{a${i + 1}}`, "g"), this.getArgumentName(child));
      }
    }
    return format;
  }

  protected updateCaptions() {
    for (const [obj, format] of this._captionFormats) {
      obj.caption = this.replaceFormatStrings(format);
    }
  }

  protected calcDescription() {
    return this.replaceFormatStrings(this.descriptionFormat);
  }

  protected updateDescription() {
    this.descriptionElement.innerHTML = this.description;
  }

  protected onChildChanged() {
    this.dirty();
    this._description = undefined;
    this.updateCaptions();
    this.updateDescription();
  }

  protected createDiv(): [HTMLDivElement, HTMLDivElement, HTMLElement] {
    const titleDiv = document.createElement("div");
    const descDiv = document.createElement("div");
    const div = document.createElement("div");
    const description = document.createElement("span");
    const content = document.createElement("div");
    this.deleteButton = document.createElement("input");
    const title = document.createElement("span");
    const deleteButton = this.deleteButton;

    div.className = "flexvert";
    titleDiv.className = "title";
    title.className = "calctitle";
    description.className = "description";
    description.style.wordWrap = "break-word";
    content.className = "gridhoriz2";
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

    title.innerText = Utils.capitalizeUnder(this.name);

    this._div = div;
    this._content = content;
    this._descriptionElement = description;
    this.updateDescription();
    return [div, content, description];
  }
}
