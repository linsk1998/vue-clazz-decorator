import { metadata } from "@/metadata/metadata";
interface ClassWithInitializer<T> {
	new(init?: Record<keyof T, any>): T;
}


export function Type<T>(type: ClassWithInitializer<T>) {
	return metadata<any, T>('type', type);
}
