import { ComponentBase } from '..';
import { Constructor } from '../../core';
import * as D2 from '../../decorators/decorator-utils';
import * as D from './decorator-utils';

export function component(tag: string) {
  return function <T extends Constructor<ComponentBase>>(constructor: T) {
    const attributes = D.getArrayMetadata<[string, string, string, boolean]>(D.ATTRS, constructor);
    const inputHooks = D.getArrayMetadata<string>(D.INPUT_HOOKS, constructor);
    const changeHooks = D.getArrayMetadata<string>(D.CHANGE_HOOKS, constructor);
    const eventHooks = D.getArrayMetadata<[string, string, string]>(D.EVENT_HOOKS, constructor);
    const children = D.getArrayMetadata<string>(D.CHILDREN, constructor);
    // @ts-ignore - missing property.
    const origObservedAttributes = constructor["observedAttributes"] || ComponentBase.observedAttributes;
    const propertiess = D.getArrayMetadata<[string, PropertyDescriptor]>(D.DESCRIPTORS, constructor);
    const attributesToInitialize = attributes.filter(a => a[1] !== undefined);

    function defineProperty(propertyName: string, getter: () => any, setter?: (x: any) => void) {
      D2.defineProperty(constructor.prototype, propertyName, getter, setter);
    }

    function defineMember(name: string, value: any) {
      D2.defineMember(constructor.prototype, name, value);
    }

    for (const [name, desc] of propertiess) {
      Object.defineProperty(constructor.prototype, name, desc);
    }

    // @ts-ignore - missing getOwnPropertyDescriptors definition.
    const descs = Object.getOwnPropertyDescriptors(constructor.prototype);

    const propertyNames = Object.getOwnPropertyNames(descs)
      .map(n => descs[n]["get"] && descs[n]["set"] && n)
      .filter(n => n !== undefined);

    defineMember("isSingleValueElement", constructor.name === "SingleValueElement");
    defineMember("isTransformElement", constructor.name === "TransformElement");

    D2.defineProperty(constructor, "observedAttributes", function () {
      const result = [...attributes.map(a => a[0]), ...origObservedAttributes];
      return result;
    });

    // @ts-ignore - this type annotation.
    defineProperty("_parent", function () { return Object.getPrototypeOf(Object.getPrototypeOf(this)); });

    if (children.length > 0) {
      defineProperty(
        "subComponents",
        // @ts-ignore - this type annotation.
        function () { return [...children.map(c => this[c], this), ...this._parent.subComponents]; });
    }

    if (propertyNames.length > 0)
      // @ts-ignore - this type annotation.
      defineProperty("propertyNames", function () { return [...propertyNames, ...this._parent.propertyNames]; });

    const origConnectedCoreD = Object.getOwnPropertyDescriptor(constructor.prototype, "connectedCore");
    const origConnectedCore = origConnectedCoreD ? origConnectedCoreD.value : () => { };

    defineMember("connectedCore", function () {
      // @ts-ignore - this type annotation.
      this._parent.connectedCore.call(this);
      // @ts-ignore - this type annotation.
      origConnectedCore.call(this);

      for (const [tag, initialValue] of attributesToInitialize) {
        // @ts-ignore - this type annotation.
        this.addAttribute(tag, initialValue);
      }
    });

    const origHookEventsD = Object.getOwnPropertyDescriptor(constructor.prototype, "hookEvents");
    const origHookEvents = origHookEventsD ? origHookEventsD.value : () => { };

    defineMember("hookEvents", function () {
      // @ts-ignore - this type annotation.
      this._parent.hookEvents.call(this);
      // @ts-ignore - this type annotation.
      origHookEvents.call(this);

      for (const propertyName of inputHooks) {
        // @ts-ignore - this type annotation.
        this.hookInput(this[propertyName]);
      }

      for (const propertyName of changeHooks) {
        // @ts-ignore - this type annotation.
        this.hookChange(this[propertyName]);
      }

      for (const info of eventHooks) {
        const [eventName, handlerName, propertyName] = info;
        // @ts-ignore - this type annotation.
        this.hookEvent(eventName, this[handlerName], this[propertyName]);
      }
    });

    customElements.define(tag, constructor);
    return constructor;
  }
}

