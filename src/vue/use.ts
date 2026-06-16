import { enumMember } from "@/enumMenber";
import { getClassMetadataValues } from "@/metadata/getClassMetadataValues";
import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { hydrate } from "@/model/hydrate";
import { createComputedAccessor, createStateAccessor, reactive } from "@/model/reactive";
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

export function use<T extends object>(Class: { new(props?: Record<string, any>): T; }): T {
	let vueInst = getCurrentInstance();
	if(!vueInst) throw new Error('use must be called in when component setup');

	let metadata = getFieldMetadataValues(Class);
	let inst = new Class(vueInst.props);
	let accessors = {};
	enumMember(inst, function(key, descriptor) {
		let fieldConfig = metadata[key];
		if('value' in descriptor) {
			let value = descriptor.value;
			if(typeof value === 'function' && !Object.hasOwn(inst, key)) {
				let method = value.bind(inst);
				Object.defineProperty(inst, key, {
					configurable: true,
					enumerable: true,
					writable: false,
					value: method
				});
				if(fieldConfig) {
					if('provide' in fieldConfig) $provide(fieldConfig.provide || key, createProvideAccessor(key, method));
				}
				return;
			}
		}
		if(fieldConfig) {
			let provide = 'provide' in fieldConfig;
			if('emit' in fieldConfig) {
				let method = createEmitMethod(inst, vueInst, fieldConfig.emit || key);
				Object.defineProperty(inst, key, {
					configurable: true,
					enumerable: true,
					writable: false,
					value: method
				});
				if(provide) $provide(fieldConfig.provide || key, createProvideAccessor(key, method));
				if(process.env.NODE_ENV !== 'production') {
					if('provide' in fieldConfig) console.warn('emit and provide are not allowed at the same time');
					if('computed' in fieldConfig) console.warn('emit and computed are not allowed at the same time');
					if('modelValue' in fieldConfig) console.warn('emit and modelValue are not allowed at the same time');
					if('state' in fieldConfig) console.warn('emit and state are not allowed at the same time');
					if('ref' in fieldConfig) console.warn('emit and ref are not allowed at the same time');
					if('prop' in fieldConfig) console.warn('emit and prop are not allowed at the same time');
					if('inject' in fieldConfig) console.warn('emit and inject are not allowed at the same time');
				}
				return;
			}
			let computed = 'computed' in fieldConfig;
			if(computed) {
				accessors[key] = createComputedAccessor(inst, key, fieldConfig.computed);
				if(provide) $provide(fieldConfig.provide || key, accessors[key]);
				return;
			}
			let ref = 'ref' in fieldConfig;
			if(ref) {
				accessors[key] = createRefAccessor(vueInst, fieldConfig.ref || key);
				if(provide) $provide(fieldConfig.provide || key, accessors[key]);
				delete inst[key];
				return;
			}
			let modelValue = 'modelValue' in fieldConfig;
			if(modelValue) {
				accessors[key] = createModelValueAccessor(vueInst, fieldConfig.modelValue || key);
				if(provide) $provide(fieldConfig.provide || key, accessors[key]);
				delete inst[key];
				return;
			}
			let Type = fieldConfig.type;
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
				accessors[key] = createStateAccessor(initValue, Type, hydrate);
				if(provide) $provide(fieldConfig.provide || key, accessors[key]);
				delete inst[key];
				return;
			}
			if(prop) {
				if(inject) {
					let accessor: Accessor<any> = $inject(fieldConfig.inject || key);
					if(accessor) {
						accessors[key] = createPropInjectAccessor(vueInst, fieldConfig.prop || key, accessor, inst[key]);
						if(provide) $provide(fieldConfig.provide || key, accessors[key]);
						delete inst[key];
						return;
					}
				}
				accessors[key] = createPropAccessor(vueInst, fieldConfig.prop || key, inst[key]);
				if(provide) $provide(fieldConfig.provide || key, accessors[key]);
				delete inst[key];
				return;
			}
			if(inject) {
				let accessor: Accessor<any> = $inject(fieldConfig.inject || key);
				if(accessor) {
					accessors[key] = createInjectAccessor(key, accessor, inst[key]);
				} else {
					accessors[key] = createReadonlyAccessor(key, inst[key]);
				}
				if(provide) $provide(fieldConfig.provide || key, accessors[key]);
				delete inst[key];
				return;
			}
			if('reactive' in fieldConfig) {
				let initValue = inst[key];
				accessors[key] = Type ? createStateAccessor(initValue, Type, reactive) : createStateAccessor(initValue);
				delete inst[key];
			}
			if(provide) $provide(fieldConfig.provide || key, createProvidePropertyAccessor(inst, key));
		}
	});
	let classMetadata = getClassMetadataValues(Class);
	if(classMetadata.provide) {
		$provide(classMetadata.provide, createProvideAccessor(classMetadata.provide, inst));
	}
	ACCESSOR_MAP.set(inst, accessors);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		for(let hookName in LIFECYCLE_HOOKS) {
			if(hookName in fieldConfig) {
				LIFECYCLE_HOOKS[hookName](inst[key]);
			}
		}
	}
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		if('onDidCreate' in fieldConfig) {
			try {
				inst[key]();
			} catch(e) {
				console.error(e);
			}
		}
	}

	return inst;
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
