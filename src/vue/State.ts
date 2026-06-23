import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type StateDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value>;

/**
 * 状态属性装饰器
 *
 * 标记一个属性为组件响应式状态。
 * 支持与 `@Inject` 和 `@Prop` 同时使用，初始值可以从Prop或Inject中获取
 */
export const State: StateDecorator<object, any> = metadata('state', true);
