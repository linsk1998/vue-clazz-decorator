import { type EsAccessorDecorator, type EsFieldDecorator, type LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type RefDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> & (
	(from: string) => (EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>)
);


const decorator = metadata('ref', null);
const Ref: RefDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('ref', from);
	}
	return decorator.apply(this, arguments);
};


export { Ref };

