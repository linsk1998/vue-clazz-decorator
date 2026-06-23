# 数据模型

数据模型层提供了一套完整的对象序列化/反序列化/类型转换体系。

---

## @Model 声明一个模型

`@Model` 会自动注入 `.toJSON()` 方法，`JSON.stringify(instance)` 时按 `@JsonProperty`、`@JsonIgnore`、`@JsonExpose`、`@JsonSerialize`、`@JsonFormat` 等规则序列化。

```typescript
@Model
export class UserBo {
    @metadata('label', "用户ID")
    public id: string;

    @metadata('label', "用户名")
    public name: string;
}
```

> 未加 `@Model` 的类在 `reactive()`/`hydrate()`/`normalize()` 中会收到警告提示。

---

## reactive 创建响应式实例

将普通数据按模型规则转为**响应式**类型化实例。所有成员（无论是否有 `@State`/`@Reactive`/`@Computed` 装饰器）都会被视为响应式。

```typescript
var user = reactive({ id: "admin", name: "管理员" }, UserBo);
user.id;           // "admin"
user.id = "root";  // 视图自动更新
```

**特性：**
- 基于字段元数据自动进行类型转换（`@Type`）
- 支持反序列化钩子（`@JsonDeserialize`、`@JsonFormat` 等）
- 支持计算属性（`@Computed`）
- 所有字段默认都是响应式的
- 对已经是 `reactive` 创建的实例再次调用会直接返回原实例

**支持数组：**

```typescript
var users = reactive([{ id: "1" }, { id: "2" }], ArrayType(UserBo));
```

---

## normalize 对象规范化

将普通数据（一般是后端传来的 JSON）按模型规则**一次性**规范化。不包含响应性，后续赋值不会自动转化类型。

```typescript
var user = normalize({ id: "admin", name: "管理员" }, UserBo);
```

**特性：**
- 执行反序列化钩子（洋葱模型）
- 执行 `@Type` 类型转换
- 纯数据对象，无响应式代理开销
- 适合不依赖 Vue 响应式的场景（如 Node.js 端、Web Worker）

**与 `reactive` 的区别：**

| 特性 | `normalize` | `reactive` |
| ---- | ----------- | ---------- |
| 响应式 | 无 | 有 |
| 类型转换 | 有 | 有 |
| 计算属性 | 无 | 有 |
| 后续赋值自动转化 | 无 | 有（配合 `@Type`） |
| 适用场景 | 纯数据处理 | Vue 组件 |

**支持数组：**

```typescript
var users = normalize([{ id: "1" }, { id: "2" }], ArrayType(UserBo));
```

---

## hydrate 对象水合

将后端返回或字面量的"干瘪的"原始数据，转换成"饱满的"具有**响应式状态**、**业务逻辑**和**关联关系**的内存对象。

```typescript
var user = hydrate({ id: "admin", name: "管理员" }, UserBo);
```

**特性：**
- 执行反序列化钩子
- 执行 `@Type` 类型转换
- `@State`/`@Reactive` 字段为响应式
- `@Computed` 字段为计算属性
- 方法自动 `bind(this)`
- 后续赋值自动触发类型转换（配合 `@Type`）

**与 `reactive`/`normalize` 的区别：**

| 特性 | `normalize` | `reactive` | `hydrate` |
| ---- | ----------- | ---------- | --------- |
| 响应式 | 无 | 全部字段 | 仅标注字段 |
| 计算属性 | 无 | 有 | 有 |
| 类型转换 | 有 | 有 | 有 |
| 后续赋值自动转化 | 无 | 有 | 有 |
| 方法绑定 | 无 | 有 | 有 |

**支持数组：**

```typescript
var users = hydrate([{ id: "1" }, { id: "2" }], ArrayType(UserBo));
```

---

## @JsonProperty 指定 JSON 键名

将字段的 JSON 键名与类属性名解耦。

```typescript
@Model
export class UserBo {
    @JsonProperty("user_name")
    public name: string;
}
// JSON 中对应 "user_name"，实例中访问 .name
```

