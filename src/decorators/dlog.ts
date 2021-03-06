import 'reflect-metadata';

import { createMember, createProperty, replaceProperty } from '.';
import { Constructor } from '../core';
import { css, CSS_START, NORMAL, Utils } from '../utils';

let dLogIndent = "   ";
let curLogIndent = "";
let active = false;
let isLog = false;
let detailMode = false;
let logGetResult = true;
let logSetParam = true;
let logMethodResult = true;
let maxResultLength = 50;

// const RED = CSS_START + "color:red";
// const GREEN = CSS_START + "color:green";
const BLUE = CSS_START + "color:blue";
const MAGENTA = CSS_START + "color:magenta";
const BOLD = CSS_START + "font-weight:bold";
// const UNDERLINE = CSS_START + "text-decoration:underline";
const CALL = BOLD;
const STATE = MAGENTA + BOLD;
const RESULT = BLUE + BOLD;

function hasValue(value: any) { return value !== null && value !== undefined; }
// function isNothing(value: any) { return value === null || value === undefined; }

function incLogIndent(isDetail: boolean) {
  if (isDetail && !detailMode) return;

  if (active && isLog)
    curLogIndent += dLogIndent;
}

function decLogIndent(isDetail: boolean) {
  if (isDetail && !detailMode) return;

  if (active && isLog)
    curLogIndent = curLogIndent.substr(dLogIndent.length, Infinity);
}

function getProps(target: any): [string, PropertyDescriptor, string][] {
  return Reflect.getMetadata("props", target) || [];
}

function addProp(target: any, name: string, prop: PropertyDescriptor, kind: string) {
  const props = getProps(target);
  props.push([name, prop, kind]);
  Reflect.defineMetadata("props", props, target);
}


function getPropEntries(target: any, propName: string) {
  const props = getProps(target);
  return props.filter(m => m[0] === propName);
}

function getProp(target: any, propName: string) {
  const props = getProps(target);
  const entry = props.find(m => m[0] === propName);
  return entry && entry[1];
}

function hasPropEntry(target: any, name: string, kind: string): boolean {
  const props = getPropEntries(target, name);
  return !!props.find(p => p[2] === kind);
}

export function isDLogActive() { return active; }
export function setDLogActive(value: boolean) { active = value; }
export function isDLog() { return isLog; }
export function setIsDLog(value: boolean) { isLog = value; }
export function isDetailMode() { return isDLog && detailMode; }
export function setDetailMode(value: boolean) { detailMode = value; }
export function setIndent(value: string) { dLogIndent = value; }

export function getLogGetResult() { return logGetResult; }
export function setLogGetResult(value: boolean) { logGetResult = value; }
export function getLogSetParam() { return logSetParam; }
export function setLogSetParam(value: boolean) { logSetParam = value; }
export function getLogMethodResult() { return logMethodResult; }
export function setLogMethodResult(value: boolean) { logMethodResult = value; }
export function getMaxResultLength() { return maxResultLength; }
export function setMaxResultLength(value: number) { maxResultLength = value; }

export function logd(...msg: any[]) {
  if (typeof msg[0] === "string")
    console.log(curLogIndent + msg[0], ...msg.splice(1));
  else
    console.log(curLogIndent, ...msg);
}

export function dlog(...msg: any[]) {
  if (!active) return;
  if (!isLog) return;

  logd(...msg);
}

export function dlogDetail(...msg: any[]) {
  if (!detailMode) return;

  dlog(...msg);
}

function dlogCheckDetail(isDetail: boolean, ...msg: any[]) {
  if (isDetail && !detailMode) return;

  dlog(...msg);
}

// function glogCheckDetail(isDetail: boolean, ...msg: any[]) {
//   if (!active) return false;
//   if (!isLog) return false;
//   if (isDetail && !detailMode) return false;

//   console.group(...msg);
//   return true;
// }

function gclogCheckDetail(isDetail: boolean, ...msg: any[]) {
  if (!active) return false;
  if (!isLog) return false;
  if (isDetail && !detailMode) return false;

  console.groupCollapsed(...msg);
  return true;
}

function gelog(...msg: any[]) {
  console.log(...msg);
  console.groupEnd();
}

interface DLoggedSettings {
  setLogIf?: (args: any[]) => boolean;
  logCtor?: boolean;
  isDetail?: boolean;
  logAllProps?: boolean;
  logAllMethods?: boolean;
  propState?: (self: any) => string;
  methodState?: (self: any) => string;
  propSetLogIf?: (self: any) => boolean;
  methodSetLogIf?: (self: any) => boolean;
  propDetail?: boolean;
  methodDetail?: boolean;
  exclude?: string[];
}

