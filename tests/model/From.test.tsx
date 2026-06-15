import { fieldWeakMap } from '@/metadata/defineFieldMetadata';
import { metadata } from '@/metadata/metadata';
import { From } from '@/model/From';
import { Model } from '@/model/Model';
import { describe, expect, it } from 'vitest';

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

		let meta = (User as any)[Symbol.metadata];
		let fm = fieldWeakMap.get(meta);
		expect(fm).toBeDefined();
		expect(fm.deptId.label).toBe("部门ID");
		expect(fm.deptName.label).toBe("部门名称");
	});

	it('@From and @metadata are same level - first applied wins', () => {
		@Model
		class Dept {
			@metadata('label', "部门ID")
			public id: string;
		}

		@Model
		class User {
			// @From 在下面，先执行，写入 label: "部门ID"
			// @metadata 在上面，后执行，被"先写优先"阻止
			@metadata('label', "自定义标签")
			@From(Dept, 'id')
			public deptId: string;
		}

		let meta = (User as any)[Symbol.metadata];
		let fm = fieldWeakMap.get(meta);
		expect(fm).toBeDefined();
		// @From 先执行（内层装饰器先应用），所以 label 来自 Dept.id
		expect(fm.deptId.label).toBe("部门ID");
	});

	it('innermost @metadata wins over outer @From', () => {
		@Model
		class Dept {
			@metadata('label', "部门ID")
			@metadata('desc', "部门描述")
			public id: string;
		}

		@Model
		class User {
			// @metadata 在下面，先执行，写入 label: "自定义标签"
			// @From 在上面，后执行，只填充 label 之外的 key（如 desc）
			@From(Dept, 'id')
			@metadata('label', "自定义标签")
			public deptId: string;
		}

		let meta = (User as any)[Symbol.metadata];
		let fm = fieldWeakMap.get(meta);
		expect(fm).toBeDefined();
		// @metadata 先执行（内层），label = "自定义标签"
		expect(fm.deptId.label).toBe("自定义标签");
		// @From 后执行，填充不存在的 key
		expect(fm.deptId.desc).toBe("部门描述");
	});
});
