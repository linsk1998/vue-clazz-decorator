export interface AutoMethodDecorator<This extends object, Value extends (...args: any[]) => any = any> {
	(value: Value, context: ClassMethodDecoratorContext<This, Value>): any;
}
export interface AutoAccessorDecorator<This extends object, Value = any> {
	(value: (this: This) => Value, context: ClassGetterDecoratorContext<This, Value>): any;
	(value: (this: This, value: Value) => void, context: ClassSetterDecoratorContext<This, Value>): any;
}
export interface AutoPropertyDecorator<This extends object, Value = any> {
	(value: undefined, context: ClassFieldDecoratorContext<This, Value>): any;
	(value: ClassAccessorDecoratorTarget<This, Value>, context: ClassAccessorDecoratorContext<This, Value>): any;
}
export interface AutoClassDecorator<This extends object = any> {
	(Com: new (...args: any[]) => This, context: ClassDecoratorContext<new (...args: any[]) => This>): void;
}
