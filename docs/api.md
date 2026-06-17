# API 参考

本文档提供所有公开 API 的签名和参数速查。

> 如果你刚开始使用本库，建议先阅读 [新手上路](getting-started.md) 和 [组件开发](component.md)。

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

也支持传入已有的 Vue JSX 组件作为模板：

```tsx
import { MyExistingComponent } from './somewhere';

const Wrapped = createComponent(MyExistingComponent, MyViewModel);
```

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
function reactive<T>(data: object, ModelClass?: new () => T): T;
```

详见 [数据模型](model.md#reactive-创建响应式实例)。

### normalize

将普通数据（一般是后端传来的 JSON）按模型规则规范化，不包含响应性。

```ts
function normalize<T>(data: object, ModelClass?: new () => T): T;
```

详见 [数据模型](model.md#normalize-对象规范化)。

### hydrate

将原始数据转换为具有响应式状态、业务逻辑和关联关系的完整内存对象。

```ts
function hydrate<T>(data: object, ModelClass?: new () => T): T;
```

详见 [数据模型](model.md#hydrate-对象水合)。

---

## 类装饰器

### @ViewModel

标记类为 ViewModel，处理装饰器元数据。所有方法自动 `bind(this)`。

```ts
function ViewModel<T extends Function>(
  Class: T,
  context?: ClassDecoratorContext
): T;
```

### @Model

标记类为数据模型，用于 `reactive()`/`hydrate()`/`normalize()` 绑定。自动注入 `.toJSON()` 方法。

```ts
function Model<T extends Function>(
  Class: T,
  context?: ClassDecoratorContext
): T;
```

### @Component

轻量级类装饰器，仅提取 Props 并通过 `use()` 创建实例，不处理渲染模板。适用于需要手动组合的场景。

```ts
function Component<T extends { new(): T; }>(Class: T, context?: ClassDecoratorContext): {
  props: string[];
  setup(props: Record<string, any>): T;
};
```

### @Provide

向后代组件提供数据（可用作类装饰器或字段装饰器）。

```ts
function Provide(key: string | symbol): ClassDecorator & PropertyDecorator;
```

---

## 字段 / 访问器装饰器

### @State

声明响应式状态（基于 `shallowRef`）。

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

获取模板中 DOM 元素引用。

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

---

## 生命周期装饰器

| 装饰器 | 签名 | Vue 对应 | 说明 |
| ------ | ---- | -------- | ---- |
| `@OnDidCreate` | `MethodDecorator` | — | ViewModel 实例创建后立即执行，早于所有生命周期 |
| `@OnWillMount` | `MethodDecorator` | `onBeforeMount` | 组件即将挂载 |
| `@OnDidMount` | `MethodDecorator` | `onMounted` | 组件已经挂载 |
| `@OnWillUpdate` | `MethodDecorator` | `onBeforeUpdate` | 组件即将更新 |
| `@OnDidUpdate` | `MethodDecorator` | `onUpdated` | 组件已经更新 |
| `@OnWillUnmount` | `MethodDecorator` | `onBeforeUnmount` | 组件即将卸载 |
| `@OnDidUnmount` | `MethodDecorator` | `onUnmounted` | 组件已经卸载 |
| `@OnDidCatch` | `MethodDecorator` | `onErrorCaptured` | 捕获后代组件错误 |

---

## JSON 序列化装饰器

### @JsonProperty

指定 JSON 序列化时的键名。

```ts
function JsonProperty(jsonKey: string): PropertyDecorator;
```

### @JsonExpose

控制序列化方向。

```ts
function JsonExpose(serialize: boolean, deserialize?: boolean): PropertyDecorator;
function JsonExpose(options?: { serialize?: boolean; deserialize?: boolean }): PropertyDecorator;
```

### @JsonIgnore

忽略属性，序列化和反序列化时都忽略。

```ts
const JsonIgnore: PropertyDecorator;
```

### @JsonSerialize

自定义序列化逻辑，多个函数采用洋葱模型叠加执行。

```ts
function JsonSerialize(fn: NextHandleFunction): PropertyDecorator;
```

### @JsonDeserialize

自定义反序列化逻辑，多个函数采用洋葱模型叠加执行。

```ts
function JsonDeserialize(fn: NextHandleFunction): PropertyDecorator;
```

### @JsonFormat

日期格式化，自动注册序列化与反序列化钩子。

```ts
function JsonFormat(pattern: string, timezone?: number): PropertyDecorator;
function JsonFormat(shape: NumberConstructor): PropertyDecorator;
function JsonFormat(options: { pattern: string; timezone?: number }): PropertyDecorator;
function JsonFormat(options: { shape: NumberConstructor }): PropertyDecorator;
```

详见 [数据模型](model.md#jsonformat-日期格式化)。

---

## 数据类型装饰器

### @Type

标注字段的运行时类型，`normalize`/`reactive`/`hydrate` 时自动将普通数据转为类型化实例。

```ts
function Type(type: Function): PropertyDecorator;
```

### @ArrayType

标注数组字段的元素运行时类型。

```ts
function ArrayType(type: Function): { new(): any[]; };
```

### ReactiveArrayType

创建深层响应式数组类型（每个元素也会被 `reactive` 处理）。

```ts
function ReactiveArrayType(type: Function): { new(): any[]; };
```

### @From

引用另一个 Model 的某个字段的元数据配置。

```ts
function From(SourceClass: Function, sourceField: string): PropertyDecorator;
```

---

## 元数据操作函数

### 类级别元数据

| 函数 | 说明 |
| ---- | ---- |
| `defineClassMetadata(Class, key, value)` | 在类上定义元数据 |
| `getClassMetadataValues(Class)` | 获取类上的所有元数据（含继承） |

### 字段级别元数据

| 函数 | 说明 |
| ---- | ---- |
| `defineFieldMetadata(Class, field, key, value)` | 在字段上定义元数据 |
| `getFieldMetadataValues(Class)` | 获取所有字段的元数据（含继承） |

### 通用元数据操作

| 函数 | 说明 |
| ---- | ---- |
| `metadata(key, value)` | 声明元数据的通用装饰器工厂 |
| `defineMetadata(key, value, target, name?)` | 统一写入入口（按 name 有无分发到类/字段级别） |
| `getMetadata(key, target, name?)` | 读取元数据（含原型链） |
| `getOwnMetadata(key, target, name?)` | 读取元数据（仅自身） |
| `getMetadataKeys(target, name?)` | 获取所有元数据键名（含原型链） |
| `getOwnMetadataKeys(target, name?)` | 获取所有元数据键名（仅自身） |
| `hasMetadata(key, target, name?)` | 检查是否存在元数据（含原型链） |
| `hasOwnMetadata(key, target, name?)` | 检查是否存在元数据（仅自身） |
| `deleteMetadata(key, target, name?)` | 删除元数据 |

详见 [元数据操作](metadata.md)。

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

---

## 其他导出

### nextTick

从 Vue 重导出的 `nextTick`，方便在 ViewModel 中使用。

```ts
import { nextTick } from 'vue'; // 重新导出
```

### state

底层工具函数，创建 `shallowRef` 的 getter/setter 访问器对。

```ts
function state<T>(initValue: T): { get(): T; set(value: T): void; }
```

### computed

底层工具函数，创建 Vue `computed` 的 getter/setter 访问器对。

```ts
function computed<T>(getter: () => T): { get(): T; }
function computed<T>(getter: () => T, setter: (value: T) => void): { get(): T; set(value: T): void; }
```
