import { UpdatableObject } from '.';
import { Category } from '../core';

export class Calculation extends UpdatableObject {
  protected _alwaysDirty = false;
  protected descriptionElement?: HTMLElement;
  protected deleteButton?: HTMLInputElement;

  constructor(name: string) {
    super(name, Category.calculation);
  }

  private _div?: HTMLDivElement;
  get div() { return this._div || (this._div = this.createDiv()[0]); }

  protected _content?: HTMLDivElement;
  get content() { return this._content || (this._content = this.createDiv()[1]); }

  protected _isDirty = false;
  protected get isDirty() { return this._isDirty; }


  protected onChildChanged() { this.dirty(); }

  protected dirty() { this._isDirty = true; }
  protected clean() { this._isDirty = false; }

  update() {
    if (!this._isDirty) return;

    try {
      this.updateCore();
    } finally {
      if (!this._alwaysDirty)
        this.clean();
    }
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
