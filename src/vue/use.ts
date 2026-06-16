import { getClassMetadataValues } from "@/metadata/getClassMetadataValues";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { hydrate } from "@/model/hydrate";
import { createComputedAccessor, createStateAccessor } from "@/model/reactive";
import {
	inject as $inject,
	provide as $provide,
	ComponentInternalInstance, getCurrentInstance,
	nextTick,
	onBeforeMount,
	onBeforeUnmount,
	onBeforeUpdate,
	onErrorCaptured,
	onMounted,
	onUnmounted,
	onUpdated
} from "vue";
import { Accessor, ACCESSOR_MAP } from "./ACCESSOR_MAP";

const LIFECYCLE_HOOKS: Record<string, Function> = {
	onWillMount: onBeforeMount,
	onDidMount: onMounted,
	onWillUpdate: onBeforeUpdate,
	onDidUpdate: onUpdated,
	onWillUnmount: onBeforeUnmount,
	onDidUnmount: onUnmounted,
	onDidCatch: onErrorCaptured,
};

export function use<T>(Class: { new(props: Record<string, any>): T; }): T {
	let vueInst = getCurrentInstance();
	if(!vueInst) throw new Error('use must be called in when component setup');

	let metadata = getFieldMetadataValues(Class);
	let inst = new Class(vueInst.props);
	let constructor = inst.constructor;
	getAllMethodNames(constructor.prototype).forEach((method) => {
		inst[method] = inst[method].bind(inst);
	});
	let descriptors = Object.getOwnPropertyDescriptors(inst);
	for(let key in descriptors) {
		let desc = descriptors[key];
		if('value' in desc) {
			delete inst[key];
			let value = desc.value;
			if(value !== undefined) {
				inst[key] = value;
			}
		}
	}
	let accessors = {};
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		if('emit' in fieldConfig) {
			inst[key] = createEmitMethod(inst, vueInst, fieldConfig.emit || key);
			if(process.env.NODE_ENV !== 'production') {
				if('provide' in fieldConfig) console.warn('emit and provide are not allowed at the same time');
				if('computed' in fieldConfig) console.warn('emit and computed are not allowed at the same time');
				if('modelValue' in fieldConfig) console.warn('emit and modelValue are not allowed at the same time');
				if('state' in fieldConfig) console.warn('emit and state are not allowed at the same time');
				if('ref' in fieldConfig) console.warn('emit and ref are not allowed at the same time');
				if('prop' in fieldConfig) console.warn('emit and prop are not allowed at the same time');
				if('inject' in fieldConfig) console.warn('emit and inject are not allowed at the same time');
			}
			continue;
		}
		let provide = 'provide' in fieldConfig;
		let computed = 'computed' in fieldConfig;
		if(computed) {
			accessors[key] = createComputedAccessor(inst, key, fieldConfig.computed);
			if(provide) $provide(fieldConfig.provide || key, accessors[key]);
			continue;
		}
		let ref = 'ref' in fieldConfig;
		if(ref) {
			accessors[key] = createRefAccessor(vueInst, fieldConfig.ref || key);
			if(provide) $provide(fieldConfig.provide || key, accessors[key]);
			continue;
		}
		let modelValue = 'modelValue' in fieldConfig;
		if(modelValue) {
			accessors[key] = createModelValueAccessor(vueInst, fieldConfig.modelValue || key);
			if(provide) $provide(fieldConfig.provide || key, accessors[key]);
			continue;
		}
		let Class = fieldConfig.type;
		let state = 'state' in fieldConfig;
		let prop = 'prop' in fieldConfig;
		let inject = 'inject' in fieldConfig;
		if(state) {
			let initValue = inst[key];
			if(inject) {
				let accessor: Accessor<any> = $inject(fieldConfig.inject || key);
				if(accessor) {
					let value = accessor.get();
					if(value !== undefined) {
						initValue = value;
					}
				}
			}
			if(prop) {
				let value = vueInst.props[fieldConfig.prop || key];
				if(value !== undefined) {
					initValue = value;
				}
			}
			accessors[key] = createStateAccessor(initValue, Class, hydrate);
			if(provide) $provide(fieldConfig.provide || key, accessors[key]);
			continue;
		}
		if(prop) {
			if(inject) {
				let accessor: Accessor<any> = $inject(fieldConfig.inject || key);
				if(accessor) {
					accessors[key] = createPropInjectAccessor(vueInst, fieldConfig.prop || key, accessor, inst[key]);
					if(provide) $provide(fieldConfig.provide || key, accessors[key]);
					continue;
				}
			}
			accessors[key] = createPropAccessor(vueInst, fieldConfig.prop || key, inst[key]);
			if(provide) $provide(fieldConfig.provide || key, accessors[key]);
			continue;
		}
		if(inject) {
			let accessor: Accessor<any> = $inject(fieldConfig.inject || key);
			if(accessor) {
				accessors[key] = createInjectAccessor(key, accessor, inst[key]);
			} else {
				accessors[key] = createReadonlyAccessor(key, inst[key]);
			}
			if(provide) $provide(fieldConfig.provide || key, accessors[key]);
			continue;
		}
		if(provide) $provide(fieldConfig.provide || key, createProvidePropertyAccessor(inst, key));
	}
	let classMetadata = getClassMetadataValues(Class);
	if(classMetadata.provide) {
		$provide(classMetadata.provide, createProvideAccessor(classMetadata.provide, inst));
	}
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		for(let hookName in LIFECYCLE_HOOKS) {
			if(hookName in fieldConfig) {
				LIFECYCLE_HOOKS[hookName](inst[key]);
			}
		}
	}
	ACCESSOR_MAP.set(inst, accessors);
	return inst;
}

