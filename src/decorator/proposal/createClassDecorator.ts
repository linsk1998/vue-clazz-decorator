import type { EsClassDecorator } from "../types";

export function createFieldDecorator<T extends Object>(initClass: (Class: { new(...args: any[]): T; }, metadata: {}) => any): EsClassDecorator<T> {
	return function(Class, context) {
		initClass(Class, context.metadata);
	};
}
