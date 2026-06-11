import { type EsAccessorDecorator, type EsFieldDecorator, type LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type ContextDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> & (
	(from: string) => (EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>)
);


const decorator = metadata('inject', null);
const Inject: ContextDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('inject', from);
	}
	return decorator.apply(this, arguments);
};

export { Inject };

