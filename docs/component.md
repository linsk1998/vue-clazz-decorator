# Vue Component API

> 基于 Class + Decorator 的 Vue 3 组件开发方案。

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

传入已有 Vue JSX 组件作为模板：

```tsx
import { ElDialog } from 'element-plus';

const MyDialog = createComponent(ElDialog, MyDialogViewModel);
```

---

## @ViewModel

类装饰器，标记 ViewModel。所有方法自动 `bind(this)`。

```ts
@ViewModel
class MyViewModel {
    @State
    public count = 0;

    public increase() { this.count++; }
}
```

> `@ViewModel` 会遍历所有字段元数据，为 `@Computed`、`@Ref`、`@State`、`@Prop`、`@Inject`、`@ModelValue`、`@Reactive` 等装饰的字段创建响应式访问器，将普通属性转化为 Vue 响应式属性。

---

## @State

响应式状态，变化时视图自动更新。

```ts
@ViewModel
class MyViewModel {
    @State
    public count = 0;

    @State
    public name: string;  // 未初始化则 undefined
}
```

---

## @Reactive

深层响应式状态，适用于对象和数组等需要深度追踪的场景。

```ts
@Model
class Config {
    @Reactive
    public theme = 'dark';

    @Reactive
    public lang = 'zh';
}
@ViewModel
class MyViewModel {
    @Reactive
    public list: string[] = [];

    @Reactive(Config)
    public config = { theme: 'dark', lang: 'zh' };
}
```

与 `@State` 的区别：
- `@State` 仅追踪引用变化
- `@Reactive` 根据提供的类型深度追踪对象内部属性变化

---

## @Prop

父组件传入的只读属性。

```ts
@ViewModel
class MyViewModel {
    @Prop
    public name?: string;              // prop 名同字段名

    @Prop
    public count?: number = 0;        // 带默认值

    @Prop('myName')
    public alias?: string;             // 自定义外部 prop 名
}
```

---

## @Computed

计算属性，自动追踪依赖。

```ts
@ViewModel
class MyViewModel {
    @State
    public count = 0;

    @Computed
    public get doubleCount() {
        return this.count * 2;
    }
}
```

支持 setter：

```ts
@ViewModel
class MyViewModel {
    @State
    private _name = '';

    @Computed
    public get name() {
        return this._name;
    }
    public set name(value: string) {
        this._name = value.trim();
    }
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

    @Emit('onCustomEvent')
    public handleCustomEvent: Function;                    // 自定义事件名

    public handleClick(e) {
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

```ts
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

```ts
@ViewModel
class MyViewModel {
    @Provide('name')
    @State
    public name = 'initial';
}
// 修改 this.name 后，所有注入方自动更新
```

---

## @Watch

监听 ViewModel 中状态的变化。

```ts
@ViewModel
class ChildViewModel {
    @State
    public name = 'initial';

    @Watch('name')          // 监听某个成员，复杂的可以用computed
    protected onNameChange(newValue: string, oldValue: string) {
        console.log(`name changed from ${oldValue} to ${newValue}`);
    }
    @Watch(inst => inst.name) // 支持以回调的方式获取
    protected onNameChange(newValue: string, oldValue: string) {
        console.log(`name changed from ${oldValue} to ${newValue}`);
    }
    @Watch(function(){ return this.name }) // 也可以使用this
    protected onNameChange(newValue: string, oldValue: string) {
        console.log(`name changed from ${oldValue} to ${newValue}`);
    }
}
```

---

## 生命周期

方法装饰器，对应 Vue 3 生命周期钩子。

| 装饰器           | Vue Hook          | 说明 |
| ---------------- | ----------------- | ---- |
| `@OnDidCreate`   | —                 | ViewModel 实例创建后立即执行，早于所有生命周期 |
| `@OnWillMount`   | `onBeforeMount`   | 组件即将挂载 |
| `@OnDidMount`    | `onMounted`       | 组件已经挂载 |
| `@OnWillUpdate`  | `onBeforeUpdate`  | 组件即将更新 |
| `@OnDidUpdate`   | `onUpdated`       | 组件已经更新 |
| `@OnWillUnmount` | `onBeforeUnmount` | 组件即将卸载 |
| `@OnDidUnmount`  | `onUnmounted`     | 组件已经卸载 |
| `@OnDidCatch`    | `onErrorCaptured` | 捕获后代组件错误 |

```ts
@ViewModel
class MyViewModel {
    @OnDidCreate
    protected init() { console.log('ViewModel created'); }

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

> **注意**：`@OnDidCreate` 不是 Vue 生命周期钩子，它在 ViewModel 实例化后同步执行，早于任何 Vue 生命周期。适合做实例初始化逻辑。

---

## 子组件

```tsx
const Box = createComponent(function() {
    return <div>{useChildren()}</div>;
});
<Box>content</Box>
```

---

## 装饰器组合

**@Prop + @State** — 外部可传入，内部可修改：

```ts
@ViewModel
class MyViewModel {
    @Prop
    @State
    public count: number = 0;
}
```

**@Provide + @State** — 响应式跨组件共享：

```ts
@ViewModel
class MyViewModel {
    @Provide('name')
    @State
    public name = 'init';
}
```

**@Prop + @Inject** — 优先取 Prop，回退到 Inject：

```ts
@ViewModel
class MyViewModel {
    @Prop
    @Inject('config')
    public config?: Config;
}
```

---

## 装饰器互斥规则

同一字段上以下组合不可混用：

| 装饰器        | 不可与之同用                                                                 |
| ------------- | ---------------------------------------------------------------------------- |
| `@Emit`       | `@Computed`, `@ModelValue`, `@State`, `@Reactive`, `@Ref`, `@Prop`, `@Inject`, `@Provide` |
| `@Computed`   | `@Emit`, `@ModelValue`, `@State`, `@Reactive`, `@Ref`, `@Inject`                          |
| `@Ref`        | `@Emit`, `@Computed`, `@ModelValue`, `@State`, `@Reactive`, `@Prop`, `@Inject`            |
| `@ModelValue` | `@Emit`, `@Computed`, `@Ref`, `@State`, `@Reactive`, `@Prop`                              |

允许的合法组合：`@Prop + @State`、`@Prop + @Inject`、`@Provide + @State`、`@Provide + @Prop`。
