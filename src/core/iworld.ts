import { BaseObject, Category, FilteredList, PromiseEx, Vec, VectorObject } from '.';

console.log("iworld init start");
export interface IWorld {
    origin: VectorObject;
    debugLogActive: boolean;
    debugDetail: boolean;
    debugEvents: boolean;
    debugVectors: boolean;
    debugTexts: boolean;

    addFilteredLists(...lists: FilteredList<BaseObject>[]): void;
    addObjects(...objs: BaseObject[]): void;
    removeObjects(...objs: BaseObject[]): void;
    getUniqueText(category: Category, predicate: (obj: BaseObject, text: string) => boolean, text: string): string;
    getUniqueName(category: Category, text: string): string;
    getUniqueCaption(category: Category, text: string): string;
    convertThickness(thickness: number): number;

    initialize(): void;

    drawVector(
        ctx: CanvasRenderingContext2D,
        vec: Vec,
        origin: Vec,
        lineWidth: number,
        opacity: number,
        color: string): void;

    drawText(
        ctx: CanvasRenderingContext2D,
        text: string,
        position: Vec,
        align: string,
        angle: number,
        size: number,
        opacity: number,
        color: string): void;
}

export const promisedWorld = new PromiseEx<IWorld>();

export function setWorld(world: IWorld) { promisedWorld.resolve(world); }

console.log("iworld init end");