function getAllMethodNames(obj: any): Set<string> {
	let methods = new Set<string>();
	while(obj && obj !== Object.prototype) { // 避免遍历到Object.prototype'
		let props = Object.getOwnPropertyNames(obj);
		let i = props.length;
		while(i-- > 0) {
			let prop = props[i];
			if(prop !== 'constructor') {
				let desc = Object.getOwnPropertyDescriptor(obj, prop);
				let value = desc.value;
				if(value) {
					if(typeof value === 'function' && prop !== 'constructor') {
						methods.add(prop);
					}
				}
			}
		}
		obj = Object.getPrototypeOf(obj);
	}
	return methods;
}
function createEmitMethod(inst: any, vueInst: ComponentInternalInstance, key: string) {
	return function() {
		var callback = vueInst.attrs[key] as Function;
		if(callback) return callback.apply(inst, arguments);
	};
}
function createRefAccessor(vueInst: ComponentInternalInstance, key: string) {
	return {
		get() {
			return vueInst.refs[key];
		}
	};
}
function createModelValueAccessor(vueInst: ComponentInternalInstance, key: string) {
	var hasCache = false;
	var cache: any;
	return {
		get() {
			if(hasCache) {
				return cache;
			}
			return vueInst.props[key];
		},
		set(v: any) {
			vueInst.emit('update:' + key, v);
			hasCache = true;
			cache = v;
			nextTick(() => {
				hasCache = false;
				cache = undefined;
			});
		}
	};
}
function createPropAccessor(vueInst: ComponentInternalInstance, key: string, defaultValue: any) {
	return {
		get() {
			var value = vueInst.props[key];
			return value !== undefined ? value : defaultValue;
		},
		set(v: any) {
			throw new Error('prop "' + key + '" is Readonly');
		}
	};
}
function createPropInjectAccessor(vueInst: ComponentInternalInstance, key: string, accessor: Accessor<any>, defaultValue: any) {
	return {
		get() {
			var value = vueInst.props[key];
			if(value === undefined) {
				value = accessor.get();
			}
			return value !== undefined ? value : defaultValue;
		},
		set(v: any) {
			throw new Error('prop "' + key + '" is Readonly');
		}
	};
}
function createInjectAccessor(key: string, accessor: Accessor<any>, defaultValue: any) {
	if(defaultValue === undefined) {
		return accessor;
	}
	return {
		get() {
			var value = accessor.get();
			return value !== undefined ? value : defaultValue;
		},
		set(v: any) {
			accessor.set(v);
		}
	};
}
function createProvideAccessor(key: string, value: any) {
	return {
		get() {
			return value;
		},
		set() {
			throw new Error('provide "' + key + '" is Readonly');
		}
	};
}
function createProvidePropertyAccessor(inst: any, key: string) {
	return {
		get() {
			return inst[key];
		},
		set() {
			throw new Error('provide "' + key + '" is Readonly');
		}
	};
}
function createReadonlyAccessor(key: string, defaultValue: any) {
	return {
		get() {
			return defaultValue;
		},
		set(v: any) {
			throw new Error('defaultValue "' + key + '" is Readonly');
		}
	};
}
