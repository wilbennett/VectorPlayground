import { UpdatableObject } from ".";

export class Calculation extends UpdatableObject {
  div?: HTMLDivElement;
  protected content?: HTMLDivElement;
  protected descriptionElement?: HTMLElement;
  protected deleteButton?: HTMLInputElement;

  // @ts-ignore - unused param.
  protected addParamElements(content: HTMLDivElement) {}

  protected createDiv() {
    const titleDiv = document.createElement("div");
    const descDiv = document.createElement("div");
    this.div = document.createElement("div");
    this.descriptionElement = document.createElement("span");
    this.content = document.createElement("div");
    this.deleteButton = document.createElement("input");
    const title = document.createElement("span");
    const div = this.div;
    const description = this.descriptionElement;
    const content = this.content;
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

    this.addParamElements(this.content);
  }
}
