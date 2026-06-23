import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type RefDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(from: string) => AutoPropertyDecorator<This, Value>
);


const decorator = metadata('ref', null);
const Ref: RefDecorator<object, any> = function(from: any) {
	if(typeof from === 'string') {
		return metadata('ref', from);
	}
	return decorator.apply(this, arguments);
};


export { Ref };

