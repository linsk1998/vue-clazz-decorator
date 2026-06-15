import { ArrayType } from '@/model/ArrayType';
import { Model } from '@/model/Model';
import { reactive } from '@/model/reactive';
import { Type } from '@/model/Type';
import { ACCESSOR_MAP } from '@/vue/ACCESSOR_MAP';
import { describe, expect, it } from 'vitest';

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
			public id: string = undefined;
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
