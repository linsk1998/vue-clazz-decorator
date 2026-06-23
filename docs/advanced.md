# 进阶用法

> ⚠️ **本章涵盖构建方式等进阶用法。比较专业，一般人把握不住。**

> 👉 **大多数项目请走 [快速开始](./getting-started.md) 的默认配置，不需要本节的任何操作。**

## 如何配置 experimentalDecorators 类型元数据

参考配置示例：[typescript](https://github.com/linsk1998/vue-clazz-decorator/tree/main/tests/typescript.js) [babel](https://github.com/linsk1998/vue-clazz-decorator/tree/main/tests/babel.js)

配置 `experimentalDecorators: true` 后，由于装饰器的函数签名不同，必须新建一个文件 `shim-vue-clazz-decorator.d.ts` 在其中做类型重载，才能使装饰器的类型推断正常。

```typescript
// src/shim-vue-clazz-decorator.d.ts // 一般行业内约定补丁类的类型定义文件命名为 shim-*.d.ts
import 'vue-clazz-decorator';
declare module 'vue-clazz-decorator' {
    export interface AutoMethodDecorator<This extends object, Value extends (...args: any[]) => any = any> extends MethodDecorator {}
    export interface AutoPropertyDecorator<This extends object, Value = any> extends PropertyDecorator {}
    export interface AutoAccessorDecorator<This extends object, Value = any> extends MethodDecorator {}
    export interface AutoClassDecorator<This extends object = any> extends ClassDecorator {}
}
```

> 如果你在构建时开启 `experimentalDecorators: true` 且用 babel 转译，是不需要这个类型补丁的。

## 如何配置 useDefineForClassFields: false

如果开启 `useDefineForClassFields: false`，这会消除字段定义，导致运行时无法知道这个类有哪些字段。为了在配置 `useDefineForClassFields: false` 后起作用，你需要引入 `typescript-plugin-mark-fields` 或 `babel-plugin-mark-fields`。这2个插件会在构建时，提前知道字段名，并做记号，后续运行时代码就可以知道一个类有哪些字段了。

参考配置示例：[typescript](https://github.com/linsk1998/vue-clazz-decorator/tree/main/tests/typescript.js) [babel](https://github.com/linsk1998/vue-clazz-decorator/tree/main/tests/babel.js)

## 如何配置 emitDecoratorMetadata 类型元数据

TypeScript 开启 `emitDecoratorMetadata` 后，编译器会自动给**有装饰器的字段、方法、构造器参数**标注 `design:type`、`design:paramtypes`、`design:returntype` 三种元数据。

```typescript
class User {
    @Reflect.metadata('deco', true)
    name: string;  // → design:type = String

    @Reflect.metadata('deco', true)
    age: number;   // → design:type = Number

    @someMethodDeco
    greet(msg: string, times: number): boolean {
        return true;
    }
    // → design:type = Function
    // → design:paramtypes = [String, Number]
    // → design:returntype = Boolean
}

// 读取自动生成的类型
Reflect.getMetadata('design:type', User.prototype, 'name');       // String
Reflect.getMetadata('design:paramtypes', User.prototype, 'greet'); // [String, Number]
```

参考配置示例：[typescript](https://github.com/linsk1998/vue-clazz-decorator/tree/main/tests/typescript.js) [babel](https://github.com/linsk1998/vue-clazz-decorator/tree/main/tests/babel.js)

---

### 全局函数注入

启用了 `emitDecoratorMetadata` 后，一些装饰器会编译成全局函数调用，如 Reflect.metadata。通常情况下我们要污染全变量来注册。

```javascript
import { metadata } from "vue-clazz-decorator";
// BAD
Reflect.metadata = metadata;
```

但是，我更推荐用 `@rollup/plugin-inject` 以不污染全局变量的方式，将 `Reflect.metadata` / `Reflect.getMetadata` 的调用自动重定向到本库，无需修改业务代码。还能避免和别的库产生冲突。

```javascript
const inject = require("@rollup/plugin-inject");

module.exports = {
    plugins: [
        inject({
            modules: {
                'Reflect.metadata': ["vue-clazz-decorator", 'metadata'],
                'Reflect.getMetadata': ["vue-clazz-decorator", 'getMetadata'],
            },
            include: '这里可以设定生效一个范围',
        })
    ]
};
```

编译前：

```javascript
Reflect.metadata('foo', "bar");
Reflect.getMetadata('design:type', target, 'name');
```

编译后：

```javascript
import { metadata } from "vue-clazz-decorator";
metadata('foo', "bar");

import { getMetadata } from "vue-clazz-decorator";
getMetadata('design:type', target, 'name');
```

---

### 类型声明

如需 `Reflect.metadata` / `Reflect.getMetadata` 的 TypeScript 类型（不再依赖 `reflect-metadata` 包），引用本库自带类型声明即可：

```typescript
/// <reference types="vue-clazz-decorator/types/reflect" />
```

之后 IDE 即可识别 `Reflect.metadata`、`Reflect.getMetadata`、`Reflect.defineMetadata` 等全局方法。

---

### @Type 可以省略

启用了 `emitDecoratorMetadata` 后，`@Type` 装饰器可以省略——`design:type` 已经记录了运行时类型，`reactive()` 和 `hydrate()` 会自动读取它。

```typescript
@Model
class User {
    @Label("用户名")
    // 不再需要 @Type(String)
    name: string;

    @Label("年龄")
    // 不再需要 @Type(Number)
    age: number;

    @Label("部门")
    // 不再需要 @Type(Dept)
    dept: Dept;

    @Label("角色")
    // 泛型仍然需要显式标注，TypeScript 不会为泛型生成 design:type
    @Type(ArrayType(Role))
    roles: Role[];
}
```

> **注意**：`design:type` 只在有装饰器的成员上生成。如果某个字段没有任何注解，请保留 `@Type`。

---
