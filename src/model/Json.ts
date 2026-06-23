import { metadata } from "@/metadata/metadata";
import SimpleDateFormat from "java.text.simple-date-format";
import type { AutoPropertyDecorator } from "../decorator/types";
import { ensureMetadata } from "../ensureMetadata";
import { defineFieldMetadata, fieldWeakMap } from "../metadata/defineFieldMetadata";

export type NextFunction = (value: any) => any;
export type NextHandleFunction = (value: any, config: any, next: NextFunction) => any;

/** 指定 JSON 序列化时的键名 */
export function JsonProperty(jsonKey: string): AutoPropertyDecorator<any, any> {
	return metadata('property', jsonKey);
}

/** 控制序列化方向 */
function JsonExpose<This extends object = any, Value = any>(serialize: boolean, deserialize?: boolean): AutoPropertyDecorator<This, Value>;
function JsonExpose<This extends object = any, Value = any>(options?: { serialize?: boolean; deserialize?: boolean; }): AutoPropertyDecorator<This, Value>;
function JsonExpose<This extends object = any, Value = any>(options?: any): any {
	if(typeof options === "object") {
		if(options) {
			options.serialize = options.serialize !== false;
			options.deserialize = options.deserialize !== false;
		} else {
			options = { serialize: true, deserialize: true };
		}
	} else {
		options = { serialize: options !== false, deserialize: arguments[1] !== false };
	}
	return metadata('expose', options);
}
export { JsonExpose };

/** 忽略属性，序列化和反序列化时都忽略 */
export const JsonIgnore: AutoPropertyDecorator<any, any> = metadata('expose', { serialize: false, deserialize: false });

function getOwnMetadata(metadataKey: string | symbol, metadata: any, name: string) {
	var fieldMetadata = fieldWeakMap.get(metadata);
	if(fieldMetadata) {
		var data = fieldMetadata[name];
		if(data) {
			return data[metadataKey];
		}
	}
}

/** 自定义序列化逻辑，多个函数采用洋葱模型叠加执行 */
export function JsonSerialize<This extends object, Value>(fn: NextHandleFunction): AutoPropertyDecorator<This, Value> {
	return function(target: any, context: any) {
		var property, metadata;
		if(typeof context === "string") {
			property = context;
			metadata = ensureMetadata(target.constructor);
		} else {
			property = context.name;
			metadata = context.metadata;
		}
		var fns: NextHandleFunction[] = getOwnMetadata('serialize', metadata, property);
		if(!fns) {
			fns = [];
			defineFieldMetadata('serialize', fns, metadata, property);
		}
		fns.push(fn);
	};
}

/** 自定义反序列化逻辑，多个函数采用洋葱模型叠加执行 */
export function JsonDeserialize<This extends object, Value>(fn: NextHandleFunction): AutoPropertyDecorator<This, Value> {
	return function(target: any, context: any) {
		var property, metadata;
		if(typeof context === "string") {
			property = context;
			metadata = ensureMetadata(target.constructor);
		} else {
			property = context.name;
			metadata = context.metadata;
		}
		var fns: NextHandleFunction[] = getOwnMetadata('deserialize', metadata, property);
		if(!fns) {
			fns = [];
			defineFieldMetadata('deserialize', fns, metadata, property);
		}
		fns.push(fn);
	};
}

function shiftTimezone(date: Date, hours: number): Date {
	var localOffset = -date.getTimezoneOffset() * 60000;
	var targetOffset = hours * 3600000;
	return new Date(date.getTime() + targetOffset - localOffset);
}

function unshiftTimezone(date: Date, hours: number): Date {
	var localOffset = -date.getTimezoneOffset() * 60000;
	var targetOffset = hours * 3600000;
	return new Date(date.getTime() + localOffset - targetOffset);
}

/** 日期格式化与解析，自动注册序列化与反序列化钩子 */
export function JsonFormat<This extends object = any>(shape: NumberConstructor): AutoPropertyDecorator<This, Date>;
export function JsonFormat<This extends object = any>(pattern: string, timezone?: number): AutoPropertyDecorator<This, Date>;
export function JsonFormat<This extends object = any>(options: { pattern: string; timezone?: number; }): AutoPropertyDecorator<This, Date>;
export function JsonFormat<This extends object = any>(options: { shape: NumberConstructor; }): AutoPropertyDecorator<This, Date>;
export function JsonFormat<This extends object = any>(pattern: string | NumberConstructor | { pattern?: string; timezone?: number; shape?: NumberConstructor; }, timezone?: number): AutoPropertyDecorator<This, Date> {
	var _pattern: string;
	var _timezone: number | undefined;
	var _isTimestamp: boolean;
	if(typeof pattern === "function") {
		_isTimestamp = true;
	} else if(typeof pattern === "object") {
		if((pattern as any).shape === Number) {
			_isTimestamp = true;
		} else {
			_pattern = (pattern as any).pattern;
			_timezone = (pattern as any).timezone;
		}
	} else {
		_pattern = pattern as string;
		_timezone = timezone;
	}
	return function(target: any, context: any) {
		if(_isTimestamp) {
			// 时间戳模式: Date ↔ number
			JsonSerialize(function(value: any, _config: any, next: NextFunction) {
				if(value instanceof Date && !isNaN(value.valueOf())) {
					return value.getTime();
				}
				return next(value);
			})(target, context);
			JsonDeserialize(function(value: any, _config: any, next: NextFunction) {
				return new Date(value);
			})(target, context);
		} else {
			// 日期字符串模式: Date ↔ 格式化字符串
			// 序列化: Date → 格式化字符串
			JsonSerialize(function(value: any, _config: any, next: NextFunction) {
				if(value instanceof Date && !isNaN(value.valueOf())) {
					var date = _timezone !== undefined ? shiftTimezone(value, _timezone) : value;
					var formatter = new SimpleDateFormat(_pattern);
					return formatter.format(date);
				}
				return next(value);
			})(target, context);
			// 反序列化: 格式化字符串 → Date
			JsonDeserialize(function(value: any, _config: any, next: NextFunction) {
				if(typeof value === "string") {
					var formatter = new SimpleDateFormat(_pattern);
					var date = formatter.parse(value);
					if(!isNaN(date.valueOf())) {
						if(_timezone !== undefined) {
							date = unshiftTimezone(date, _timezone);
						}
					}
					return date;
				}
				return next(value);
			})(target, context);
		}
	};
}
