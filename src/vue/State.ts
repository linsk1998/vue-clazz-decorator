import { EsAccessorDecorator, EsFieldDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";
import { ref } from "vue";

type StateDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>;

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
