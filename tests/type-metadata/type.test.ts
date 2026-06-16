import { ArrayType } from '@/model/ArrayType';
import { hydrate } from '@/model/hydrate';
import { Model } from '@/model/Model';
import { reactive } from '@/model/reactive';
import { Type } from '@/model/Type';
import { describe, expect, it } from 'vitest';

var mark = Reflect.metadata('mark', true);

describe('emitDecoratorMetadata + @Type', () => {
	it('@Type 字段同时存在 design:type 和 type 元数据', () => {
		@Model
		class Dept {
			@mark
			public deptId: string;
			public deptName: string;
		}

		@Model
		class User {
			@mark
			@Type(Dept)
			public dept: Dept;
		}

		// @Type 写入的 type 元数据
		expect(Reflect.getOwnMetadata('type', User.prototype, 'dept')).toBe(Dept);
		// emitDecoratorMetadata 自动写入的 design:type 元数据
		expect(Reflect.getOwnMetadata('design:type', User.prototype, 'dept')).toBe(Dept);
	});

	it('reactive 通过 @Type 正确实例化嵌套对象', () => {
		@Model
		class Dept {
			@mark
			public deptId: string;
			public deptName: string;
		}

		@Model
		class User {
			@mark
			@Type(Dept)
			public dept: Dept;
		}

		const user = reactive({ dept: { deptId: 'd1', deptName: '技术部' } }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe('d1');
		expect(user.dept.deptName).toBe('技术部');
	});

	it('hydrate 通过 @Type 正确实例化嵌套对象', () => {
		@Model
		class Dept {
			@mark
			public deptId: string;
			public deptName: string;
		}

		@Model
		class User {
			@mark
			@Type(Dept)
			public dept: Dept;
		}

		const user = hydrate({ dept: { deptId: 'd1', deptName: '技术部' } }, User);
		expect(user.dept instanceof Dept).toBe(true);
		expect(user.dept.deptId).toBe('d1');
		expect(user.dept.deptName).toBe('技术部');
	});

	it('@Type 和 design:type 指向同一个类', () => {
		@Model
		class Role {
			@mark
			public roleId: string;
			public roleName: string;
		}

		@Model
		class User {
			@mark
			@Type(Role)
			public role: Role;
		}

		expect(Reflect.getOwnMetadata('type', User.prototype, 'role')).toBe(Role);
		expect(Reflect.getOwnMetadata('design:type', User.prototype, 'role')).toBe(Role);
		// 两个元数据应该相同
		expect(Reflect.getOwnMetadata('type', User.prototype, 'role'))
			.toBe(Reflect.getOwnMetadata('design:type', User.prototype, 'role'));
	});

	it('泛型数组 @Type(ArrayType(...)) 仍然需要显式标注', () => {
		@Model
		class Role {
			@mark
			public roleId: string;
			public roleName: string;
		}

		@Model
		class User {
			@mark
			@Type(ArrayType(Role))
			public roles: Role[];
		}

		// 对于泛型，TypeScript 不会生成正确的 design:type
		// design:type 会是 Array，而不是具体的 Role[]
		const designType = Reflect.getOwnMetadata('design:type', User.prototype, 'roles');
		expect(designType).toBe(Array);

		// @Type 写入的才是正确的
		const typeMeta = Reflect.getOwnMetadata('type', User.prototype, 'roles');
		expect(typeMeta).not.toBe(Array);

		// reactive 能正确工作
		const user = reactive({ roles: [{ roleId: 'r1', roleName: '管理员' }] }, User);
		expect(user.roles.length).toBe(1);
		expect(user.roles[0] instanceof Role).toBe(true);
	});

	it('多个 @Type 字段共存，design:type 互不干扰', () => {
		@Model
		class Dept {
			@mark
			public deptId: string;
		}

		@Model
		class Role {
			@mark
			public roleName: string;
		}

		@Model
		class User {
			@mark
			@Type(Dept)
			public dept: Dept;

			@mark
			@Type(Role)
			public role: Role;
		}

		expect(Reflect.getOwnMetadata('design:type', User.prototype, 'dept')).toBe(Dept);
		expect(Reflect.getOwnMetadata('design:type', User.prototype, 'role')).toBe(Role);
		expect(Reflect.getOwnMetadata('type', User.prototype, 'dept')).toBe(Dept);
		expect(Reflect.getOwnMetadata('type', User.prototype, 'role')).toBe(Role);
	});

	it('无装饰器的字段不生成 design:type', () => {
		@Model
		class User {
			@mark
			@Type(String)
			public name: string;

			// 没有装饰器，不会生成 design:type
			public age: number;
		}

		expect(Reflect.getOwnMetadata('design:type', User.prototype, 'name')).toBe(String);
		expect(Reflect.getOwnMetadata('design:type', User.prototype, 'age')).toBeUndefined();
	});
});
