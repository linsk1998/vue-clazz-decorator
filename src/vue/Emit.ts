import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type EmitDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & (
	(key: string) => AutoPropertyDecorator<This, Value>
);


const decorator = metadata('emit', null);
const Emit: EmitDecorator<object, any> = function(target: any) {
	if(typeof target === 'string') {
		return metadata('emit', 'on' + target.charAt(0).toUpperCase() + target.slice(1));
	}
	return decorator.apply(this, arguments);
};

export { Emit };

