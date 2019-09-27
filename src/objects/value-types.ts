import { DisplayType, ValueMode, ValueType } from '../core';

export interface IValue {
  // category: Category;
  mode: ValueMode;
  valueType: ValueType;
  displayType: DisplayType;
  allowedModes: ValueMode;
  allowedValueTypes: ValueType;
  alwaysShowText: boolean;
  readOnlyText: boolean;
  allowOwnerAsSource: boolean;
  min?: number;
  max?: number;
  step?: number;
  text: string;
  sourceValue: any;
  transform: any;
  modifier: any;
}
