export function getClass(Class: Object): Function {
	return typeof Class === "function" ? Class : Class.constructor;
}
