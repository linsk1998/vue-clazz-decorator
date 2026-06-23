# 常见问题

---

## 一般问题

### 这个项目和 vue-class-component 有什么关系？

`vue-clazz-decorator` 是一个**独立的库**，灵感来源于 Vue 2 的 `vue-class-component` 和 `vue-property-decorator`，但完全为 Vue 3 重新设计。它基于 Vue 3 的原生响应式系统，不依赖任何已废弃的 Vue API。

### 这个项目 内部是 Options API 还是 Composition API？

内部是 Composition API，且在配置 `__VUE_OPTIONS_API__: false` 下通过所有测试。

### 可以和 Options API / Composition API 混用吗？

可以。`createComponent` 生成的就是标准 Vue 组件，可以和其他 API 风格的组件一起使用。

### 支持 Vue 2 吗？

理论上 Vue 2.7 是兼容Vue3 API 的。但本库不保证能用。

### 支持 SFC（单文件组件）吗？

本库的核心模式是 JSX/TSX 视图函数 + ViewModel 类，不依赖 `.vue` SFC 文件。但你可以在同一项目中混用 SFC 和 `createComponent` 创建的组件。

```ts
import Template from './template.vue';

@ViewModel
class AppViewModel {
    @State
    title = 'Hello';
}
const App = createComponent(Template, AppViewModel);
```

---

## 使用问题

### this 在方法中指向哪里？

ViewModel 中的所有类方法方法会自动绑定到 ViewModel 实例。你可以放心地把 `props.methodName` 传给事件处理器。但是

```ts
@ViewModel
class MyViewModel {
    @State
    public count = 0;

    // 类方法中，this必然是这个类的实例
    public increment() { this.count++; }

    // 如果是函数类型的成员变量，不保证this的指向，要看调用方给this传什么值
    public foo = function() { this.count++; }
}
```

### 如何在 ViewModel 中使用 Vue 的 hook 函数？

可以，直接在字段声明中使用。天然带有命名空间。

```ts
@ViewModel
class MyViewModel {
    private router = useRouter();
    private route = useRoute();
    private store = useStore();
}
```

### Prop 可以传 JSX 吗？

可以。JSX 元素也是普通的 JavaScript 值：

```tsx
<Dialog header={<h1>标题</h1>} />
```

### @Prop 和 @State 能同时用吗？

可以，`@Prop + @State` 的效果是 `@State`，初始值从外部接收。

```ts
@ViewModel
class MyViewModel {
    @Prop
    @State
    public count: number = 0;
}
// 外部可传 <Counter count={5} />
// 内部可修改 this.count++
```

### @State 和 @Reactive 有什么区别？

- `@State` 仅追踪引用变化
- `@Reactive` 根据提供的类型深度追踪对象内部属性变化

```ts
@ViewModel
class MyViewModel {
    @State
    public count = 0;           // 基本类型用 @State

    @Reactive
    public list: string[] = []; // 对象/数组用 @Reactive
}
```

### reactive、normalize、hydrate 怎么选？

选 hydrate 就得了。

### @OnDidCreate 和构造函数有什么区别？

`@OnDidCreate` 在 `use()` 创建 ViewModel 实例后同步执行，此时：
- 所有响应式访问器已就绪
- Props 已注入
- Inject 数据已可用

而构造函数执行时这些还未初始化。因此需要访问响应式状态或注入数据的初始化逻辑应使用 `@OnDidCreate`。

```ts
@ViewModel
class MyViewModel {
    @Inject('config')
    public config: Config;

    @OnDidCreate
    protected init() {
        // 此时 config 已可用
        console.log(this.config);
    }
}
```

---

## 装饰器编译问题

按以下清单检查
- vueJsx 插件是否开启
- vueJsx 插件是改了顺序
- typescript 的 target 不能是 esnext
- 是否开启了 typescript-plugin-mark-fields

---

## 其他

### 如何贡献代码？

欢迎提交 Issue 和 PR。请确保：
1. 代码通过现有测试
2. 新增功能附带测试用例
3. 更新相关文档

### 发现了 Bug 怎么办？

请在 GitHub Issues 中描述：
- Vue 版本
- TypeScript / Babel 版本
- 装饰器语法类型（Experimental 或 Proposal）
- 最小复现代码

### 项目许可证是什么？

[MIT](LICENSE)
