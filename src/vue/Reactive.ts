import { ensureMetadata } from "@/ensureMetadata";
import { defineFieldMetadata } from "@/metadata/defineFieldMetadata";
import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

export interface ModelClassWithInitializer<T> {
	new(init?: Record<keyof T, any>): T;
}

type ReactiveDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value> & ((type: ModelClassWithInitializer<Value>) => AutoPropertyDecorator<This, Value>);


const decorator = metadata('reactive', null);
const Reactive: ReactiveDecorator<object, any> = function(type?: any) {
	if(arguments.length <= 1) {
		return function(target: any, context: any) {
			var property, metadata;
			if(typeof context === "string") {
				property = context;
				metadata = ensureMetadata(target.constructor);
			} else {
				property = context.name;
				metadata = context.metadata;
			}
			defineFieldMetadata('reactive', null, metadata, property);
			defineFieldMetadata('type', type, metadata, property);
		};
	}
	return decorator.apply(this, arguments);
};

export { Reactive };