export function dlogged({
  setLogIf,
  logCtor = false,
  isDetail = true,
  logAllProps = false,
  logAllMethods = false,
  propState,
  methodState,
  propSetLogIf,
  methodSetLogIf,
  propDetail = false,
  methodDetail = false,
  exclude = []
}: DLoggedSettings = {}) {
  return function <T extends Constructor<{}>>(constructor: T) {
    if (logAllMethods || logAllProps) {
      const names = Object.getOwnPropertyNames(constructor.prototype);

      for (const name of names) {
        if (name === "constructor") continue;
        if (exclude.indexOf(name) >= 0) continue;

        const desc = Object.getOwnPropertyDescriptor(constructor.prototype, name)!;

        if (logAllProps && (desc.get || desc.set)) {
          const shouldSetLog = !!propSetLogIf && !hasPropEntry(constructor, name, "setdlog");
          const shouldClog = !hasPropEntry(constructor, name, "clog");

          if (shouldClog)
            Reflect.decorate([clog(propState, propDetail)], constructor.prototype, name, desc);

          if (shouldSetLog)
            // @ts-ignore - not property or method decorator.
            Reflect.decorate([setDlog(propSetLogIf)], constructor.prototype, name, desc);
        } else if (logAllMethods && desc.value) {
          const shouldSetLog = !!methodSetLogIf && !hasPropEntry(constructor, name, "setdlog");
          const shouldClog = !hasPropEntry(constructor, name, "clog");

          if (shouldClog)
            Reflect.decorate([clog(methodState, methodDetail)], constructor.prototype, name, desc);

          if (shouldSetLog)
            // @ts-ignore - not property or method decorator.
            Reflect.decorate([setDlog(methodSetLogIf)], constructor.prototype, name, desc);
        }
      }
    }

    const props = getProps(constructor);

    for (const [propName, prop] of props) {
      replaceProperty(constructor.prototype, propName, prop);
    }

    if (setLogIf || logCtor) {
      const name = constructor.name;

      return class extends constructor {
        constructor(...args: any[]) {
          const orig = isLog;

          try {
            isLog = isLog || !!(setLogIf && setLogIf(args));

            if (logCtor) {
              const caller = Utils.getCaller("eval ", "new ", "http:", "Array.");

              dlogCheckDetail(isDetail, ...css`${name}.${STATE}ctor${NORMAL} ${CALL}START${NORMAL} <== ${caller}`);
              incLogIndent(isDetail);
            }

            super(...args);
          } finally {
            if (logCtor) {
              decLogIndent(isDetail);
              dlogCheckDetail(isDetail, ...css`${name}.${STATE}ctor${NORMAL} ${CALL}END${NORMAL}`);
            }

            isLog = orig;
          }
        }
      }
    }

    return constructor;
  }
}

export function setDlog(condition?: (self: any) => boolean) {
  const cond = condition || (() => true);

  return function (target: Object, key: string, descriptor?: PropertyDescriptor) {
    if (!descriptor) return;

    const originalDesc = getProp(target.constructor, key) || descriptor;

    if (originalDesc.value) {
      const newMethod = function (...args: any[]) {
        const orig = isLog;
        // @ts-ignore - untyped this.
        isLog = isLog || cond(this);

        try {
          // @ts-ignore - untyped this.
          return originalDesc.value.apply(this, args);
        } finally {
          isLog = orig;
        }
      };

      addProp(target.constructor, key, createMember(newMethod), "setdlog");
      return descriptor;
    }

    let getter = originalDesc.get && function () {
      const orig = isLog;
      // @ts-ignore - untyped this.
      isLog = isLog || cond(this);

      try {
        // @ts-ignore - untyped this.
        return originalDesc.get!.call(this);
      } finally {
        isLog = orig;
      }
    };

    let setter = originalDesc.set && function (value: any) {
      const orig = isLog;
      // @ts-ignore - untyped this.
      isLog = isLog || cond(this);

      try {
        // @ts-ignore - untyped this.
        originalDesc.set!.call(this, value);
      } finally {
        isLog = orig;
      }
    };

    addProp(target.constructor, key, createProperty(getter, setter), "setdlog");
    return descriptor;
  }
}

function clogMethod(target: Object, key: string, descriptor: PropertyDescriptor, isDetail: boolean, state?: (self: any) => string) {
  const originalDesc = getProp(target.constructor, key) || descriptor;
  const name = target.constructor.name;

  const newMethod = function (...args: any[]) {
    if (!active || !isLog)
      // @ts-ignore - untyped this.
      return originalDesc.value.apply(this, args);

    // @ts-ignore - untyped this.
    const pre = state ? ` (${state(this)})` : "";
    let res: any;
    let logged = false;

    try {
      // const caller = Utils.getCaller(key, "eval ");
      const caller = Utils.getCaller(key, "eval ", "http:", "Array.", "TypedEvent.");

      logged = gclogCheckDetail(isDetail, ...css`${name}.${CALL}${key}()${NORMAL}${STATE}${pre}${NORMAL} <== ${caller}`);
      // incLogIndent(isDetail);
      // @ts-ignore - untyped this.
      const result = originalDesc.value.apply(this, args);

      if (logMethodResult)
        res = hasValue(result) ? result.toString().substr(0, maxResultLength) : "";

      return result;
    } finally {
      if (logged) {
        // decLogIndent(isDetail);

        if (logMethodResult)
          gelog(...css`${name}.${CALL}${key}()${NORMAL} END${STATE}${pre}${NORMAL} => ${RESULT}${res}`);
        else
          gelog(...css`${name}.${CALL}${key}()${NORMAL} END${STATE}${pre}${NORMAL}`);
      }
    }
  };

  addProp(target.constructor, key, createMember(newMethod), "clog");
  return descriptor;
}

