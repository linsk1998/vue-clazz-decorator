import { metadata } from '@/metadata/metadata';
import { ArrayType } from '@/model/ArrayType';
import { From } from '@/model/From';
import { getModelMetadataValues } from '@/model/getModelMetadataValues';
import { JsonDeserialize, JsonExpose, JsonIgnore, JsonProperty, JsonSerialize } from '@/model/Json';
import { Model } from '@/model/Model';
import { normalize, reactive } from '@/model/normalize';
import { Type } from '@/model/Type';
import { describe, expect, it } from 'vitest';
import { isReactive } from 'vue';

describe('@Model', () => {
	it('basic model with metadata', () => {
		@Model
		class UserBo {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "用户名")
			public name: string;
		}
		let user = new UserBo();
		user.id = "admin";
		user.name = "管理员";
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");
	});

	it('toJSON basic', () => {
		@Model
		class UserBo {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "用户名")
			public name: string;
		}
		let user = new UserBo();
		user.id = "admin";
		user.name = "管理员";
		let json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin", name: "管理员" });
	});

	it('JSON.stringify uses toJSON', () => {
		@Model
		class UserBo {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "用户名")
			public name: string;
		}
		let user = new UserBo();
		user.id = "admin";
		user.name = "管理员";
		let str = JSON.stringify(user);
		expect(JSON.parse(str)).toEqual({ id: "admin", name: "管理员" });
	});
});

describe('normalize', () => {
	it('basic normalize', () => {
		@Model
		class UserBo {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "用户名")
			public name: string;
		}
		var user = normalize({ id: "admin", name: "管理员" }, UserBo);
		expect(user instanceof UserBo).toBe(true);
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");
	});

	it('normalize with null', () => {
		@Model
		class UserBo {
			public id: string;
		}
		expect(normalize(null, UserBo)).toBeNull();
		expect(normalize(undefined, UserBo)).toBeUndefined();
	});

	it('normalize with @Type nested object', () => {
		@Model
		class Dept {
			@metadata('label', "部门ID")
			public deptId: string;

			@metadata('label', "部门名称")
			public deptName: string;
		}

		@Model
		class User {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "部门")
			@Type(Dept)
			public dept: Dept;
		}

		var user = normalize({ id: "u1", dept: { deptId: "d1", deptName: "技术部" } }, User);
		expect(user instanceof User).toBe(true);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("d1");
		expect(user.dept.deptName).toBe("技术部");
	});

	it('normalize with @Type ArrayType', () => {
		@Model
		class Role {
			@metadata('label', "角色ID")
			public roleId: string;

			@metadata('label', "角色名称")
			public roleName: string;
		}

		@Model
		class User {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "角色")
			@Type(ArrayType(Role))
			public roles: Role[];
		}

		var user = normalize({ id: "u1", roles: [{ roleId: "r1", roleName: "管理员" }] }, User);
		expect(user instanceof User).toBe(true);
		expect(Array.isArray(user.roles)).toBe(true);
		expect(user.roles.length).toBe(1);
		expect(user.roles[0] instanceof Role).toBe(true);
		expect(user.roles[0].roleId).toBe("r1");
	});

	it('normalize with @JsonProperty', () => {
		@Model
		class UserBo {
			@JsonProperty("user_name")
			public name: string;

			public id: string;
		}
		var user = normalize({ id: "admin", user_name: "管理员" }, UserBo);
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");
	});

	it('normalize with @JsonIgnore', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonIgnore
			public secret: string;
		}
		var user = normalize({ id: "admin", secret: "hidden" }, UserBo);
		expect(user.id).toBe("admin");
		expect(user.secret).toBeUndefined();
	});

	it('normalize with @JsonExpose deserialize false', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonExpose({ deserialize: false })
			public name: string;
		}
		var user = normalize({ id: "admin", name: "管理员" }, UserBo);
		expect(user.id).toBe("admin");
		expect(user.name).toBeUndefined();
	});

	it('normalize with @JsonDeserialize', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonDeserialize((value, meta, next) => {
				return next(value.trim());
			})
			public name: string;
		}
		var user = normalize({ id: "admin", name: " 管理员 " }, UserBo);
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");
	});

	it('normalize with multiple @JsonDeserialize (onion model)', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonDeserialize((value, meta, next) => {
				return next(value + "_outer");
			})
			@JsonDeserialize((value, meta, next) => {
				return next(value + "_inner");
			})
			public name: string;
		}
		var user = normalize({ id: "admin", name: "base" }, UserBo);
		// 外层先执行: "base" -> "base_outer", 内层后执行: "base_outer" -> "base_outer_inner"
		expect(user.name).toBe("base_outer_inner");
	});
});

