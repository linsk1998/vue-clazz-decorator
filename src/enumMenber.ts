export function enumMember(obj: any, cb: (key: string, descriptor: PropertyDescriptor) => void) {
	let members = new Set<string>();
	members.add('constructor');
	while(obj && obj !== Object.prototype) { // 避免遍历到Object.prototype'
		let props = Object.getOwnPropertyNames(obj);
		let i = props.length;
		while(i-- > 0) {
			let prop = props[i];
			if(members.has(prop)) continue;
			members.add(prop);
			let desc = Object.getOwnPropertyDescriptor(obj, prop);
			cb(prop, desc);
		}
		obj = Object.getPrototypeOf(obj);
	}
	return obj;
}
