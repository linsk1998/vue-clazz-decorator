# 常见问题

---

## 一般问题

### 这个项目和 vue-class-component 有什么关系？

`vue-clazz-decorator` 是一个**独立的库**，灵感来源于 Vue 2 的 `vue-class-component` 和 `vue-property-decorator`，但完全为 Vue 3 重新设计。它基于 Vue 3 的原生响应式系统，不依赖任何已废弃的 Vue 内部 API。

### 我需要学习新的响应式概念吗？

不需要。`@State` 底层就是 Vue 的 `shallowRef`，`@Computed` 就是 `computed()`。如果你熟悉 Vue 3 的响应式系统，这里的一切都很好理解——只是换了一种声明方式。

### 可以和 Options API / Composition API 混用吗？

可以。`createComponent` 生成的就是标准 Vue 组件，可以和其他 API 风格的组件一起使用。

### 支持 Vue 2 吗？

不支持。本库基于 Vue 3 的响应式系统和 Composition API，仅支持 Vue 3 + JSX。

---

## 装饰器配置

### 装饰器报错 "Experimental support for decorators is a feature..."

在 `tsconfig.json` 中开启：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

### 使用 Babel 时装饰器不生效？

确保插件配置正确：

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "version": "2023-11" }],
    ["@babel/plugin-proposal-class-properties", { "setPublicClassFields": false }]
  ]
}
```

### 装饰器顺序重要吗？

`@ViewModel` 必须写在类声明的**最上方**。字段级别的装饰器可以组合使用，建议按语义排列：

```tsx
@Prop      // 先声明外部属性
@State     // 再声明响应式能力
value = 0;
```

---

## 使用问题

### this 在方法中指向哪里？

ViewModel 中的所有方法会自动绑定到 ViewModel 实例。你可以放心地把 `props.methodName` 传给事件处理器，不需要手动 `.bind(this)`。

### @Ref 的值什么时候可用？

在组件挂载前，`@Ref` 字段为 `undefined`。确保在 `@OnDidMount` 或用户交互触发的方法中访问：

```tsx
@ViewModel
class MyViewModel {
  @Ref input: HTMLInputElement;

  @OnDidMount
  focusInput() {
    this.input?.focus();  // 安全访问
  }
}
```

### @Computed 可以用在普通 getter 上吗？

可以，但所在类需要标记 `@ViewModel`：

```tsx
@ViewModel
class MyViewModel {
  @State count = 0;

  @Computed
  get doubled() {
    return this.count * 2;
  }
}
```

### 如何在 ViewModel 中使用 Vue 的组合式函数？

建议把组合式函数放在视图函数中调用，然后通过 Prop 或依赖注入传给 ViewModel。如果确实需要在 ViewModel 中使用，可以在 `@OnDidMount` 方法中调用：

```tsx
@ViewModel
class MyViewModel {
  @State route = '';

  @OnDidMount
  init() {
    const router = useRouter();  // 在 setup 阶段调用
    this.route = router.currentRoute.value.path;
  }
}
```

### Prop 可以传 JSX 吗？

可以。JSX 元素也是普通的 JavaScript 值：

```tsx
<Dialog header={<h1>标题</h1>} />
```

### @Prop 和 @State 能同时用吗？

可以，但有两个前提：
1. 底层不是 TC39 proposal descriptor
2. 非 computed 模式（尚未实现）

`@Prop + @State` 的效果是：属性既可以从外部接收，又可以在内部修改。

---

## 性能问题

### 用 Class 写组件会有性能损耗吗？

没有额外运行时开销。`vue-clazz-decorator` 只是通过装饰器帮你生成 Vue 原生的 `ref`、`computed`、`props` 等，底层和手写 Composition API 完全一致。

### @Computed 的缓存机制和 Vue 的 computed() 一样吗？

完全一样。`@Computed` 底层就是调用 Vue 的 `computed()`，具备相同的依赖追踪和缓存机制。

---

## 类型问题

### TypeScript 提示 "Decorators are not valid here"

检查文件后缀和 `tsconfig.json` 配置：
- Experimental Decorators → 用 `.ts` / `.tsx`
- Proposal Decorators → 用 `.js` / `.jsx`

### Prop 的类型推断不正确

确保 `@Prop` 标注的字段有明确的类型注解：

```tsx
@Prop name?: string;      // 正确
@Prop name;               // 类型可能推断为 any
```

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