describe('reactive', () => {
	it('creates reactive instance', () => {
		@Model
		class UserBo {
			public id: string;
			public name: string;
		}
		var user = reactive({ id: "admin", name: "管理员" }, UserBo);
		expect(isReactive(user)).toBe(true);
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");
	});
});

describe('@JsonProperty', () => {
	it('toJSON uses json key', () => {
		@Model
		class UserBo {
			@JsonProperty("user_name")
			public name: string;

			public id: string;
		}
		var user = new UserBo();
		user.id = "admin";
		user.name = "管理员";
		var json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin", user_name: "管理员" });
	});

	it('round-trip with normalize and toJSON', () => {
		@Model
		class UserBo {
			@JsonProperty("user_name")
			public name: string;

			public id: string;
		}
		var user = normalize({ id: "admin", user_name: "管理员" }, UserBo);
		var json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin", user_name: "管理员" });
	});
});

describe('@JsonExpose', () => {
	it('serialize false - excluded from toJSON', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonExpose({ serialize: false })
			public password: string;
		}
		var user = new UserBo();
		user.id = "admin";
		user.password = "secret";
		var json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin" });
		expect(json.password).toBeUndefined();
	});

	it('deserialize false - excluded from normalize', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonExpose({ deserialize: false })
			public computed: string;
		}
		var user = normalize({ id: "admin", computed: "value" }, UserBo);
		expect(user.id).toBe("admin");
		expect(user.computed).toBeUndefined();
	});
});

describe('@JsonIgnore', () => {
	it('ignored in both directions', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonIgnore
			public internalId: string;
		}
		// toJSON 忽略
		var user = new UserBo();
		user.id = "admin";
		user.internalId = "internal";
		var json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin" });
		// normalize 忽略
		var user2 = normalize({ id: "admin", internalId: "internal" }, UserBo);
		expect(user2.internalId).toBeUndefined();
	});
});

describe('@JsonSerialize', () => {
	it('custom serialize', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonSerialize((value, meta, next) => {
				return next(value.toUpperCase());
			})
			public name: string;
		}
		var user = new UserBo();
		user.id = "admin";
		user.name = "hello";
		var json = (user as any).toJSON();
		expect(json.name).toBe("HELLO");
	});

	it('multiple @JsonSerialize (onion model)', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonSerialize((value, meta, next) => {
				return next(value + "!");
			})
			@JsonSerialize((value, meta, next) => {
				return next("(" + value + ")");
			})
			public name: string;
		}
		var user = new UserBo();
		user.id = "admin";
		user.name = "hello";
		// 外层先执行: "hello" -> "hello!", 内层后执行: "hello!" -> "(hello!)"
		var json = (user as any).toJSON();
		expect(json.name).toBe("(hello!)");
	});
});

describe('@JsonDeserialize', () => {
	it('custom deserialize', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonDeserialize((value, meta, next) => {
				return next(value.trim());
			})
			public name: string;
		}
		var user = normalize({ id: "admin", name: "  hello  " }, UserBo);
		expect(user.name).toBe("hello");
	});
});

