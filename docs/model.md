# 数据模型

## @Model 声明一个模型

`@Model` 会自动注入 `.toJSON()` 方法，`JSON.stringify(instance)` 时按 `@JsonProperty`、`@JsonIgnore`、`@JsonSerialize` 等规则序列化。

```typescript
@Model
export class UserBo {
    @metadata('label', "用户ID")
    public id: string;

    @metadata('label', "用户名")
    public name: string;
}
```

## normalize 对象规范化

将普通数据（一般是后端传来的JSON）按模型规则转为类型化实例。

```typescript
var user = normalize({ id: "admin", name: "管理员" }, UserBo);
```

## reactive 创建响应式实例

将普通数据按模型规则转为响应式类型化实例。

```typescript
var user = reactive({ id: "admin", name: "管理员" }, UserBo);
```

## @JsonProperty 指定 JSON 键名

```typescript
@Model
export class UserBo {
    @JsonProperty("user_name")
    public name: string;
}
// JSON 中对应 "user_name"，实例中访问 .name
```

## @JsonExpose 控制序列化方向

```typescript
@JsonExpose()                                // 序列化和反序列化都开启（默认）
@JsonExpose({ serialize: false })            // 仅反序列化
@JsonExpose({ deserialize: false })          // 仅序列化
```

## @JsonIgnore 忽略属性

加在字段或 Getter/Setter 上，序列化和反序列化时都忽略该属性。

```typescript
@JsonIgnore
public internalId: string;
```

## @JsonSerialize / @JsonDeserialize 自定义序列化逻辑

```typescript
@JsonSerialize((value, metadata, next) => {
    return next(value.toUpperCase());
})
public name: string;

@JsonDeserialize((value, metadata, next) => {
    return next(value.trim());
})
public name: string;
```

多个自定义函数采用洋葱模型叠加执行。

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
    public deptId: string;           // 继承 Dept.id 的元数据（label: "部门ID"）

    @From(Dept, 'name')
    public deptName: string;         // 继承 Dept.name 的元数据（label: "部门名称"）
}
```

## @Type 指定字段类型

声明嵌套对象或数组的元素类型。`@Type` 在 `normalize`/`reactive` 反序列化和字段赋值时都生效，自动将普通数据转为类型化实例。

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
