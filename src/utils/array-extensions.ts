export {};

declare global {
  interface Array<T> {
    remove(value: T): boolean;
  }
}

Array.prototype.remove = function <T>(value: T) {
  const index = this.indexOf(value);

  if (index >= 0) {
    this.splice(index, 1);
    return true;
  }

  return false;
}
