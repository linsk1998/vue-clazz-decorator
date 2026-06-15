import { fieldWeakMap } from '@/metadata/defineFieldMetadata';
import { metadata } from '@/metadata/metadata';
import { ArrayType } from '@/model/ArrayType';
import { From } from '@/model/From';
import { hydrate } from '@/model/hydrate';
import { JsonDeserialize, JsonExpose, JsonIgnore, JsonProperty, JsonSerialize } from '@/model/Json';
import { Model } from '@/model/Model';
import { normalize } from '@/model/normalize';
import { reactive } from '@/model/reactive';
import { Type } from '@/model/Type';
import { ACCESSOR_MAP } from '@/vue/ACCESSOR_MAP';
import { Computed } from '@/vue/Computed';
import { State } from '@/vue/State';
import { describe, expect, it } from 'vitest';

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

	it('normalize with primitive types', () => {
		@Model
		class Bo {
			public num: number;
			public str: string;
			public bool: boolean;
		}
		var bo = normalize({ num: 42, str: "hello", bool: true }, Bo);
		expect(bo instanceof Bo).toBe(true);
		expect(bo.num).toBe(42);
		expect(bo.str).toBe("hello");
		expect(bo.bool).toBe(true);
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

describe('hydrate', () => {
	it('creates instance with @State (shallowRef)', () => {
		@Model
		class UserBo {
			@State
			public name: string;

			@State
			public id: string;
		}

		var user = hydrate({ id: "admin", name: "管理员" }, UserBo);
		expect(user instanceof UserBo).toBe(true);
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");

		// @State 字段内部使用 shallowRef
		var accessors = ACCESSOR_MAP.get(user);
		expect(accessors).toBeDefined();
		expect(accessors.name).toBeDefined();
		expect(typeof accessors.name.get).toBe('function');
		expect(typeof accessors.name.set).toBe('function');
	});

	it('hydrate with @Computed', () => {
		@Model
		class UserBo {
			@State
			public firstName: string;

			@State
			public lastName: string;

			@Computed
			get fullName() {
				return this.firstName + ' ' + this.lastName;
			}
		}

		var user = hydrate({ firstName: "张", lastName: "三" }, UserBo);
		expect(user.fullName).toBe("张 三");

		user.firstName = "李";
		expect(user.fullName).toBe("李 三");
	});

	it('hydrate with @Type nested object', () => {
		@Model
		class Dept {
			@State
			public deptId: string;

			@State
			public deptName: string;
		}

		@Model
		class User {
			@State
			public id: string;

			@State
			@Type(Dept)
			public dept: Dept;
		}

		var user = hydrate({ id: "u1", dept: { deptId: "d1", deptName: "技术部" } }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("d1");
		expect(user.dept.deptName).toBe("技术部");
	});

	it('hydrate with @Type ArrayType', () => {
		@Model
		class Role {
			public roleId: string;
			public roleName: string;
		}

		@Model
		class User {
			public id: string;

			@State
			@Type(ArrayType(Role))
			public roles: Role[];
		}

		var user = hydrate({ id: "u1", roles: [{ roleId: "r1", roleName: "管理员" }] }, User);
		expect(user.roles.length).toBe(1);
		expect(user.roles[0] instanceof Role).toBe(true);
		expect(user.roles[0].roleId).toBe("r1");
	});

	it('hydrate with null', () => {
		@Model
		class UserBo {
			public id: string;
		}
		expect(hydrate(null, UserBo)).toBeNull();
		expect(hydrate(undefined, UserBo)).toBeUndefined();
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
		expect(user instanceof UserBo).toBe(true);
		expect(user.id).toBe("admin");
		expect(user.name).toBe("管理员");
	});

	it('reactive makes all fields reactive via accessors', () => {
		@Model
		class UserBo {
			public id: string;
			public name: string;
		}
		var user = reactive({ id: "admin", name: "管理员" }, UserBo);
		// reactive 为所有字段创建 accessor
		var accessors = ACCESSOR_MAP.get(user);
		expect(accessors).toBeDefined();
		expect(accessors.name).toBeDefined();
		expect(accessors.id).toBeDefined();
	});

	it('reactive with @Type nested object', () => {
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

		var user = reactive({ id: "u1", dept: { deptId: "d1", deptName: "技术部" } }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("d1");
	});

	it('reactive with @Type ArrayType', () => {
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

		var user = reactive({ id: "u1", roles: [{ roleId: "r1", roleName: "管理员" }] }, User);
		expect(user.roles.length).toBe(1);
		expect(user.roles[0] instanceof Role).toBe(true);
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

	it('round-trip with manual construction', () => {
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
		expect(json.user_name).toBe("管理员");
		expect(json.name).toBeUndefined();
	});
});

describe('@JsonExpose', () => {
	it('serialize false - excluded from toJSON', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonExpose(false)
			public password: string;
		}
		var user = new UserBo();
		user.id = "admin";
		user.password = "secret";
		var json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin" });
		expect(json.password).toBeUndefined();
	});

	it('object form serialize false - excluded from toJSON', () => {
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
	});
});

describe('@JsonIgnore', () => {
	it('ignored in toJSON', () => {
		@Model
		class UserBo {
			public id: string;

			@JsonIgnore
			public internalId: string;
		}
		var user = new UserBo();
		user.id = "admin";
		user.internalId = "internal";
		var json = (user as any).toJSON();
		expect(json).toEqual({ id: "admin" });
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
		let meta = (User as any)[Symbol.metadata];
		let fm = fieldWeakMap.get(meta);
		expect(fm).toBeDefined();
		expect(fm.deptId.label).toBe("部门ID");
		expect(fm.deptName.label).toBe("部门名称");
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

		let meta = (User as any)[Symbol.metadata];
		let fm = fieldWeakMap.get(meta);
		expect(fm).toBeDefined();
		expect(fm.deptId.label).toBe("自定义标签");
	});
});

describe('@Type field assignment', () => {
	it('normalize converts nested types', () => {
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

		var user = normalize({ id: "u1", dept: { deptId: "d1", deptName: "技术部" } }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("d1");
		expect(user.dept.deptName).toBe("技术部");
	});

	it('normalize converts array elements', () => {
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

		var user = normalize({ id: "u1", roles: [{ roleId: "r1", roleName: "管理员" }] }, User);
		expect(user.roles[0] instanceof Role).toBe(true);
		expect(user.roles[0].roleId).toBe("r1");
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
			name: "管理员",
			dept: { deptId: "d1", deptName: "技术部" },
			roles: [{ roleId: "r1", roleName: "管理员" }]
		}, User);

		expect(user instanceof User).toBe(true);
		expect(user.name).toBe("管理员");
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.roles[0] instanceof Role).toBe(true);

		// toJSON
		var json = (user as any).toJSON();
		expect(json.name).toBe("管理员");
		expect(json.password).toBeUndefined(); // JsonIgnore
		expect(json.id).toBe("u1");
	});

	it('toJSON with JsonProperty and JsonSerialize', () => {
		@Model
		class UserBo {
			@JsonProperty("user_name")
			public name: string;

			@JsonSerialize((v, m, next) => next(v.toUpperCase()))
			public title: string;

			@JsonIgnore
			public secret: string;

			public id: string;
		}

		var user = new UserBo();
		user.id = "u1";
		user.name = "管理员";
		user.title = "admin";
		user.secret = "hidden";

		var json = (user as any).toJSON();
		expect(json.user_name).toBe("管理员");
		expect(json.title).toBe("ADMIN");
		expect(json.secret).toBeUndefined();
		expect(json.id).toBe("u1");
	});

	it('hydrate with @State and @Type', () => {
		@Model
		class Dept {
			public deptId: string;
			public deptName: string;
		}

		@Model
		class User {
			@State
			public id: string;

			@State
			@Type(Dept)
			public dept: Dept;
		}

		var user = hydrate({ id: "u1", dept: { deptId: "d1", deptName: "技术部" } }, User);
		expect(user.id).toBe("u1");
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("d1");

		// @State 字段使用 shallowRef
		var accessors = ACCESSOR_MAP.get(user);
		expect(accessors.id).toBeDefined();
		expect(accessors.dept).toBeDefined();
	});
});
