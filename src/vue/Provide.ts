import { metadata } from "@/metadata/metadata";
import type { AutoClassDecorator, AutoPropertyDecorator } from "../decorator/types";

type ProvideDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(key: string | symbol) => (AutoClassDecorator<This> & AutoPropertyDecorator<This, Value>)
);


const decorator = metadata('provide', null);
const Provide: ProvideDecorator<object, any> = function(key: any) {
	if(typeof key === 'string' || typeof key === 'symbol') {
		return metadata('provide', key);
	}
	return decorator.apply(this, arguments);
};

export { Provide };

