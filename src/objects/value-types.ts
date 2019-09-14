import { BaseObject } from '.';
import { Category, IDisposable, ValueType } from '../core';
import { ChangeArgs } from '../event-args';
import { EventFilter, Listener } from '../events';

export interface IValue {
  readonly name: string;
  readonly propertyName: string;
  readonly category: Category;
  readonly owner?: BaseObject;
  readonly valueType: ValueType;
  readonly allowedTypes: ValueType;
  text: string;
  value: any;

  onChanged(listener: Listener<ChangeArgs>, filter?: EventFilter): IDisposable;
  offChanged(listener: Listener<ChangeArgs>): void;
}
