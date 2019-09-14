import { BaseObject } from ".";

export class UpdatableObject extends BaseObject {
  protected updateCore() {}

  update() {
    try {
      this.updateCore();
    } catch {
    }
  }
}
