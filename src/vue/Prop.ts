import { type EsAccessorDecorator, type EsFieldDecorator, type LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type PropDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> & (
	(from: string) => (EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>)
);


const decorator = metadata('prop', null);
const Prop: PropDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('prop', from);
	}
	return decorator.apply(this, arguments);
};


export { Prop };

