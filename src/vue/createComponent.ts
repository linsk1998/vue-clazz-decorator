import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { getCurrentInstance, shallowRef } from "vue";
import type { JSX } from "vue/jsx-runtime";
import { use } from "./use";

type Template<T> = (props: T) => JSX.Element;
type ViewModel<T> = { new(): T; };
export type VueJsxComponent<T> = {
	new(): { $props: Partial<T>; };
};

/** 创建组件 */
function createComponent<T>(template: Template<T>): Template<T>;
function createComponent<T>(template: Template<T>, Class: ViewModel<T>): VueJsxComponent<T>;
function createComponent<T>(template: Template<any>, Class?: { new(props?: Record<string, any>): object; }): VueJsxComponent<T> | Template<T> {
	if(!Class) return template;
	let props = new Set<string>();
	let emits = new Set<string>();
	let metadata = getFieldMetadataValues(Class);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		if('prop' in fieldConfig) {
			props.add(fieldConfig.prop || key);
		}
		if('modelValue' in fieldConfig) {
			props.add(fieldConfig.modelValue);
			emits.add('update:' + fieldConfig.modelValue);
		}
		if('emit' in fieldConfig) {
			emits.add(fieldConfig.emit || key);
		}
	}
	return {
		name: Class.name,
		props: Array.from(props),
		emits: Array.from(emits),
		setup(props, ctx) {
			let vueInst = getCurrentInstance();
			var inst = use(Class);
			vueInst.exposed = vueInst.exposeProxy = inst;
			var o = {};
			for(let key in metadata) {
				let fieldConfig = metadata[key];
				if('ref' in fieldConfig) {
					o[fieldConfig.ref || key] = shallowRef(null);
				}
			}
			return o;
		},
		render(proxyToUse, renderCache, props, setupState, data, ctx) {
			let vueInst = getCurrentInstance();
			return template(vueInst.exposed);
		}
	} as any;
}
export { createComponent };

