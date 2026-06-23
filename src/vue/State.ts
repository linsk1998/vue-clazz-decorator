import { metadata } from "@/metadata/metadata";
import { ref } from "vue";
import type { AutoPropertyDecorator } from "../decorator/types";

type StateDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value>;

export const State: StateDecorator<object, any> = metadata('state', true);

export function state<T>(initValue: T) {
	var _ref = ref<T>(initValue);
	return {
		get: function(): T | null | undefined {
			return _ref.value;
		},
		set: function(value: T) {
			_ref.value = value;
		}
	};
}
