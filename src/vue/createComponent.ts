import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { getCurrentInstance, h, shallowRef } from "vue";
import type { JSX } from "vue/jsx-runtime";
import { use } from "./use";

type Template<T> = (props: T) => JSX.Element;
type ViewModel<T> = { new(): T; };

/**
 * Vue JSX 组件类型
 *
 * @typeParam T - 组件的 props 类型
 */
export type VueJsxComponent<T> = {
	new(): { $props: Partial<T>; };
};

/**
 * 创建组件
 *
 * 将模板（JSX 渲染函数或 Vue 组件）与 ViewModel 类绑定为完整的 Vue 组件。
 * 仅传模板时返回原模板，传入 ViewModel 时生成带 setup/render 的组件选项。
 * 组件中的 `@Ref` 装饰器字段会自动创建 `shallowRef`
 *
 * @typeParam T - 组件 props 类型
 * @param template - JSX 渲染函数或 Vue 组件对象
 * @param Class - 可选，ViewModel 类
 * @returns Vue 组件
 */
function createComponent<T>(template: VueJsxComponent<T>): VueJsxComponent<T>;
function createComponent<T>(template: VueJsxComponent<T>, Class: ViewModel<T>): VueJsxComponent<T>;
function createComponent<T>(template: Template<T>): Template<T>;
function createComponent<T>(template: Template<T>, Class: ViewModel<T>): VueJsxComponent<T>;
function createComponent<T>(template: any, Class?: { new(props?: Record<string, any>): object; }): VueJsxComponent<T> | Template<T> {
	if(!Class) return template;
	if(typeof template === 'object') {
		let Tag = template;
		template = function(props, { slots }) {
			return h(Tag, props, slots);
		};
	}
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
			return template(vueInst.exposed, vueInst);
		}
	} as any;
}
export { createComponent };

