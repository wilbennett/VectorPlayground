import { addPropertyName } from ".";

export function property(target: object, key: string) {
  addPropertyName(target.constructor, key);
}
