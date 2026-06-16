import type { EsMethodDecorator, LegacyMethodDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type LifecycleDecorator<This extends object, Value extends ((...args: any[]) => any) = (...args: any[]) => any> =
	EsMethodDecorator<This, Value> &
	LegacyMethodDecorator<This>;

/** ViewModel已经创建了实例 */
export const OnDidCreate: LifecycleDecorator<any> = metadata('onDidCreate', true);
/** 组件即将挂载 */
export const OnWillMount: LifecycleDecorator<any> = metadata('onWillMount', true);
/** 组件已经挂载 */
export const OnDidMount: LifecycleDecorator<any> = metadata('onDidMount', true);
/** 组件即将更新 */
export const OnWillUpdate: LifecycleDecorator<any> = metadata('onWillUpdate', true);
/** 组件已经更新 */
export const OnDidUpdate: LifecycleDecorator<any> = metadata('onDidUpdate', true);
/** 组件即将卸载 */
export const OnWillUnmount: LifecycleDecorator<any> = metadata('onWillUnmount', true);
/** 组件已经卸载 */
export const OnDidUnmount: LifecycleDecorator<any> = metadata('onDidUnmount', true);
/** 捕获后代组件错误 */
export const OnDidCatch: LifecycleDecorator<any> = metadata('onDidCatch', true);
