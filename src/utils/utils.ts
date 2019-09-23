import { Tristate } from '../core';

// @ts-ignore - no definition for stackTraceLimit.
Error.stackTraceLimit = 15;

export class Utils {
  static readonly CALLER_REGEX: string = String.raw`at (new \S+|\S+)( \[as (\S+)\])?`;
  static readonly TWO_PI = 2 * Math.PI;
  static readonly ONE_DEGREE = Math.PI / 180;
  static readonly ONE_RADIAN = 180 / Math.PI;

  static radians(degrees: number) { return degrees * Math.PI / 180; }
  static degrees(radians: number) { return radians * 180 / Math.PI; }
  static clamp(value: number, min: number, max: number) { return Math.min(Math.max(value, min), max); }

  static toNumber(text: Tristate<string>) { return text ? +text : NaN; }

  static toString(value?: any) {
    return value === undefined ? undefined
      : value === null ? null
        : "" + value;
  }

  static randomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static isNull(value: any) { return value === null; }
  static isUndefined(value: any) { return value === undefined; }
  static isEmpty(value: any) { return value === undefined || value === null; }
  static hasValue(value: any) { return value !== undefined && value !== null; }

  static defaultUndefined<T>(value?: T, defaultValue?: T) {
    return value !== undefined ? value : defaultValue;
  }

  static defaultNull<T>(value?: T, defaultValue?: T) {
    return value !== null ? value : defaultValue;
  }

  static defaultNullOrUndefined<T>(value?: T, defaultValue?: T) {
    return value !== undefined && value !== null ? value : defaultValue;
  }

  static checkType<T>(constructor: Function, obj?: T) {
    if (!obj) return undefined;

    return obj instanceof constructor ? obj : undefined;
  }

  static capitalizeUnder(text: Tristate<string>) {
    return text
      ? text[0].toUpperCase() + text.substr(1).replace(/_\w/g, s => " " + s[1].toUpperCase())
      : "";
  }

  static mergeCombiningChar(text: string, char: string, trailChar?: string) {
    if (!text) return text;

    if (!trailChar || text.length === 1)
      return Array.from(text).map(c => c + char).join("");

    let result = Array.from(text);
    const lastChar = result.pop();
    result = result.map(c => c + char);
    result.push(lastChar!, trailChar);
    return result.join("");
  }

  static formatVectorName(name: string) {
    return this.mergeCombiningChar(name.replace("_", " "), "\u0305", "\u0350");
  }

  static getCaller(...ignore: string[]) {
    const callstack = new Error().stack || "";
    const callerRegex = new RegExp(this.CALLER_REGEX, "mg");
    callerRegex.exec(callstack);
    callerRegex.exec(callstack);
    var match = callerRegex.exec(callstack);
    let caller = match && (match[3] || match[1]);

    while (match && (!caller || ignore.findIndex(x => caller!.startsWith(x)) >= 0)) {
      match = callerRegex.exec(callstack);
      caller = match && (match[3] || match[1]) || caller;
    }

    return caller || "";
  }
}
