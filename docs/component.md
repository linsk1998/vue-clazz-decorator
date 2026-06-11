# Vue Component API

> 基于 Class + Decorator 的 Vue 3 MVVM 组件开发方案。

---

## createComponent

将视图模板与 ViewModel 绑定，返回 Vue 组件。

```tsx
function MyView(props: MyViewModel) {
    return <div>Hello, {props.name}!</div>;
}

@ViewModel
class MyViewModel {
    @Prop
    public name?: string;
}

const MyComponent = createComponent(MyView, MyViewModel);

// 使用
<MyComponent name="World" />
```

不传 ViewModel 时仅包装模板：

```tsx
const Simple = createComponent(function() {
    return <div>Hello!</div>;
});
```

---

## @ViewModel

类装饰器，标记 ViewModel。所有方法自动 `bind(this)`。

```tsx
@ViewModel
class MyViewModel {
    @State
    public count = 0;

    public increase() { this.count++; }
}
```

---

## @State

响应式状态，变化时视图自动更新。

```tsx
@State
public count = 0;

@State
public name: string;  // 未初始化则 undefined
```

---

## @Prop

父组件传入的只读属性。

```tsx
@Prop
public name?: string;              // prop 名同字段名

@Prop
public count?: number = 0;        // 带默认值

@Prop('myName')
public name?: string;              // 自定义外部 prop 名
```

---

## @Computed

计算属性，自动追踪依赖。

```tsx
@State
public count = 0;

@Computed
public get doubleCount() {
    return this.count * 2;
}
```

---

## @Ref

获取模板中 DOM 元素引用。

```tsx
function MyView(props: MyViewModel) {
    return <button ref="btn" onClick={props.onClick}>Click</button>;
}

@ViewModel
class MyViewModel {
    @Ref
    public btn: HTMLButtonElement;        // 匹配 ref="btn"

    @Ref('btn')
    public btn2: HTMLButtonElement;       // 显式指定

    public onClick() { console.log(this.btn.tagName); }
}
```

---

## @Emit

事件发射，调用父组件传入的回调。`this` 绑定到 ViewModel。

```tsx
@ViewModel
class ButtonViewModel {
    @Emit
    public onClick: Function;                    // 自动匹配 onXxx

    @Emit('customEvent')
    public handler: Function;                    // 自定义事件名

    public doClick(e) {
        const result = this.onClick(e);          // 调用回调并获取返回值
    }
}

// 父组件
<Button onClick={function() { return 'result'; }} />
```

---

## @ModelValue

实现 `v-model` 双向绑定。

```tsx
@ViewModel
class InputViewModel {
    @ModelValue
    public value = "init";                    // 默认 modelValue

    @ModelValue('title')
    public title = "";                        // 自定义 prop 名
}

function InputView(props: InputViewModel) {
    return <input v-model={props.value} />;
}

// 父组件
<Input v-model={parentText} />
```

---

## @Provide / @Inject

跨层级组件通信。

```tsx
// 提供整个 ViewModel 实例
@ViewModel
@Provide('ancestor')
class AncestorViewModel {
    public name = 'ancestor';
}

// 提供单个属性
@ViewModel
class ParentViewModel {
    @Provide('parentName')
    public name = 'parent';
}

// 注入
@ViewModel
class ChildViewModel {
    @Inject('ancestor')
    public ancestor: AncestorViewModel;

    @Inject
    public parentName: string;               // key 同字段名
}
```

配合 `@State` 实现响应式注入：

```tsx
@Provide('name')
@State
public name = 'initial';
// 修改 this.name 后，所有注入方自动更新
```

---

## 生命周期

方法装饰器，对应 Vue 3 生命周期钩子。

| 装饰器           | Vue Hook          |
| ---------------- | ----------------- |
| `@OnWillMount`   | `onBeforeMount`   |
| `@OnDidMount`    | `onMounted`       |
| `@OnWillUpdate`  | `onBeforeUpdate`  |
| `@OnDidUpdate`   | `onUpdated`       |
| `@OnWillUnmount` | `onBeforeUnmount` |
| `@OnDidUnmount`  | `onUnmounted`     |
| `@OnDidCatch`    | `onErrorCaptured` |

```tsx
@ViewModel
class MyViewModel {
    @OnDidMount
    protected handleMount() { console.log('mounted'); }

    @OnWillUnmount
    protected cleanup() { console.log('cleanup'); }

    @OnDidCatch
    protected onError(err: Error) {
        console.error(err);
        return false; // 阻止错误向上传播
    }
}
```

---

## 插槽

**默认插槽：**

```tsx
const Box = createComponent(function() {
    return <div>{useChildren()}</div>;
});
<Box>content</Box>
```

**具名插槽：**

```tsx
import { useSlots } from 'vue';

const Layout = createComponent(function(props: any) {
    const slots = useSlots();
    return <>
        <div>{props.header}</div>
        <div>{slots.body?.()}</div>
    </>;
});

<Layout header={<h4>标题</h4>} v-slots={{ body: () => <p>内容</p> }} />
```

---

## 装饰器组合

**@Prop + @State** — 外部可传入，内部可修改：

```tsx
@Prop
@State
public count: number = 0;
```

**@Provide + @State** — 响应式跨组件共享：

```tsx
@Provide('name')
@State
public name = 'init';
```

---

## 装饰器互斥规则

同一字段上以下组合不可混用：

| 装饰器        | 不可与之同用                                                                 |
| ------------- | ---------------------------------------------------------------------------- |
| `@Emit`       | `@Computed`, `@ModelValue`, `@State`, `@Ref`, `@Prop`, `@Inject`, `@Provide` |
| `@Computed`   | `@Emit`, `@ModelValue`, `@State`, `@Ref`, `@Inject`                          |
| `@Ref`        | `@Emit`, `@Computed`, `@ModelValue`, `@State`, `@Prop`, `@Inject`            |
| `@ModelValue` | `@Emit`, `@Computed`, `@Ref`, `@State`, `@Prop`                              |

允许的合法组合：`@Prop + @State`、`@Prop + @Inject`、`@Provide + @State`、`@Provide + @Prop`。
