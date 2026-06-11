import { fieldWeakMap } from "@/metadata/defineFieldMetadata";

function normalize<T>(o: T[], Class: ArrayConstructor): T[];
function normalize<T>(o: any, Class: { new(): T; }): T;
function normalize(o: any, Class: any) {
	if(o == null) {
		return o;
	}
	if(Class.prototype instanceof Array) {
		return o.map(function(o: any) {
			return normalize(o, Class.type);
		});
	} else {
		var meta = fieldWeakMap.get(Class);
		if(meta) {
			return Object.create(Class.prototype, o);
		} else {
			switch(Class) {
				case Number:
				case String:
				case Boolean:
					return Class(o);
				default:
					return new Class(o);
			}
		}
	}
}

export { normalize };

