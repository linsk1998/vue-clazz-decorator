import type { EsAccessorDecorator, EsClassDecorator, EsFieldDecorator, LegacyClassDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type ProvideDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> & (
	(key: string | symbol) => (EsClassDecorator<This> & LegacyClassDecorator & EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>)
);


const decorator = metadata('provide', null);
const Provide: ProvideDecorator<object, any> = function(key: any) {
	if(typeof key === 'string' || typeof key === 'symbol') {
		return metadata('provide', key);
	}
	return decorator.apply(this, arguments);
};

export { Provide };

