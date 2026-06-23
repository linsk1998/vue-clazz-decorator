import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type ModelValueDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(key: string) => AutoPropertyDecorator<This, Value>
);


const decorator = metadata('modelValue', 'modelValue');
const ModelValue: ModelValueDecorator<object, any> = function(key: any) {
	if(typeof key === 'string') {
		return metadata('modelValue', key);
	}
	return decorator.apply(this, arguments);
};

export { ModelValue };

