import { EsAccessorDecorator, EsFieldDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type EmitDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This> & (
	(key: string) => (EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>)
);


const decorator = metadata('emit', null);
const Emit: EmitDecorator<object, any> = function(target: any) {
	if(typeof target === 'string') {
		return metadata('emit', 'on' + target.charAt(0).toUpperCase() + target.slice(1));
	}
	return decorator.apply(this, arguments);
};

export { Emit };

