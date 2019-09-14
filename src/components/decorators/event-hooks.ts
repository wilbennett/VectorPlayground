import { addChangeHookPropertyName, addEventHook, addInputHookPropertyName } from '.';

export function hookInput(target: object, key: string) {
  addInputHookPropertyName(target.constructor, key);
}

export function hookChange(target: object, key: string) {
  addChangeHookPropertyName(target.constructor, key);
}

export function hookEvent(eventName: string, handlerName: string) {
  return function (target: object, key: string) {
    addEventHook(target.constructor, eventName, handlerName, key);
  }
}
