import { UpdatableObject } from '.';

export class DrawObject extends UpdatableObject {
  // @ts-ignore - unused param.
  protected renderCore(ctx: CanvasRenderingContext2D) { }

  render(ctx: CanvasRenderingContext2D) {
    try {
      this.renderCore(ctx);
    } catch {
    }
  }
}
