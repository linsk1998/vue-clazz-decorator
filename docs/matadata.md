# Metadata API

> 基于 `Symbol.metadata` 的元数据系统，用于自定义装饰器的数据存取。

---

## metadata

通用装饰器工厂，是所有装饰器的底层实现。

```ts
const MyDecorator = metadata('myKey', 'myValue');

@ViewModel
class MyClass {
    @MyDecorator
    public field: string;
}

getMetadata('myKey', MyClass, 'field'); // => 'myValue'
```

兼容类装饰器、字段装饰器、方法装饰器，同时支持 Legacy 和 TC39 标准。

---

## defineMetadata

统一写入入口，按是否传 `name` 自动分发到类或字段级别。

```ts
defineMetadata('version', '1.0', MyClass);              // 类级别
defineMetadata('label', 'Name', MyClass, 'name');       // 字段级别
```

---

## getMetadata

读取元数据，**沿原型链向上查找**。

```ts
getMetadata('version', MyClass);           // 类级别
getMetadata('label', MyClass, 'name');     // 字段级别
getMetadata('version', myInstance);        // 从实例读取
```

---

## getOwnMetadata

读取元数据，**仅当前类自身**，不查原型链。

```ts
getOwnMetadata('version', MyClass);
getOwnMetadata('label', MyClass, 'name');
```

---

## getOwnMetadataKeys

获取当前类/字段上所有元数据的键名。

```ts
getOwnMetadataKeys(MyClass);              // => ['version']
getOwnMetadataKeys(MyClass, 'name');      // => ['label']
```

---

## hasOwnMetadata

检查是否存在指定元数据。

```ts
hasOwnMetadata('version', MyClass);        // => true
hasOwnMetadata('label', MyClass, 'name');  // => true
```

---

## deleteMetadata

删除指定元数据，返回是否删除成功。

```ts
deleteMetadata('version', MyClass);         // => true
deleteMetadata('label', MyClass, 'name');   // => true
```

---

## getClassMetadataValues

获取类的所有元数据（含继承），子类优先。

```ts
getClassMetadataValues(MyClass);
// => { version: '1.0', ... }
```

---

## getFieldMetadataValues

获取所有字段的元数据（含继承），子类优先。

```ts
getFieldMetadataValues(MyViewModel);
// => {
//     name:  { prop: undefined },
//     count: { state: true }
// }
```

---

## 继承

元数据支持原型链继承，查找时子类优先：

```ts
class Base {
    @Prop
    public name: string;
}

class Child extends Base {
    @State
    public count = 0;
}

getMetadata('prop', Child, 'name');    // => 从 Base 继承找到
getOwnMetadata('prop', Child, 'name'); // => undefined（Child 自身没有）
getFieldMetadataValues(Child);          // => { name: {prop}, count: {state} }
```