function clogGetter(target: Object, key: string, descriptor: PropertyDescriptor, isDetail: boolean, state?: (self: any) => string) {
  const originalDesc = getProp(target.constructor, key) || descriptor;
  const name = target.constructor.name;

  let getter = originalDesc.get && function () {
    if (!active || !isLog)
      // @ts-ignore - untyped this.
      return originalDesc.get!.call(this);

    // @ts-ignore - untyped this.
    const pre = state ? ` (${state(this)})` : "";
    let res: any;
    let logged = false;

    try {
      const caller = Utils.getCaller(key, "eval ", "http:", "Array.");

      logged = gclogCheckDetail(isDetail, ...css`${name}.${CALL}${key}${NORMAL}.get${STATE}${pre}${NORMAL} <== ${caller}`);
      // incLogIndent(isDetail);
      // @ts-ignore - untyped this.
      const result = originalDesc.get!.call(this);

      if (logGetResult)
        res = hasValue(result) ? result.toString().substr(0, maxResultLength) : "";

      return result;
    } finally {
      if (logged) {
        // decLogIndent(isDetail);

        if (logGetResult)
          gelog(...css`${name}.${CALL}${key}${NORMAL}.get END${STATE}${pre}${NORMAL} => ${RESULT}${res}`);
        else
          gelog(...css`${name}.${CALL}${key}${NORMAL}.get END${STATE}${pre}${NORMAL}`);
      }
    }
  };

  return getter;
}

function clogSetter(target: Object, key: string, descriptor: PropertyDescriptor, isDetail: boolean, state?: (self: any) => string) {
  const originalDesc = getProp(target.constructor, key) || descriptor;
  const name = target.constructor.name;

  let setter = originalDesc.set && function (value: any) {
    if (!active || !isLog) {
      // @ts-ignore - untyped this.
      originalDesc.set!.call(this, value);
      return;
    }

    // @ts-ignore - untyped this.
    const pre = state ? ` (${state(this)})` : "";
    let logged = false;

    try {
      const caller = Utils.getCaller(key, "eval ", "http:", "Array.");

      if (logSetParam) {
        const par = hasValue(value) ? value.toString().substr(0, maxResultLength) : "";
        // @ts-ignore - untyped this.
        let init = this[`_${key}`];
        init = hasValue(init) ? init.toString().substr(0, maxResultLength) : "";

        logged = gclogCheckDetail(
          isDetail,
          ...css`${name}.${CALL}${key}${NORMAL}.set(${RESULT}${par}${NORMAL})${STATE}${pre}${NORMAL} (${RESULT}${init}${NORMAL}) <== ${caller}`);
      } else
        logged = gclogCheckDetail(isDetail, ...css`${name}.${CALL}${key}${NORMAL}.set${STATE}${pre}${NORMAL} <== ${caller}`);
      // incLogIndent(isDetail);
      // @ts-ignore - untyped this.
      originalDesc.set!.call(this, value);
    } finally {
      if (logged) {
        // decLogIndent(isDetail);

        if (logSetParam) {
          // @ts-ignore - untyped this.
          let res = this[`_${key}`];
          res = hasValue(res) ? res.toString().substr(0, maxResultLength) : "";
          gelog(...css`${name}.${CALL}${key}${NORMAL}.set END${STATE}${pre}${NORMAL} ${RESULT}(${res})`);
        } else
          gelog(...css`${name}.${CALL}${key}${NORMAL}.set END${STATE}${pre}${NORMAL}`);
      }
    }
  };

  return setter;
}

export function clog(): any;
export function clog(isDetail: boolean): any;
export function clog(state?: (self: any) => string, isDetail?: boolean): any;
export function clog(param1?: boolean | ((self: any) => string), param2?: boolean): any {
  let isDetail: boolean = false;
  let state: ((self: any) => string) | undefined;

  if (arguments.length === 0) {
  } else if (typeof param1 === "boolean") {
    isDetail = param1;
  } else {
    state = param1;
    isDetail = !!param2;
  }

  return function (target: Object, key: string, descriptor?: PropertyDescriptor) {
    if (!descriptor) return;

    const originalDesc = getProp(target.constructor, key) || descriptor;

    if (originalDesc.value)
      return clogMethod(target, key, descriptor, isDetail, state);

    let getter = clogGetter(target, key, descriptor, isDetail, state);
    let setter = clogSetter(target, key, descriptor, isDetail, state);

    addProp(target.constructor, key, createProperty(getter, setter), "clog");
    return descriptor;
  }
}