序列化时 `name` 会输出为 `user_name`，反序列化时 `user_name` 会映射到 `name`。

---

## @JsonExpose 控制序列化方向

控制字段在序列化和/或反序列化时是否参与。

```typescript
@Model
class MyClass {
    @JsonExpose()                                // 序列化和反序列化都开启（默认）
    public field1: string;

    @JsonExpose(false)                           // 仅反序列化，不生成JSON
    public field2: string;

    @JsonExpose({ serialize: false })            // 仅反序列化
    public field3: string;

    @JsonExpose({ deserialize: false })          // 仅序列化
    public field4: string;

    @JsonExpose(true, false)                     // 仅序列化（位置参数形式）
    public field5: string;
}
```

---

## @JsonIgnore 忽略属性

加在字段或 Getter/Setter 上，序列化和反序列化时都忽略该属性。

```typescript
@Model
class MyClass {
    @JsonIgnore
    public internalId: string;
}
```

---

## @JsonSerialize / @JsonDeserialize 自定义序列化逻辑

为字段注册自定义的序列化/反序列化函数，多个函数采用**洋葱模型**叠加执行。

```typescript
@Model
class MyClass {
    @JsonSerialize((value, metadata, next) => {
        return next(value.toUpperCase());
    })
    @JsonDeserialize((value, metadata, next) => {
        return next(value.trim());
    })
    public name: string;
}
```

**洋葱模型执行流程：**

```
输入 → fn3 → fn2 → fn1 → next(原始值) → fn1返回 → fn2返回 → fn3返回 → 输出
```

- `value`：当前值
- `metadata`：字段的元数据配置
- `next`：调用下一个处理函数，传入处理后的值

---

## @JsonFormat 日期格式化

自动注册序列化与反序列化钩子，处理 `Date` 与格式化字符串/时间戳之间的互转。

### 日期字符串模式

```typescript
@Model
class MyClass {
    @JsonFormat("yyyy-MM-dd HH:mm:ss")                    // Date ↔ "2023-06-15 15:30:45"
    public createdAt: Date;

    @JsonFormat("yyyy-MM-dd HH:mm:ss", +8)                // 东八区
    public updatedAt: Date;

    @JsonFormat({ pattern: "yyyy-MM-dd HH:mm:ss" })        // 省略时区 → 本地时间
    public openedAt: Date;

    @JsonFormat({ pattern: "yyyy-MM-dd HH:mm:ss", timezone: +8 })  // 指定时区偏移
    public closedAt: Date;
}
```

序列化时 `Date` 转为格式化的日期字符串，反序列化时将符合格式的字符串解析为 `Date`。不匹配格式的字符串解析后为无效 `Date`。

