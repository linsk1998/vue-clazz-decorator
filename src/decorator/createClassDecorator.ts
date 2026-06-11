import { getMetadata } from "../getMetadata";
import type { EsClassDecorator, LegacyClassDecorator } from "./types";


export function createFieldDecorator<T extends Object>(initClass: (Class: { new(...args: any[]): T; }, metadata: {}) => any): EsClassDecorator<T> & LegacyClassDecorator {
	return function(Class: any, context?: any) {
		initClass(Class, context ? context.metadata : getMetadata(Class));
	};
}
