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

/*
class WorldContainer {
    private _world!: IWorld;
    get world() { return this._world; }
    set world(value) {
        if (value === this._world) return;

        this._changeArgs.setValues(this._world, value);
        this._world = value;
        this._emitter.emit(this._changeArgs);
    }

    private _emitter = new TypedEvent<ChangeEventArgs<IWorld>>(this);
    private _changeArgs = new ChangeEventArgs<IWorld>();

    onChange(listener: Listener<ChangeEventArgs<IWorld>>) { return this._emitter.on(listener); }
}
//*/

export const promisedWorld = new PromiseEx<IWorld>();
// export const worldContainer = new WorldContainer();

export function setWorld(world: IWorld) { promisedWorld.resolve(world); }

console.log("iworld init end");