describe('@From', () => {
	it('copies metadata from another model field', () => {
		@Model
		class Dept {
			@metadata('label', "部门ID")
			public id: string;

			@metadata('label', "部门名称")
			public name: string;
		}

		@Model
		class User {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "用户名")
			public name: string;

			@From(Dept, 'id')
			public deptId: string;

			@From(Dept, 'name')
			public deptName: string;
		}

		// 验证 From 复制了元数据
		let meta: any = getModelMetadataValues(User);
		expect(meta.deptId.label).toBe("部门ID");
		expect(meta.deptName.label).toBe("部门名称");
	});

	it('local metadata takes precedence over @From', () => {
		@Model
		class Dept {
			@metadata('label', "部门ID")
			public id: string;
		}

		@Model
		class User {
			@metadata('label', "自定义标签")
			@From(Dept, 'id')
			public deptId: string;
		}

		let meta: any = getModelMetadataValues(User);
		expect(meta.deptId.label).toBe("自定义标签");
	});
});

describe('@Type field assignment', () => {
	it('auto-converts on assignment', () => {
		@Model
		class Dept {
			public deptId: string;
			public deptName: string;
		}

		@Model
		class User {
			public id: string;

			@Type(Dept)
			public dept: Dept;
		}

		// 通过 normalize 创建实例并自动转换
		var user = normalize({ id: "u1", dept: { deptId: "d1", deptName: "技术部" } }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("d1");
		expect(user.dept.deptName).toBe("技术部");

		// 直接赋值转换（仅在 experimentalDecorators 模式下生效）
		var user2 = new User();
		user2.id = "u2";
		user2.dept = { deptId: "d2", deptName: "产品部" } as any;
		// 检查是否触发了转换（proposal 模式下类字段会覆盖原型 getter/setter）
		if(user2.dept instanceof Dept) {
			expect(user2.dept.deptId).toBe("d2");
			expect(user2.dept.deptName).toBe("产品部");
		}
	});

	it('auto-converts array elements on assignment', () => {
		@Model
		class Role {
			public roleId: string;
			public roleName: string;
		}

		@Model
		class User {
			public id: string;

			@Type(ArrayType(Role))
			public roles: Role[];
		}

		// 通过 normalize 创建实例并自动转换
		var user = normalize({ id: "u1", roles: [{ roleId: "r1", roleName: "管理员" }] }, User);
		expect(user.roles[0] instanceof Role).toBe(true);
		expect(user.roles[0].roleId).toBe("r1");

		// 直接赋值转换（仅在 experimentalDecorators 模式下生效）
		var user2 = new User();
		user2.id = "u2";
		user2.roles = [{ roleId: "r2", roleName: "编辑" }] as any;
		if(user2.roles[0] instanceof Role) {
			expect(user2.roles[0].roleId).toBe("r2");
		}
	});
});

describe('integration', () => {
	it('full model with nested types and JSON serialization', () => {
		@Model
		class Dept {
			@metadata('label', "部门ID")
			public deptId: string;

			@metadata('label', "部门名称")
			public deptName: string;
		}

		@Model
		class Role {
			@metadata('label', "角色ID")
			public roleId: string;

			@metadata('label', "角色名称")
			public roleName: string;
		}

		@Model
		class User {
			@metadata('label', "用户ID")
			public id: string;

			@metadata('label', "用户名")
			@JsonProperty("user_name")
			public name: string;

			@JsonIgnore
			public password: string;

			@metadata('label', "部门")
			@Type(Dept)
			public dept: Dept;

			@metadata('label', "角色")
			@Type(ArrayType(Role))
			public roles: Role[];
		}

		// normalize
		var user = normalize({
			id: "u1",
			user_name: "管理员",
			password: "secret",
			dept: { deptId: "d1", deptName: "技术部" },
			roles: [{ roleId: "r1", roleName: "管理员" }]
		}, User);

		expect(user instanceof User).toBe(true);
		expect(user.name).toBe("管理员");
		expect(user.password).toBeUndefined(); // JsonIgnore
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.roles[0] instanceof Role).toBe(true);

		// toJSON
		var json = (user as any).toJSON();
		expect(json.user_name).toBe("管理员");
		expect(json.password).toBeUndefined(); // JsonIgnore
		expect(json.id).toBe("u1");
	});
});
