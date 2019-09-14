export enum EventKind {
  caption = "caption",
  value = "value"
}

export class EventArgs {
  sender: any;
  kind?: string;

  toString() { return `${this.sender.propertyName || this.sender.name} (${this.kind})`; }
}
