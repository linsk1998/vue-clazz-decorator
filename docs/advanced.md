# 进阶用法

本章涵盖构建方式等进阶用法。

---

## emitDecoratorMetadata 类型元数据

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

### 配置

**TypeScript 原生：**

```javascript
typescript({
    compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        useDefineForClassFields: false,
    }
})
```

**Babel：**

```javascript
babel({
    plugins: [
        "babel-plugin-transform-typescript-metadata",
        ["babel-plugin-transform-typescript-decorators", {
            experimentalDecorators: true,
        }],
        "@babel/plugin-transform-typescript",
    ],
})
```

---

## @Type 可以省略

启用了 `emitDecoratorMetadata` 后，`@Type` 装饰器可以省略——`design:type` 已经记录了运行时类型，`reactive()` 和 `hydrate()` 会自动读取它。

```typescript
@Model
class User {
    // 不再需要 @Type(String)
    name: string;

    // 不再需要 @Type(Number)
    age: number;

    // 不再需要 @Type(Dept)
    dept: Dept;

    // 泛型仍然需要显式标注，TypeScript 不会为泛型生成 design:type
    @Type(ArrayType(Role))
    roles: Role[];
}
```

> **注意**：`design:type` 只在有装饰器的成员上生成。如果某个字段没有任何注解，请保留 `@Type`。

---

## reflect-metadata 代码迁移

通过 `@rollup/plugin-inject` 将 `Reflect.metadata` / `Reflect.getMetadata` 的调用自动重定向到本库，无需修改业务代码。

```javascript
const inject = require("@rollup/plugin-inject");

module.exports = {
    plugins: [
        inject({
            modules: {
                'Reflect.metadata': ["vue-clazz-decorator", 'metadata'],
                'Reflect.getMetadata': ["vue-clazz-decorator", 'getMetadata'],
            }
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

## 类型声明

如需 `Reflect.metadata` / `Reflect.getMetadata` 的 TypeScript 类型（不再依赖 `reflect-metadata` 包），引用本库自带类型声明即可：

```typescript
/// <reference types="vue-clazz-decorator/types/reflect" />
```

之后 IDE 即可识别 `Reflect.metadata`、`Reflect.getMetadata`、`Reflect.defineMetadata` 等全局方法。

---

## reactive / normalize / hydrate 选择指南

三种实例化方式各有适用场景：

| 场景 | 推荐 | 原因 |
| ---- | ---- | ---- |
| ViewModel 中使用 | `use()` | 自动集成 Vue 组件生命周期 |
| 需要 Vue 响应式的独立模型 | `reactive()` | 所有字段都是响应式的 |
| 需要部分响应式的复杂模型 | `hydrate()` | 仅标注字段响应式，性能更优 |
| 不需要响应式（工具端/Worker） | `normalize()` | 零响应式开销 |
| 快速类型转换 | `normalize()` | 一次性处理，结果为纯对象 |

---

## 自定义装饰器

利用 `metadata()` 装饰器工厂，可以轻松创建自定义装饰器：

```tsx
import { metadata, getFieldMetadataValues, ViewModel, State, createComponent } from 'vue-clazz-decorator';

// 创建自定义装饰器
const Label = (text: string) => metadata('label', text);
const Required = metadata('required', true);
const Readonly = metadata('readonly', true);

@ViewModel
class FormViewModel {
    @Label('用户名')
    @Required
    @State
    public username = '';

    @Label('备注')
    @Readonly
    @State
    public remark = '';
}

// 运行时读取元数据，生成表单
function FormView(props: FormViewModel) {
    const meta = getFieldMetadataValues(FormViewModel);
    return <form>
        {Object.entries(meta).map(([key, config]) => (
            <div key={key}>
                <label>{config.label}</label>
                <input
                    value={props[key]}
                    onInput={(e) => { props[key] = e.target.value; }}
                    required={!!config.required}
                    readOnly={!!config.readonly}
                />
            </div>
        ))}
    </form>;
}
```

这种模式非常适合构建低代码平台、动态表单等场景。
