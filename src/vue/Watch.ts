import type { EsMethodDecorator, LegacyMethodDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

interface WatchOptions {
	deep?: boolean;
	immediate?: boolean;
	flush?: 'pre' | 'post' | 'sync';
	once?: boolean;
	onTrack?: (event: any) => void;
	onTrigger?: (event: any) => void;
}

type WatchSource = string | ((instance: any) => any) | (() => any);

type WatchDecorator<This extends object> =
	EsMethodDecorator<This, any> & LegacyMethodDecorator<This>;

const baseDecorator = metadata('watch', undefined);

const Watch: WatchDecorator<object> & {
	(source: WatchSource, options?: WatchOptions): WatchDecorator<object>;
} = function(source: any, options?: WatchOptions) {
	if(typeof source === 'string' || typeof source === 'function') {
		if(typeof source === 'string') {
			let key = source;
			source = function(inst: any) { return inst[key]; };
		}
		return metadata('watch', { source, options });
	}
	return baseDecorator.apply(this, arguments);
};

export { Watch };
export type { WatchOptions, WatchSource };
