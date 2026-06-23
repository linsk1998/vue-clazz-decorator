/**
 * 遍历对象及其原型链上的所有自有属性成员
 *
 * 从目标对象开始，沿着原型链向上遍历（跳过 `Object.prototype`），
 * 对每个自有属性调用回调函数。已遍历过的属性名会被跳过，避免重复。
 *
 * @param obj - 目标对象或实例
 * @param cb - 对每个成员调用的回调，接收属性名和属性描述符
 * @returns 遍历终止时的原型对象
 */
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
