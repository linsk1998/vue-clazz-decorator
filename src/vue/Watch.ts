import { metadata } from "@/metadata/metadata";
import type { AutoMethodDecorator } from "../decorator/types";

interface WatchOptions {
	deep?: boolean;
	immediate?: boolean;
}

type WatchSource<This extends object, Value> = (this: This, instance: This) => Value;
type WatchCallback<Value> = (newValue: Value, oldValue: Value) => any;
type WatchDecorator<This extends object, Value extends WatchCallback<any>> = AutoMethodDecorator<This, Value>;

function Watch<This extends object, Value>(source: string, options?: WatchOptions): WatchDecorator<This, WatchCallback<Value>>;
function Watch<This extends object, Value>(source: WatchSource<This, any>, options?: WatchOptions): WatchDecorator<This, WatchCallback<Value>>;
function Watch(source: Function | string, options?: WatchOptions) {
	if(typeof source === 'string') {
		let key = source;
		source = function() { return this[key]; };
	}
	return metadata('watch', { source, options });
}

export { Watch };

