export const fieldWeakMap = new WeakMap<Object, Record<string, Record<string | symbol, any>>>();

export function defineFieldMetadata(metadataKey: string | symbol, metadataValue: any, meta: Object, name: string) {
	let fieldMetadata = fieldWeakMap.get(meta);
	if(!fieldMetadata) {
		fieldMetadata = {};
		fieldWeakMap.set(meta, fieldMetadata);
	}
	let data = fieldMetadata[name];
	if(!data) {
		data = fieldMetadata[name] = Object.create(null);
	}
	if(!(metadataKey in data)) {
		data[metadataKey] = metadataValue;
	}
}
