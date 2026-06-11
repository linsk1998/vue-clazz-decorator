import type { EsAccessorDecorator, EsFieldDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type ModelValueDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> & (
	(key: string) => (EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>)
);


const decorator = metadata('modelValue', 'modelValue');
const ModelValue: ModelValueDecorator<object, any> = function(key: any) {
	if(typeof key === 'string') {
		return metadata('modelValue', key);
	}
	return decorator.apply(this, arguments);
};

export { ModelValue };

