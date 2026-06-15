import { JsonDeserialize, JsonExpose, JsonIgnore, JsonProperty, JsonSerialize } from '@/model/Json';
import { Model } from '@/model/Model';
import { normalize } from '@/model/normalize';
import { describe, expect, it } from 'vitest';

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
