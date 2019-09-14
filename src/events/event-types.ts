export interface EventArgsFactory<T> {
  (): T;
}

export type EventFilter = (sender: any) => boolean;

export interface Listener<T> {
  (event: T): void;
  eventFilter?: EventFilter;
}
