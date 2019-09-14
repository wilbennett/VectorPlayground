import { EventArgsFactory, EventFilter, Listener } from '.';
import { IDisposable } from '../core';

// https://basarat.gitbooks.io/typescript/docs/tips/typed-event.html
export class TypedEvent<T> {
  private listeners: Listener<T>[] = [];
  private singleEventListeners: Listener<T>[] = [];

  constructor(private readonly sender: object) {
  }

  on(listener: Listener<T>, filter?: EventFilter): IDisposable {
    if (filter)
      listener.eventFilter = filter;

    this.listeners.push(listener);
    return { dispose: () => this.off(listener) };
  }

  once(listener: Listener<T>): void { this.singleEventListeners.push(listener); }
  off(listener: Listener<T>) { this.listeners.remove(listener); }

  emit(event: T | EventArgsFactory<T>, sender?: object) {
    if (this.listeners.length == 0 && this.singleEventListeners.length === 0) return;

    // @ts-ignore - not all callable.
    const ev: T = typeof event === "function" ? event() : event;

    if (typeof ev === "object")
      // @ts-ignore - index unknown.
      ev["sender"] = sender || ev["sender"] || this.sender;

    this.listeners.forEach(listener => {
      if (!listener.eventFilter || listener.eventFilter(ev))
        listener(ev);
    });

    if (this.singleEventListeners.length > 0) {
      this.singleEventListeners.forEach(listener => {
        if (!listener.eventFilter || listener.eventFilter(ev))
          listener(ev)
      });

      this.singleEventListeners = [];
    }
  }

  pipe(te: TypedEvent<T>): IDisposable { return this.on(e => te.emit(e)); }
}
