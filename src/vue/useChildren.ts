import { useSlots } from "vue";

export function useChildren() {
	return useSlots().default?.();
}
