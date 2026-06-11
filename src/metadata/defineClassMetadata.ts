export const classWeakMap = new WeakMap<Object, Record<string | symbol, any>>();

export function defineClassMetadata(metadataKey: string | symbol, metadataValue: any, meta: Object) {
	let classMetadata = classWeakMap.get(meta);
	if(!classMetadata) {
		classMetadata = Object.create(null);
		classWeakMap.set(meta, classMetadata);
	}
	if(!(metadataKey in classMetadata)) {
		classMetadata[metadataKey] = metadataValue;
	}
}
