export type Tristate<T> = T | undefined | null;
export type Constructor<T> = new (...args: any[]) => T;
export type SelectFilter = (x: any) => boolean;

export interface IDisposable {
	dispose(): void;
}

export enum DisplayType {
	text = "text",
	number = "number",
	range = "range",
	color = "color",
	checkbox = "checkbox"
}

export enum ValueType {
	string = 1 << 0,
	color = 1 << 1,
	number = 1 << 2,
	bool = 1 << 3,
	vector = 1 << 4,
	transform = 1 << 5,
}

export enum Category {
	text = "text",
	value = "value",
	constant = "constant",
	vectorObject = "vector_object",
	textObject = "text_object",
	transform = "transform",
	operation = "operation",
	calculation = "calculation",
	utils = "utils",
	misc = "misc"
}

export enum FilteredType {
	value = "value",
	transform = "transform"
}

export enum ValueMode {
	text = 1 << 0,
	property = 1 << 1,
	constant = 1 << 2,
	vector = 1 << 3,
	textObject = 1 << 4,
	transform = 1 << 5,
	calculation = 1 << 6,
}

export interface ICaptioned {
	name: string;
	caption?: string;
	title?: string;
	isOwned: boolean;
}

export enum CaptionMode {
	caption,
	title
}
