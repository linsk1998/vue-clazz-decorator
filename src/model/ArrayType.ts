
export function ArrayType<T>(type: { new(): T; }): { new(): T[]; } {
	class SubArray extends Array {
		static type = type;
	}
	return SubArray;
}
