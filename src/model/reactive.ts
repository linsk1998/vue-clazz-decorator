import { enumMember } from "@/enumMember";
import { fieldWeakMap } from "@/metadata/defineFieldMetadata";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { getOwnMetadata } from "@/metadata/getOwnMetadata";
import { ACCESSOR_MAP } from "@/vue/ACCESSOR_MAP";
import { computed, shallowRef, type ShallowRef } from "vue";
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
	if(!getOwnMetadata("model", Class)) {
		if(process.env.NODE_ENV !== "production") {
			if(fieldWeakMap.has(Class)) {
				console.warn(`found ${Class.name} has no @Model decorator`);
			}
		}
		// Date等 非自定义的类型
		return new Class(o);
	}
	// 自定义 @Model 类继续往下处理
	if((o instanceof Class) && o[REACTIVE] && o[INSTANTIATE] === reactive) {
		return o;
	}
	if(typeof o !== "object") {
		if(process.env.NODE_ENV !== "production") {
			console.error(`${Class.name} can not init by ${typeof o}`);
		}
		return null;
	}
	let inst = new Class(o);
	inst[REACTIVE] = true;
	inst[INSTANTIATE] = reactive;
	let accessors = {};

	let metadata = getFieldMetadataValues(Class);
	enumMember(inst, function(key, descriptor) {
		let fieldConfig = metadata[key];
		if('value' in descriptor) {
			let value = descriptor.value;
			if(typeof value === 'function' && !Object.hasOwn(inst, key)) {
				Object.defineProperty(inst, key, {
					configurable: true,
					enumerable: true,
					writable: false,
					value: value.bind(inst)
				});
				return;
			}
		}
		if(fieldConfig) {
			if('computed' in fieldConfig) {
				accessors[key] = createComputedAccessor(inst, key, fieldConfig.computed);
				return;
			}
			let Type = fieldConfig.type;
			if(('state' in fieldConfig) || ('reactive' in fieldConfig) || Type) {
				accessors[key] = createStateAccessor(inst[key], Type, reactive);
				delete inst[key];
				return;
			}
		}
		if('value' in descriptor) {
			let initValue = inst[key];
			Object.defineProperty(inst, key, {
				configurable: true,
				enumerable: true,
				get() {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[key].get();
				},
				set(value) {
					var accessors = ACCESSOR_MAP.get(this);
					accessors[key].set(value);
				}
			});
			let Type = fieldConfig?.type;
			accessors[key] = Type ? createStateAccessor(initValue, Type, reactive) : createStateAccessor(initValue);
		} else {
			Object.defineProperty(inst, key, {
				configurable: true,
				enumerable: true,
				get() {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[key].get();
				},
				set(value) {
					var accessors = ACCESSOR_MAP.get(this);
					return accessors[key].set(value);
				}
			});
			accessors[key] = createComputedAccessor(inst, key, descriptor);
		}
	});
	ACCESSOR_MAP.set(inst, accessors);
	for(let key in o) {
		if(Object.hasOwn(o, key)) {
			if(key in metadata) {
				inst[key] = applyOnionDeserialize(o[key], metadata[key]);
			} else {
				inst[key] = o[key];
			}
		}
	}
	return inst;
}
export { reactive };


export function createStateAccessor(initValue: any, Class?: any, instantiate?: InstantiateFunction) {
	var refContainer: ShallowRef;
	if(Class) {
		refContainer = shallowRef(instantiate(initValue, Class));
		return {
			get() {
				return refContainer.value;
			},
			set(v: any) {
				refContainer.value = instantiate(v, Class);
			}
		};
	}
	refContainer = shallowRef(initValue);
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
