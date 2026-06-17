`vue-clazz-decorator` 让你在 Vue 3 中使用 **Class + 装饰器** 的风格来写组件。

## 特色

+ 通过类的方式来写 Vue 组件
+ 方便地复用模板和逻辑
+ 保证自定义类型的纯净
+ 支持多种装饰器编译方式
+ 兼容 reflect-metadata API
+ 完整的数据模型层：序列化/反序列化/类型转换

如果你喜欢已经废弃的 vue-class-component 或 vue-property-decorator, 那么请试试这个项目吧！

## 功能清单

| 分类 | API |
| --- | --- |
| 组件创建 | [createComponent](docs/component.md) [use](docs/component.md) [useChildren](docs/component.md) |
| 类装饰器 | [@ViewModel](docs/component.md) [@Model](docs/model.md) [@Component](docs/component.md) |
| 数据装饰器 | [@State](docs/component.md) [@Reactive](docs/component.md) [@Computed](docs/component.md) [@Ref](docs/component.md) |
| 组件通信装饰器 | [@Prop](docs/component.md) [@Emit](docs/component.md) [@ModelValue](docs/component.md) [@Provide](docs/component.md) [@Inject](docs/component.md) |
| 生命周期装饰器 | [@OnDidCreate](docs/component.md) [@OnWillMount](docs/component.md) [@OnDidMount](docs/component.md) [@OnWillUpdate](docs/component.md) [@OnDidUpdate](docs/component.md) [@OnWillUnmount](docs/component.md) [@OnDidUnmount](docs/component.md) [@OnDidCatch](docs/component.md) |
| JSON 序列化装饰器 | [@JsonProperty](docs/model.md) [@JsonExpose](docs/model.md) [@JsonIgnore](docs/model.md) [@JsonSerialize](docs/model.md) [@JsonDeserialize](docs/model.md) [@JsonFormat](docs/model.md) |
| 数据类型装饰器 | [@Type](docs/model.md) [ArrayType](docs/model.md) [ReactiveArrayType](docs/model.md) [@From](docs/model.md) |
| 元数据操作函数 | [metadata](docs/metadata.md) [defineMetadata](docs/metadata.md) [defineClassMetadata](docs/metadata.md) [defineFieldMetadata](docs/metadata.md) [getClassMetadataValues](docs/metadata.md) [getFieldMetadataValues](docs/metadata.md) |
| 元数据查询函数 | [getMetadata](docs/metadata.md) [getOwnMetadata](docs/metadata.md) [getMetadataKeys](docs/metadata.md) [getOwnMetadataKeys](docs/metadata.md) [hasMetadata](docs/metadata.md) [hasOwnMetadata](docs/metadata.md) [deleteMetadata](docs/metadata.md) |
| 兼容 reflect-metadata 函数 | [metadata](docs/metadata.md) [hasOwnMetadata](docs/metadata.md) [getOwnMetadataKeys](docs/metadata.md) [getOwnMetadata](docs/metadata.md) [getMetadata](docs/metadata.md) [deleteMetadata](docs/metadata.md) [defineMetadata](docs/metadata.md) |
| 模型实例化函数 | [reactive](docs/model.md) [normalize](docs/model.md) [hydrate](docs/model.md) |
| 其他导出 | [nextTick](docs/api.md) [state](docs/api.md) [computed](docs/api.md) |

## 创建组件

这个库的核心思想是 **组件 = 模板 + 业务逻辑**。这是 `createComponent` 设计的体现，避开 Vue 3 不能用 class 组件的同时，顺便能复用模板和逻辑。

```tsx
@ViewModel
export class CounterViewModel {
    @State
    public count = 0;

    @Computed
    public get doubleCount() {
        return this.count * 2;
    }

    public increment() {
        this.count++;
    }
}
export function CounterView(props: CounterViewModel) {
    return <div>
        <p>Count: {props.count}</p>
        <button onClick={props.increment}>+1</button>
    </div>;
}

export const Counter = createComponent(CounterView, CounterViewModel);
```

## 组件生命周期

使用注解声明生命周期方法，不强制固定方法名，一个钩子可以绑定多个方法，保证类的纯净。

```tsx
@ViewModel
export class FooViewModel {
    @OnDidCreate
    protected init() {
        console.log("ViewModel created");
    }

    @OnDidMount
    protected xxxx() {
        console.log("componentDidMount");
    }
    @OnDidMount
    protected yyyy() {
        console.log("componentDidMount again");
    }
}
export function FooView(props: FooViewModel) {
    return <div></div>;
}

export const Foo = createComponent(FooView, FooViewModel);
```

## 组件逻辑复用

业务逻辑自动就包在命名空间里，非常易于管理。

```tsx
@ViewModel
export class FooViewModel {
}
@ViewModel
export class BarViewModel {
    public foo1 = use(FooViewModel);
    public foo2 = use(FooViewModel);
}
export function BarView(props: BarViewModel) {
    return <div></div>;
}

export const Bar = createComponent(BarView, BarViewModel);
```

## 模型层声明

用 `@Model` 标记数据模型类，结合元数据描述字段含义，再通过 `reactive()` 将普通数据转为响应式实例，同时保留类型信息。

```typescript
@Model
export class UserBo {
    @metadata('label', "用户ID")
    public id: string;

    @metadata('label', "用户名")
    public name: string;
}
var user = reactive({
    id: "admin",
    name: "超级管理员",
}, UserBo);
```

## 如何写一个注解

库内置的metadata函数可以便捷地帮助我们创建一个注解。

```typescript
// 定义一个注解
function Label(text: string) {
    return metadata('label', text);
}

// 使用
@Model
export class UserBo {
    @Label("用户ID")
    public id: string;

    @Label("用户名")
    public name: string;
}

// 获取元数据
getMetadataValues(UserBo);
// { id: { label: "用户ID"}, name: { label: "用户名" } }
```

## 文档导航

- [新手上路](docs/getting-started.md) — 环境配置、第一个组件、装饰器编译
- [组件开发](docs/component.md) — 如何用类和装饰器开发 Vue 组件
- [元数据操作](docs/metadata.md) — 如何对类的元数据进行增删改查
- [数据模型](docs/model.md) — 数据类型转化、JSON 序列化
- [进阶用法](docs/advanced.md) — 构建方式、自定义装饰器
- [API 参考](docs/api.md) — 函数签名与参数速查
- [常见问题](docs/faq.md) — FAQ

---

## 支持的装饰器编译方式

项目支持多种方式，并可以混合使用。

* Typescript:  `experimentalDecorators: true` + `useDefineForClassFields: false`
* Typescript: `experimentalDecorators: false` + `useDefineForClassFields: true`
* Babel: `["@babel/plugin-proposal-decorators", { "version": "2023-11" }]` + `setPublicClassFields: false`

---

## 许可证

[MIT](LICENSE)
