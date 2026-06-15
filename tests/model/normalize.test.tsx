import { metadata } from '@/metadata/metadata';
import { ArrayType } from '@/model/ArrayType';
import { JsonDeserialize } from '@/model/Json';
import { Model } from '@/model/Model';
import { normalize } from '@/model/normalize';
import { Type } from '@/model/Type';
import { describe, expect, it } from 'vitest';

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
		expect(Array.isArray(user.roles)).toBe(true);
		expect(user.roles.length).toBe(1);
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
