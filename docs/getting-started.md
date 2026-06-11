# 新手上路

本章带你从零开始搭建项目并运行第一个组件。

---

## 环境准备

你需要一个 **Vue 3 + JSX/TSX** 的项目。

### 用 Vite 新建项目（推荐）

```bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
pnpm install
```

安装 JSX 插件和本库：

```bash
pnpm add -D @vitejs/plugin-vue-jsx
pnpm add vue-clazz-decorator
```

在 `vite.config.ts` 中启用 JSX：

```ts
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue(), vueJsx()],
});
```

### 在现有项目中接入

确保项目已使用 Vue 3，且构建工具支持 JSX（Vite、Webpack、Rollup 均可）。

```bash
pnpm add vue-clazz-decorator
```

---

## 选择装饰器编译方式

`vue-clazz-decorator` 支持多种装饰器编译方式，**功能完全一致，选一个适合你的即可**。

### A) TypeScript Experimental Decorators（推荐）

TypeScript 长期支持的传统装饰器，生态成熟，类型推断完善。在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

文件后缀用 `.ts` 或 `.tsx`。

### B) TypeScript 标准装饰器

TypeScript 5.0+ 支持 TC39 标准语法。在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "experimentalDecorators": false,
    "useDefineForClassFields": true
  }
}
```

### C) Babel Proposal Decorators

ECMAScript 标准化中的装饰器语法。需要 Babel 插件：

```bash
pnpm add -D @babel/plugin-proposal-decorators
```

```json
{
  "plugins": [
    ["@babel/plugin-proposal-decorators", { "version": "2023-11" }],
    ["@babel/plugin-proposal-class-properties", { "setPublicClassFields": false }]
  ]
}
```

文件后缀用 `.js` 或 `.jsx`。

> 下文的示例全部使用 **Experimental Decorators + TSX**。如果你使用其他方式，只需要调整文件后缀和类型注解。

---

## 第一个组件

我们写一个计数器，体会 "视图 + ViewModel" 的分离模式。

### 步骤 1：定义 ViewModel

用 `@ViewModel` 标记类，用 `@State` 声明响应式状态：

```tsx
import { ViewModel, State, Computed } from 'vue-clazz-decorator';

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
```

### 步骤 2：写视图函数

视图就是一个普通函数，接收 ViewModel 实例作为参数，返回 JSX：

```tsx
export function CounterView(props: CounterViewModel) {
  return (
    <div>
      <p>Count: {props.count}</p>
      <p>Double: {props.doubleCount}</p>
      <button onClick={props.increment}>+1</button>
    </div>
  );
}
```

### 步骤 3：绑定成组件

```tsx
import { createComponent } from 'vue-clazz-decorator';

export const Counter = createComponent(CounterView, CounterViewModel);
```

### 步骤 4：使用

```tsx
import { Counter } from './Counter';

function App() {
  return (
    <div>
      <h1>我的应用</h1>
      <Counter />
    </div>
  );
}
```

---

## 带 Props 的组件

让父组件向子组件传入数据：

```tsx
@ViewModel
class GreetingViewModel {
  @Prop name = 'Guest';
}

function GreetingView(props: GreetingViewModel) {
  return <h1>Hello, {props.name}!</h1>;
}

export const Greeting = createComponent(GreetingView, GreetingViewModel);
```

使用：

```tsx
<Greeting name="World" />
```

---

## 纯模板组件（无 ViewModel）

如果组件没有自己的状态，可以只传视图函数：

```tsx
import { createComponent } from 'vue-clazz-decorator';

export const Hello = createComponent(function Hello() {
  return <div>Hello, World!</div>;
});
```

---

## 下一步

- 想理解 ViewModel 与模板分离的设计思想？阅读 [组件开发](component.md)
- 想了解每个装饰器的详细用法？阅读 [元数据操作](matadata.md)
- 想看常见开发场景？阅读 [数据模型](model.md)
