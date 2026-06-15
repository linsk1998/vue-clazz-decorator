import { fieldWeakMap } from "@/metadata/defineFieldMetadata";
import { getClassMetadataValues } from "@/metadata/getClassMetadataValues";
import { getOwnMetadata } from "@/metadata/getOwnMetadata";
import { applyOnionDeserialize } from "./deserialize";


function normalize<T>(o: T[], Class: ArrayConstructor): T[];
function normalize<T>(o: any, Class: { new(): T; }): T;
function normalize(o: any, Class: any): any {
	if(o == null) {
		return o;
	}
	if(Class.prototype instanceof Array) {
		return o.map(function(o: any) {
			return normalize(o, Class.type);
		});
	}
	switch(Class) {
		case Number:
		case String:
		case Boolean:
			return Class(o);
	}
	// 判断有没有使用 @Model 装饰器
	if(getOwnMetadata("model", Class)) {
		if(process.env.NODE_ENV !== "production") {
			if(fieldWeakMap.has(Class)) {
				console.warn(`found ${Class.name} has no @Model decorator`);
			}
		}
		// Date等 非自定义的类型
		return new Class(o);
	}
	if(typeof o !== "object") {
		if(process.env.NODE_ENV !== "production") {
			console.error(`${Class.name} can not init by ${typeof o}`);
		}
		return null;
	}

	var inst = {};
	let metadata = getClassMetadataValues(Class);
	for(let key in o) {
		if(Object.hasOwn(o, key)) {
			if(key in metadata) {
				inst[key] = applyOnionDeserialize(o[key], metadata[key].type);
			} else {
				inst[key] = o[key];
			}
		}
	}
	return inst;
}

export { normalize };

