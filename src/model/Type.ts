import { metadata } from "@/metadata/metadata";

export function Type<T>(type: { new(): T; }) {
	return metadata<any, T>('type', type);
}
