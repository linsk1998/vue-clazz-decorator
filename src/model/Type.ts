import { metadata } from "@/metadata/metadata";
import type { ModelClassWithInitializer } from "@/vue/Reactive";


export function Type<T>(type: ModelClassWithInitializer<T>) {
	return metadata<any, T>('type', type);
}
