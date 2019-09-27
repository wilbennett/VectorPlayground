import { ICaptioned } from './types';

export class Captioned implements ICaptioned {
    constructor(
        public readonly name: string,
        caption?: string,
        title?: string,
        public readonly isOwned: boolean = false) {
        this.caption = caption || name;
        this.title = title || this.caption;
    }

    readonly caption: string;
    readonly title: string;
}
