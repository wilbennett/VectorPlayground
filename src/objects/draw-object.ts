import { BaseObject } from ".";

export class DrawObject extends BaseObject {
  // @ts-ignore - unused param.
  protected renderCore(ctx: CanvasRenderingContext2D) { }

  render(ctx: CanvasRenderingContext2D) {
    try {
      this.renderCore(ctx);
    } catch {
    }
  }
}
