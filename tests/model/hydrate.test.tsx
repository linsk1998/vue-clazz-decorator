import { ArrayType } from '@/model/ArrayType';
import { hydrate } from '@/model/hydrate';
import { Model } from '@/model/Model';
import { Type } from '@/model/Type';
import { ACCESSOR_MAP } from '@/vue/ACCESSOR_MAP';
import { Computed } from '@/vue/Computed';
import { Reactive } from '@/vue/Reactive';
import { State } from '@/vue/State';
import { describe, expect, it } from 'vitest';

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

	it('hydrate with @Reactive initial value converts to model instance', () => {
		@Model
		class Dept {
			public deptId: string;
			public deptName: string;
		}

		@Model
		class User {
			public id: string;

			@Reactive(Dept)
			public dept: Dept = { deptId: '123', deptName: '初始部门' };
		}

		var user = hydrate({ id: "u1" }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe("123");
		expect(user.dept.deptName).toBe("初始部门");
	});
});
