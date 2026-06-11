import type { LegacyClassDecorator } from "../types";

export function createFieldDecorator(initClass: (Class: Function, metadata: object) => any): LegacyClassDecorator {
	return function(Class) {
		initClass(Class, Class);
	};
}
