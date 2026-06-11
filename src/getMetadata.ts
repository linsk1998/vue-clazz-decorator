export function getMetadata(Class: Function) {
	let meta = Class[Symbol.metadata];
	if(!meta) {
		meta = Class[Symbol.metadata] = Object.create(null);
	}
	return meta;
}
