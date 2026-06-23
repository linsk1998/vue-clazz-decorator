import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type PropDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(from: string) => AutoPropertyDecorator<This, Value>
);


const decorator = metadata('prop', null);
const Prop: PropDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('prop', from);
	}
	return decorator.apply(this, arguments);
};


export { Prop };

