export interface Accessor<T> {
	get(): T;
	set?(value: T): void;
}
export const ACCESSOR_MAP = new WeakMap<any, Record<string, Accessor<any>>>();
