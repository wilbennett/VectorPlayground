import { addChildPropertyName } from '.';

export function child(target: object, key: string) {
  addChildPropertyName(target.constructor, key);
}
