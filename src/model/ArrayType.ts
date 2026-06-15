import { ReactiveArray } from "./array";

export function ArrayType<T>(type: { new(): T; }): { new(): T[]; } {
	class SubArray extends Array {
		static type = type;
	}
	return SubArray;
}



export function ReactiveArrayType<T>(type: { new(): T; }): { new(): T[]; } {
	class SubArray extends ReactiveArray {
		static type = type;
	}
	return SubArray;
}
