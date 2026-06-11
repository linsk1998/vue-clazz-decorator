import { getFieldMetadataValues } from "@/metadata/getFieldMetadataValues";
import { use } from "./use";

export function Component<T extends { new(): T; }>(Class: T, context?: ClassDecoratorContext) {
	let props = [];
	let metadata = getFieldMetadataValues(Class);
	for(let key in metadata) {
		let fieldConfig = metadata[key];
		if('prop' in fieldConfig) {
			props.push(fieldConfig.prop || key);
		}
	}
	return {
		props: props,
		setup(props) {
			let inst = use(Class);
			return inst;
		}
	};
}
