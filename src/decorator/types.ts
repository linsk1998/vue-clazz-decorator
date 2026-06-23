/**
 * 兼容多阶段提案的方法装饰器类型
 *
 * 支持 ClassMethodDecoratorContext 上下文，适用于类方法上的装饰器
 *
 * @typeParam This - 装饰目标所属类的类型
 * @typeParam Value - 被装饰方法的类型签名
 */
export interface AutoMethodDecorator<This extends object, Value extends (...args: any[]) => any = any> {
	(value: Value, context: ClassMethodDecoratorContext<This, Value>): any;
}

/**
 * 兼容多阶段提案的访问器装饰器类型
 *
 * 同时适用于 getter 和 setter 的装饰上下文
 *
 * @typeParam This - 装饰目标所属类的类型
 * @typeParam Value - 访问器的值类型
 */
export interface AutoAccessorDecorator<This extends object, Value = any> {
	(value: (this: This) => Value, context: ClassGetterDecoratorContext<This, Value>): any;
	(value: (this: This, value: Value) => void, context: ClassSetterDecoratorContext<This, Value>): any;
}

/**
 * 兼容多阶段提案的属性装饰器类型
 *
 * 同时适用于字段装饰器和 auto-accessor 装饰器上下文
 *
 * @typeParam This - 装饰目标所属类的类型
 * @typeParam Value - 属性的值类型
 */
export interface AutoPropertyDecorator<This extends object, Value = any> {
	(value: undefined, context: ClassFieldDecoratorContext<This, Value>): any;
	(value: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>): any;
}

/**
 * 兼容多阶段提案的类装饰器类型
 *
 * @typeParam This - 类的实例类型
 */
export interface AutoClassDecorator<This extends object = any> {
	(Com: new (...args: any[]) => This, context: ClassDecoratorContext<new (...args: any[]) => This>): void;
}