> 这里的 pattern 是 [SimpleDateFormat](https://www.npmjs.com/package/java.text.simple-date-format) 的格式。如果没有使用 JsonFormat 不会额外引入日期解析库。

### 时间戳模式

```typescript
@Model
class MyClass {
    @JsonFormat(Number)                  // Date ↔ 毫秒时间戳
    public timestamp: Date;

    @JsonFormat({ shape: Number })       // 对象形式
    public timestamp2: Date;
}
```

序列化时 `Date` 转为时间戳数字，反序列化时将数字转为 `Date`。

> JsonFormat 是序列化与反序列化用的。不是时间展示用的注解。

---

## @From 复用字段配置

引用另一个 Model 的某个字段的元数据配置。`@From` 先提供基础元数据，后续装饰器可覆盖。

```typescript
@Model
export class Dept {
    @metadata('label', "部门ID")
    public id: string;

    @metadata('label', "部门名称")
    public name: string;
}

@Model
export class User {
    @metadata('label', "用户ID")
    public id: string;

    @metadata('label', "用户名")
    public name: string;

    @From(Dept, 'id')
    public deptId: string;           // 复用 Dept.id 的元数据（label: "部门ID"）

    @From(Dept, 'name')
    public deptName: string;         // 复用 Dept.name 的元数据（label: "部门名称"）

    @From(Dept, 'id')
    @metadata('label', "自定义标签")  // 覆盖 From 提供的 label
    public customDeptId: string;
}
```

> `@From` 会沿原型链向上查找源类的字段元数据，子类中已有的 key 不会被覆盖。

---

## @Type 指定字段类型

声明嵌套对象或数组的元素类型。`@Type` 在 `normalize`/`reactive`/`hydrate` 反序列化和字段赋值时都生效，自动将普通数据转为类型化实例。

```typescript
@Model
export class Dept {
    @metadata('label', "部门ID")
    public deptId: string;

    @metadata('label', "部门名称")
    public deptName: string;
}

@Model
export class Role {
    @metadata('label', "角色ID")
    public roleId: string;

    @metadata('label', "角色名称")
    public roleName: string;
}

@Model
export class User {
    @metadata('label', "用户ID")
    public id: string;

    @metadata('label', "用户名")
    public name: string;

    @metadata('label', "部门")
    @Type(Dept)
    public dept: Dept;               // 赋值时自动转为 Dept 实例

    @metadata('label', "角色")
    @Type(ArrayType(Role))
    public roles: Role[];            // 每个元素自动转为 Role 实例
}
```

```typescript
var user = normalize({ dept: { deptId: "d1", deptName: "技术部" } }, User);
user.dept instanceof Dept;  // true

user.roles = [{ roleId: "r1", roleName: "管理员" }];
user.roles.at(0) instanceof Role;  // true
```

---

## ArrayType / ReactiveArrayType

### ArrayType

创建类型化数组类，用于 `@Type` 标注数组字段的元素类型。

```typescript
@Model
class MyClass {
    @Type(ArrayType(Role))
    public roles: Role[];
}
```

### ReactiveArrayType

创建深层响应式数组类型，与 `ArrayType` 类似，但数组元素的操作是带有响应性的。

```typescript
@Model
class MyClass {
    @Type(ReactiveArrayType(Role))
    public roles: Role[];
}
```

---

## 完整示例

```typescript
import {
    Model, metadata, Type, ArrayType,
    JsonProperty, JsonIgnore, JsonFormat,
    JsonSerialize, JsonDeserialize, JsonExpose,
    reactive, normalize, hydrate, From
} from 'vue-clazz-decorator';

@Model
export class Dept {
    @metadata('label', "部门ID")
    public deptId: string;

    @metadata('label', "部门名称")
    public deptName: string;
}

@Model
export class Role {
    @metadata('label', "角色ID")
    public roleId: string;

    @metadata('label', "角色名称")
    @JsonIgnore
    public roleName: string;
}

@Model
export class User {
    @metadata('label', "用户ID")
    @JsonProperty("user_id")
    public id: string;

    @metadata('label', "用户名")
    @JsonSerialize((v, _, next) => next(v?.trim()))
    @JsonDeserialize((v, _, next) => next(v?.trim()))
    public name: string;

    @metadata('label', "创建时间")
    @JsonFormat("yyyy-MM-dd HH:mm:ss", +8)
    public createdAt: Date;

    @metadata('label', "部门")
    @Type(Dept)
    public dept: Dept;

    @metadata('label', "角色列表")
    @Type(ArrayType(Role))
    public roles: Role[];

    @JsonExpose({ serialize: false })
    public password: string;
}

// 使用 normalize（无响应式）
const user = normalize({
    user_id: "u1",
    name: "  Admin  ",
    createdAt: "2024-01-15 10:30:00",
    dept: { deptId: "d1", deptName: "技术部" },
    roles: [{ roleId: "r1", roleName: "管理员" }],
    password: "secret"
}, User);

user.id;              // "u1"
user.name;            // "Admin"（经过 trim）
user.createdAt;       // Date 对象
user.dept;            // Dept 实例
user.roles[0];        // Role 实例

// 序列化（password 不参与，roleName 被忽略）
JSON.stringify(user);
// {"user_id":"u1","name":"Admin","createdAt":"2024-01-15 10:30:00","dept":{...},"roles":[{"roleId":"r1"}]}
```
