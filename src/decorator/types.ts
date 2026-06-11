export type EsFieldDecorator<This extends object, Value = any> = (value: Value, context: ClassFieldDecoratorContext<This, Value>) => any;
export type EsAccessorDecorator<This extends object, Value = any> = (value: Value, context: ClassAccessorDecoratorContext<This, Value>) => any;
export type EsGetterDecorator<This extends object, Value = any> = (value: Value, context: ClassGetterDecoratorContext<This, Value>) => any;
export type EsSetterDecorator<This extends object, Value = any> = (value: Value, context: ClassSetterDecoratorContext<This, Value>) => any;
export type EsMethodDecorator<This extends object, Value extends (...args: any[]) => any> = (value: Value, context: ClassMethodDecoratorContext<This, Value>) => any;
export type EsClassDecorator<This extends object> = (Com: new (...args: any[]) => This, context: ClassDecoratorContext<new (...args: any[]) => This>) => void;

export type LegacyMethodDecorator<This extends object> = (target: This, property: string, descriptor: PropertyDescriptor) => any;
export type LegacyAccessorDecorator<This extends object> = (target: This, property: string, descriptor?: PropertyDescriptor) => any;
export type LegacyPropertyDecorator<This extends object> = (target: This, to: string) => any;
export type LegacyClassDecorator = (Com: Function) => void;
