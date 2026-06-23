import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type ContextDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(from: string) => AutoPropertyDecorator<This, Value>
);


const decorator = metadata('inject', null);
const Inject: ContextDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('inject', from);
	}
	return decorator.apply(this, arguments);
};

export { Inject };

