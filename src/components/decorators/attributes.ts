import { addAttribute, addDescriptor } from './index';
import { createProperty } from '../../decorators/index';
import { Utils } from '../../utils/index';

const { defaultNullOrUndefined, toNumber, toString } = Utils;

function calcTagName(name: string) {
  const match = name.split(/(?=[A-Z])/g);
  return match.length > 0 ? match.join("-").toLocaleLowerCase() : name;
}

function _attribute(target: object, key: string, tag: string, defaultValue?: string, initialValue?: string, descriptor?: PropertyDescriptor) {
  const isAccessor = descriptor !== undefined;
  initialValue = initialValue !== undefined ? initialValue : defaultValue;
  addAttribute(target.constructor, tag, initialValue, key, !isAccessor);

  if (isAccessor) return;

  const prop = createProperty(
    // @ts-ignore - this type annotation.
    function () { return this.hasAttribute(tag) ? this.getAttribute(tag) : defaultValue; },
    function (value) {
      if (value === undefined || value === null)
        // @ts-ignore - this type annotation.
        this.removeAttribute(tag);
      else
        // @ts-ignore - this type annotation.
        this.setAttribute(tag, value);
    });

  addDescriptor(target.constructor, key, prop);
}

export function attribute(tag: string, defaultValue?: string, initialValue?: string) {
  return function (target: object, key: string, descriptor?: PropertyDescriptor) {
    _attribute(target, key, tag, defaultValue, initialValue, descriptor);
  }
}

export function autoAttribute(defaultValue?: string, initialValue?: string) {
  return function (target: object, key: string, descriptor?: PropertyDescriptor) {
    const tag = calcTagName(key);
    _attribute(target, key, tag, defaultValue, initialValue, descriptor);
  }
}

export function boolAttribute(tag: string, initialValue?: boolean): any;
export function boolAttribute(initialValue?: boolean): any;
export function boolAttribute(param1?: any, param2?: boolean): any {
  return function (target: object, key: string, descriptor?: PropertyDescriptor) {
    let tag: string;
    let initialValue: string | undefined;

    if (param1 === undefined || typeof param1 === "boolean") {
      tag = calcTagName(key);
      initialValue = param1 ? "" : undefined;
    } else {
      tag = param1;
      initialValue = param2 ? "" : undefined;
    }

    const isAccessor = descriptor !== undefined;
    addAttribute(target.constructor, tag, initialValue, key, !isAccessor);

    if (isAccessor) return;

    const prop = createProperty(
      // @ts-ignore - this type annotation.
      function () { return this.hasAttribute(tag); },
      function (value) {
        if (value)
          // @ts-ignore - this type annotation.
          this.setAttribute(tag, "");
        else
          // @ts-ignore - this type annotation.
          this.removeAttribute(tag);
      });

    addDescriptor(target.constructor, key, prop);
  }
}

export function numberAttribute(tag?: string, defaultValue?: number, initialValue?: number): any;
export function numberAttribute(defaultValue?: number, initialValue?: number): any;
export function numberAttribute(param1?: any, param2?: number, param3?: number): any {
  return function (target: object, key: string, descriptor?: PropertyDescriptor) {
    let tag: string;
    let defaultValue: number | undefined;
    let initialValue: string | undefined | null;

    if (param1 === undefined || typeof param1 === "number") {
      tag = calcTagName(key);
      defaultValue = param1;
      initialValue = toString(defaultNullOrUndefined(param2, defaultValue));
    } else {
      tag = param1;
      defaultValue = param2;
      initialValue = toString(defaultNullOrUndefined(param3, defaultValue));
    }

    const isAccessor = descriptor !== undefined;
    addAttribute(target.constructor, tag, initialValue, key, !isAccessor);

    if (isAccessor) return;

    const prop = createProperty(
      // @ts-ignore - this type annotation.
      function () { return this.hasAttribute(tag) ? toNumber(this.getAttribute(tag)) : defaultValue; },
      function (value) {
        value = defaultNullOrUndefined(value, defaultValue);

        if (value === undefined || value === null)
          // @ts-ignore - this type annotation.
          this.removeAttribute(tag);
        else
          // @ts-ignore - this type annotation.
          this.setAttribute(tag, "" + value);
      });

    addDescriptor(target.constructor, key, prop);
  }
}
