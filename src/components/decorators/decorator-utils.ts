import 'reflect-metadata';

export type Getter = () => any;
export type Setter = (x: any) => void;

export const ATTRS = "ATTRS";
export const ELEMENT_VALUES = "ELEMENT_VALUES";
export const PROPS = "PROPS";
export const INPUT_HOOKS = "INPUT_HOOKS";
export const CHANGE_HOOKS = "CHANGE_HOOKS";
export const EVENT_HOOKS = "EVENT_HOOKS";
export const CHILDREN = "CHILDREN";
export const DESCRIPTORS = "DESCRIPTORS";

export function getMetadata<T>(key: string, target: any) {
  return (Reflect.getMetadata(key, target)) as T;
}

export function getArrayMetadata<T>(key: string, target: any) {
  return getMetadata<T[]>(key, target) || [];
}

export function getSetMetadata<T>(key: string, target: object) {
  return getMetadata<Set<T>>(key, target) || new Set<T>();
}

export function updateArrayMetadata<T>(key: string, target: object, value: T) {
  const list = getArrayMetadata<T>(key, target);
  list.push(value);
  Reflect.defineMetadata(key, list, target);
}

export function updateSetMetadata<T>(key: string, target: object, value: T) {
  const list = getSetMetadata<T>(key, target);
  list.add(value);
  Reflect.defineMetadata(key, list, target);
}

export function addDescriptor(target: object, propertyName: string, descriptor: PropertyDescriptor) {
  updateArrayMetadata(DESCRIPTORS, target, [propertyName, descriptor]);
}

export function addAttribute(target: object, tag: string, initialValue: string | undefined | null, propertyName: string, generateProperty: boolean = false) {
  updateArrayMetadata(ATTRS, target, [tag, initialValue, propertyName, generateProperty]);
}

export function addPropertyName(target: object, name: string) {
  updateSetMetadata(PROPS, target, name);
}

export function addElementValue(target: object, fieldName: string, propertyName: string) {
  updateArrayMetadata(ELEMENT_VALUES, target, [fieldName, propertyName]);
}

export function addInputHookPropertyName(target: object, name: string) {
  updateArrayMetadata(INPUT_HOOKS, target, name);
}

export function addChangeHookPropertyName(target: object, name: string) {
  updateArrayMetadata(CHANGE_HOOKS, target, name);
}

export function addEventHook(target: object, eventName: string, handlerName: string, propertyName: string) {
  updateArrayMetadata(EVENT_HOOKS, target, [eventName, handlerName, propertyName]);
}

export function addChildPropertyName(target: object, name: string) {
  updateArrayMetadata(CHILDREN, target, name);
}
