import { enumMember } from "@/enumMenber";
import { fieldWeakMap } from "@/metadata/defineFieldMetadata";
import { getClassMetadataValues } from "@/metadata/getClassMetadataValues";
import { getOwnMetadata } from "@/metadata/getOwnMetadata";
import { ACCESSOR_MAP } from "@/vue/ACCESSOR_MAP";
import { computed, shallowRef } from "vue";
import { array, INSTANTIATE, REACTIVE, TYPE } from "./array";
import { applyOnionDeserialize } from "./deserialize";

export type InstantiateFunction = (value: any, type: any) => any;

function reactive<T>(o: T[], Class: ArrayConstructor): T[];
function reactive<T>(o: any, Class: { new(): T; }): T;
function reactive(o: any, Class: any): any {
	if(o == null) {
		return o;
	}
	if(Class === Array) {
		if(Array.isArray(o) && o[REACTIVE]) {
			return o;
		}
		return array(o, true);
	} else if(Class.prototype instanceof Array) {
		if(Array.isArray(o) && o[REACTIVE] && o[TYPE] === Class.type && o[INSTANTIATE] === reactive) {
			return o;
		}
		return array(o, true, Class.type, reactive);
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
	if((o instanceof Class) && o[REACTIVE] && o[INSTANTIATE] === reactive) {
		return o;
	}
	if(typeof o !== "object") {
		if(process.env.NODE_ENV !== "production") {
			console.error(`${Class.name} can not init by ${typeof o}`);
		}
		return null;
	}
	var inst = new Class(o);
	inst[REACTIVE] = true;
	inst[INSTANTIATE] = reactive;
	let accessors = {};
	ACCESSOR_MAP.set(inst, accessors);

	let metadata = getClassMetadataValues(Class);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		let computed = 'computed' in fieldConfig;
		if(computed) {
			accessors[key] = createComputedAccessor(inst, key, fieldConfig.computed);
			continue;
		}
		let Class = fieldConfig.type;
		if(('state' in fieldConfig) || ('reactive' in fieldConfig)) {
			let initValue = inst[key];
			accessors[key] = createStateAccessor(Class, reactive);
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
			} else {
				let initValue = inst[prop];
				Object.defineProperty(inst, prop, {
					configurable: true,
					enumerable: true,
					get() {
						var accessors = ACCESSOR_MAP.get(this);
						return accessors[prop].get();
					},
					set(value) {
						var accessors = ACCESSOR_MAP.get(this);
						accessors[prop].set(value);
					}
				});
				accessors[prop] = createStateAccessor(Class, reactive);
				if(initValue !== undefined) {
					inst[prop] = initValue;
				}
			}
		} else {
			Object.defineProperty(inst, prop, {
				configurable: true,
				enumerable: true,
				get() {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[prop].get();
				},
				set(value) {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[prop].set(value);
				}
			});
			accessors[prop] = createComputedAccessor(inst, prop, descriptor);
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
export { reactive };


export function createStateAccessor(Class?: any, instantiate?: InstantiateFunction) {
	const refContainer = shallowRef();
	if(Class) {
		return {
			get() {
				return refContainer.value;
			},
			set(v: any) {
				refContainer.value = instantiate(v, Class);
			}
		};
	}
	return {
		get() {
			return refContainer.value;
		},
		set(v: any) {
			refContainer.value = v;
		}
	};
}

export function createComputedAccessor(inst: any, key: string, { get, set }: PropertyDescriptor) {
	const c = computed({
		get: () => get.call(inst),
		set: (v) => set.call(inst, v)
	});
	return {
		get() {
			return c.value;
		},
		set(v: any) {
			c.value = v;
		}
	};
}
