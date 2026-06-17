import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { getCurrentInstance } from "vue";
import { ACCESSOR_MAP } from "./ACCESSOR_MAP";
import { use } from "./use";

export function Component<T extends object>(Class: { new(props?: Record<string, any>): T; }): { data: T; } {
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
			var accessors = ACCESSOR_MAP.get(inst);
			if(accessors) {
				for(let key in accessors) {
					let accessor = accessors[key];
					Object.defineProperty(inst, key, {
						configurable: true,
						enumerable: true,
						get: accessor.get,
						set: accessor.set,
					});
				}
			}
			return inst;
		}
	} as any;
}
