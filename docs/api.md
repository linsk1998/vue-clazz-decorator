# API 参考

本文档提供所有公开 API 的签名和参数速查。

> 如果你刚开始使用本库，建议先阅读 [新手上路](getting-started.md) 和 [元数据操作](matadata.md)。

---

## 组件创建

### createComponent

将视图函数和 ViewModel 绑定，生成标准 Vue 组件。

```ts
function createComponent<T>(
  template: (props: T) => JSX.Element
): (props: T) => JSX.Element;

function createComponent<T>(
  template: (props: T) => JSX.Element,
  Class: new () => T
): Component<T>;
```

| 参数 | 类型 | 说明 |
| ---- | ---- | ---- |
| `template` | `(props: T) => JSX.Element` | 视图渲染函数 |
| `Class` | `new () => T` | 可选，ViewModel 类 |

### useChildren

在视图函数中获取默认插槽内容。

```ts
function useChildren(): VNode[] | undefined;
```

### use

在当前 ViewModel 中创建另一个 ViewModel 的实例，实现逻辑复用。

```ts
function use<T>(Class: new () => T): T;
```

### reactive

将数据转为响应式实例，可选地绑定数据模型类以保留类型信息。

```ts
function reactive<T>(
  data: object,
  ModelClass?: new () => T
): T;
```

---

## 类装饰器

### @ViewModel

标记类为 ViewModel，处理装饰器元数据。

```ts
function ViewModel<T extends Function>(
  Class: T,
  context?: ClassDecoratorContext
): T;
```

### @Model

标记类为数据模型，用于 `reactive()` 绑定。

```ts
function Model<T extends Function>(
  Class: T,
  context?: ClassDecoratorContext
): T;
```

### @Provide

向后代组件提供数据（可用作类装饰器或字段装饰器）。

```ts
function Provide(key: string | symbol): ClassDecorator & PropertyDecorator;
```

---

## 字段 / 访问器装饰器

### @State

声明响应式状态。

```ts
const State: FieldDecorator & AccessorDecorator;
```

### @Reactive

声明深层响应式状态。

```ts
const Reactive: FieldDecorator & AccessorDecorator;
```

### @Prop

声明组件属性。

```ts
function Prop(): PropertyDecorator;
function Prop(name: string): PropertyDecorator;
```

### @ModelValue

声明 v-model 绑定属性。

```ts
function ModelValue(): PropertyDecorator;
function ModelValue(name: string): PropertyDecorator;
```

### @Computed

声明计算属性。

```ts
const Computed: AccessorDecorator;
```

### @Ref

声明 DOM 元素或组件引用。

```ts
function Ref(): PropertyDecorator;
function Ref(name: string): PropertyDecorator;
```

### @Inject

注入祖先组件提供的数据。

```ts
function Inject(): PropertyDecorator;
function Inject(key: string): PropertyDecorator;
```

### @Emit

声明触发事件的方法。

```ts
function Emit(): MethodDecorator;
function Emit(eventName: string): MethodDecorator;
```

### @Type

标注字段的运行时类型。

```ts
function Type(type: Function): PropertyDecorator;
```

### @ArrayType

标注数组字段的运行时类型。

```ts
function ArrayType(type: Function): PropertyDecorator;
```

---

## 生命周期装饰器

| 装饰器 | 签名 | Vue 对应 |
| ------ | ---- | -------- |
| `@OnWillMount` | `MethodDecorator` | `onBeforeMount` |
| `@OnDidMount` | `MethodDecorator` | `onMounted` |
| `@OnWillUpdate` | `MethodDecorator` | `onBeforeUpdate` |
| `@OnDidUpdate` | `MethodDecorator` | `onUpdated` |
| `@OnWillUnmount` | `MethodDecorator` | `onBeforeUnmount` |
| `@OnDidUnmount` | `MethodDecorator` | `onUnmounted` |
| `@OnDidCatch` | `MethodDecorator` | `onErrorCaptured` |

---

## 元数据操作函数

类级别元数据：

| 函数 | 说明 |
| ---- | ---- |
| `defineClassMetadata(Class, key, value)` | 在类上定义元数据 |
| `getClassMetadataValues(Class, key)` | 获取类上的元数据值列表 |

字段级别元数据：

| 函数 | 说明 |
| ---- | ---- |
| `defineFieldMetadata(Class, field, key, value)` | 在字段上定义元数据 |
| `getFieldMetadataValues(Class, field, key)` | 获取字段上的元数据值列表 |

### metadata

声明元数据的通用装饰器，配合 `@Model` 在字段上标注描述信息：

```ts
function metadata(key: string | symbol, value: any): PropertyDecorator;
```

```tsx
@Model
class UserBo {
  @metadata('label', "用户ID")
  id: string;
}
```

---

## 兼容 reflect-metadata 的函数

与 `reflect-metadata` API 兼容的元数据操作函数，适合迁移项目：

| 函数 | 说明 |
| ---- | ---- |
| `metadata(target, key, value)` | 定义元数据（装饰器工厂） |
| `hasOwnMetadata(key, target)` | 是否存在自身元数据 |
| `getOwnMetadataKeys(target)` | 获取所有自身元数据 key |
| `getOwnMetadata(key, target)` | 获取自身元数据 |
| `getMetadata(key, target)` | 获取元数据（含原型链） |
| `deleteMetadata(key, target)` | 删除元数据 |
| `defineMetadata(key, value, target)` | 定义元数据（函数形式） |
