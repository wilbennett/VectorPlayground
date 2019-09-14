import { addDescriptor } from '.';
import { createProperty } from '../../decorators';

function calcRootName(name: string) {
  const match = name.match(/[A-Z].*/g);
  return match && match.length > 0 ? match[0][0].toLocaleLowerCase() + match[0].substr(1) : undefined;
}

export function wrapElementProperty(
  elementProperty: string = "value",
  valuePropertyName?: string | null,
  propertyName?: string | null) {
  return function (target: object, key: string) {
    const genValueProperty = valuePropertyName !== null;
    const genProperty = propertyName !== null;
    const rootName = calcRootName(key);
    propertyName = propertyName || rootName + "Element";
    const _valuePropertyName = valuePropertyName || rootName || key;

    if (genProperty && !Object.getOwnPropertyDescriptor(target, propertyName)) {
      // @ts-ignore - this type annotation.
      const prop = createProperty(function () { return this[key]; });
      addDescriptor(target.constructor, propertyName, prop);
    }

    if (genValueProperty && !Object.getOwnPropertyDescriptor(target, _valuePropertyName)) {
      const prop = createProperty(
        // @ts-ignore - this type annotation.
        function () { return this[key][elementProperty]; },
        function (value: any) {
          // @ts-ignore - this type annotation.
          if (!this._isAllConnected) {
            // @ts-ignore - this type annotation.
            self = this;
            // @ts-ignore - this type annotation.
            this.queueConnectAction(() => self[_valuePropertyName] = value);
            return;
          }
          // @ts-ignore - this type annotation.
          if (this[key][elementProperty] === value) return;

          // @ts-ignore - this type annotation.
          this[key][elementProperty] = value;
          // @ts-ignore - this type annotation.
          this.updateVisibility();
        });

      addDescriptor(target.constructor, _valuePropertyName, prop);
    }
  }
}
