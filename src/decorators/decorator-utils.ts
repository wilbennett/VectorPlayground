export type Getter = () => any;
export type Setter = (x: any) => void;

export function createProperty(getter?: Getter, setter?: Setter): PropertyDescriptor {
  if (getter && setter)
    return { get: getter, set: setter, enumerable: true, configurable: true };

  if (getter)
    return { get: getter, enumerable: true, configurable: true };

  return { set: setter, enumerable: true, configurable: true };
}

export function createMember(value: Function): PropertyDescriptor {
  return { value: value, enumerable: true, configurable: true };
}

export function defineProperty(target: any, propertyName: string, descriptor: PropertyDescriptor): void;
export function defineProperty(target: any, propertyName: string, getter?: Getter, setter?: Setter): void;
export function defineProperty(target: any, propertyName: string, param3?: Getter | PropertyDescriptor, setter?: Setter): void {
  if (typeof param3 === "object") {
    Object.defineProperty(target, propertyName, param3);
    return;
  }

  Object.defineProperty(target, propertyName, createProperty(param3, setter));
}

export function replaceProperty(target: any, propertyName: string, descriptor: PropertyDescriptor): void;
export function replaceProperty(target: any, propertyName: string, getter?: Getter, setter?: Setter): void;
export function replaceProperty(target: any, propertyName: string, param3?: Getter | PropertyDescriptor, setter?: Setter): void {
  // @ts-ignore - index {}.
  delete target[propertyName];

  if (typeof param3 === "object") {
    Object.defineProperty(target, propertyName, param3);
    return;
  }

  Object.defineProperty(target, propertyName, createProperty(param3, setter));
}

export function defineMember(target: object, propertyName: string, descriptor: PropertyDescriptor): void;
export function defineMember(target: object, propertyName: string, value: any): void;
export function defineMember(target: object, propertyName: string, param3?: any): void {
  if (typeof param3 === "object") {
    Object.defineProperty(target, propertyName, param3);
    return;
  }

  Object.defineProperty(target, propertyName, createMember(param3));
}

export function replaceMember(target: any, propertyName: string, descriptor: PropertyDescriptor): void;
export function replaceMember(target: any, propertyName: string, value: any): void;
export function replaceMember(target: any, propertyName: string, param3?: any): void {
  delete target[propertyName];

  if (typeof param3 === "object") {
    Object.defineProperty(target, propertyName, param3);
    return;
  }

  Object.defineProperty(target, propertyName, createMember(param3));
}
