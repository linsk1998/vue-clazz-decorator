import { NextFunction, NextHandleFunction } from "./Json";


/**
 * 应用反序列化函数，多个函数采用洋葱模型叠加执行
 *
 * 将字段配置中注册的反序列化函数按洋葱模型顺序执行，
 * 最外层反序列化函数先执行
 *
 * @param value - 待反序列化的原始值
 * @param fieldConfig - 字段配置对象，需包含 `deserialize` 函数数组
 * @returns 反序列化后的值
 */
export function applyOnionDeserialize(value: any, fieldConfig: any): any {
	// 收集从子类到父类的反序列化函数，然后反转（最外层先执行）
	var fns: NextHandleFunction[] = fieldConfig.deserialize;
	if(!fns || !fns.length) return value;
	var i = fns.length - 1;
	return fns[i](value, fieldConfig, createNext(fieldConfig, fns, i - 1));
}

function createNext(fieldConfig: any, fns: NextHandleFunction[], index: number): NextFunction {
	if(index < 0) {
		return function(value: any) {
			return value;
		};
	}
	return function(value: any) {
		return fns[index](value, fieldConfig, createNext(fieldConfig, fns, index - 1));
	};
}
