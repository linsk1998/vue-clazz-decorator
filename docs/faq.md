# 常见问题

---

## 一般问题

### 这个项目和 vue-class-component 有什么关系？

`vue-clazz-decorator` 是一个**独立的库**，灵感来源于 Vue 2 的 `vue-class-component` 和 `vue-property-decorator`，但完全为 Vue 3 重新设计。它基于 Vue 3 的原生响应式系统，不依赖任何已废弃的 Vue API。

### 可以和 Options API / Composition API 混用吗？

可以。`createComponent` 生成的就是标准 Vue 组件，可以和其他 API 风格的组件一起使用。

### 支持 Vue 2 吗？

不支持。本库基于 Vue 3 的响应式系统和 Composition API，仅支持 Vue 3 + JSX。

---

## 使用问题

### this 在方法中指向哪里？

ViewModel 中的所有方法会自动绑定到 ViewModel 实例。你可以放心地把 `props.methodName` 传给事件处理器，不需要手动 `.bind(this)`。

### 如何在 ViewModel 中使用 Vue 的hook函数？

可以，直接在构造函数直接使用。

```tsx
@ViewModel
class MyViewModel {
  // 天然带有命名空间
  private router = useRouter();
}
```

### Prop 可以传 JSX 吗？

可以。JSX 元素也是普通的 JavaScript 值：

```tsx
<Dialog header={<h1>标题</h1>} />
```

### @Prop 和 @State 能同时用吗？

可以，`@Prop + @State` 的效果是@State，初始值从外部接收。

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
