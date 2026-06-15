import { enumMember } from "@/enumMenber";
import { fieldWeakMap } from "@/metadata/defineFieldMetadata";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { getOwnMetadata } from "@/metadata/getOwnMetadata";
import { ACCESSOR_MAP } from "@/vue/ACCESSOR_MAP";
import { array, REACTIVE, ReactiveArray, TYPE } from "./array";
import { applyOnionDeserialize } from "./deserialize";
import { createComputedAccessor, createStateAccessor, reactive } from "./reactive";

function hydrate<T>(o: T[], Class: ArrayConstructor): T[];
function hydrate<T>(o: any, Class: { new(): T; }): T;
function hydrate(o: any, Class: any): any {
	if(o == null) {
		return o;
	}
	if(Class === Array) {
		return Array.isArray(o) ? o : Array.from(o);
	} else if(Class.prototype instanceof ReactiveArray) {
		if(Array.isArray(o) && o[REACTIVE] && o[TYPE] === Class.type) {
			return o;
		}
		return array(o, true, Class.type, hydrate);
	} else if(Class.prototype instanceof Array) {
		if(Array.isArray(o) && o[TYPE] === Class.type) {
			return o;
		}
		return array(o, false, Class.type, hydrate);
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
		if(typeof Class === "function" && Class !== Object && Class.prototype instanceof Date) {
			return new Class(o);
		}
		// 自定义 @Model 类继续往下处理
	}
	if(o instanceof Class) {
		return o;
	}
	if(typeof o !== "object") {
		if(process.env.NODE_ENV !== "production") {
			console.error(`${Class.name} can not init by ${typeof o}`);
		}
		return null;
	}
	let accessors = {};
	ACCESSOR_MAP.set(inst, accessors);

	var inst = new Class(o);
	let metadata = getFieldMetadataValues(Class);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		let computed = 'computed' in fieldConfig;
		if(computed) {
			accessors[key] = createComputedAccessor(inst, key, fieldConfig.computed);
			continue;
		}
		let Class = fieldConfig.type;
		let state = 'state' in fieldConfig;
		if(state) {
			let initValue = inst[key];
			accessors[key] = createStateAccessor(Class, hydrate);
			delete inst[key];
			if(initValue !== undefined) {
				inst[key] = initValue;
			}
			continue;
		}
		if('reactive' in fieldConfig) {
			let initValue = inst[key];
			accessors[key] = createStateAccessor(Class, reactive);
			delete inst[key];
			if(initValue !== undefined) {
				inst[key] = initValue;
			}
			continue;
		}

	}
	enumMember(inst, function(prop, descriptor) {
		if(prop in metadata) return;
		if('value' in descriptor) {
			let value = descriptor.value;
			if(typeof value === 'function' && !Object.hasOwn(inst, prop)) {
				Object.defineProperty(inst, prop, {
					configurable: true,
					enumerable: true,
					writable: false,
					value: value.bind(inst)
				});
			}
		}
	});
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


export { hydrate };

