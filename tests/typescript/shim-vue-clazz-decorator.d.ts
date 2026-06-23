/** 参考：消费者如需 experimentalDecorators 模式，将此文件内容添加到项目 .d.ts 中 */
import 'vue-clazz-decorator';
declare module 'vue-clazz-decorator' {
	export interface AutoMethodDecorator<This extends object, Value extends (...args: any[]) => any = any> extends MethodDecorator {}
	export interface AutoPropertyDecorator<This extends object, Value = any> extends PropertyDecorator {}
	export interface AutoAccessorDecorator<This extends object, Value = any> extends MethodDecorator {}
	export interface AutoClassDecorator<This extends object = any> extends ClassDecorator {}
}
