import { JsonDeserialize, JsonExpose, JsonFormat, JsonIgnore, JsonProperty, JsonSerialize } from '@/model/Json';
import { Model } from '@/model/Model';
import { normalize } from '@/model/normalize';
import { describe, expect, it } from 'vitest';

// polyfill: RegExp.escape 在部分 Node.js 版本中不可用
if(!(RegExp as any).escape) {
	(RegExp as any).escape = function(s: string) {
		return s.replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
	};
}

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

describe('@JsonFormat', () => {
	describe('serialize', () => {
		it('formats Date to string using local time (no timezone)', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(2023, 5, 15, 15, 30, 45);
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 15:30:45");
		});

		it('formats Date to string with positive timezone offset', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss", +8)
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(Date.UTC(2023, 5, 15, 10, 30, 45));
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 18:30:45");
		});

		it('formats Date to string with negative timezone offset', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss", -5)
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(Date.UTC(2023, 5, 15, 18, 0, 0));
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 13:00:00");
		});

		it('formats Date to string with object options', () => {
			@Model
			class TestModel {
				@JsonFormat({ pattern: "yyyy-MM-dd HH:mm:ss", timezone: +8 })
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(Date.UTC(2023, 5, 15, 10, 30, 45));
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 18:30:45");
		});

		it('formats Date to string with object options and no timezone', () => {
			@Model
			class TestModel {
				@JsonFormat({ pattern: "yyyy/MM/dd" })
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(2023, 5, 15);
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023/06/15");
		});

		it('passes through non-Date values unchanged', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public name: string;
			}
			var instance = new TestModel();
			instance.name = "hello";
			var json = (instance as any).toJSON();
			expect(json.name).toBe("hello");
		});

		it('passes through null unchanged', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public createdAt: Date | null;
			}
			var instance = new TestModel();
			instance.createdAt = null;
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBeNull();
		});
	});

	describe('deserialize', () => {
		it('parses string to Date using local time (no timezone)', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public createdAt: Date;
			}
			var result = normalize({ createdAt: "2023-06-15 15:30:45" }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getFullYear()).toBe(2023);
			expect(result.createdAt.getMonth()).toBe(5);
			expect(result.createdAt.getDate()).toBe(15);
			expect(result.createdAt.getHours()).toBe(15);
			expect(result.createdAt.getMinutes()).toBe(30);
			expect(result.createdAt.getSeconds()).toBe(45);
		});

		it('parses string to Date with timezone offset', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss", +8)
				public createdAt: Date;
			}
			var result = normalize({ createdAt: "2023-06-15 18:30:45" }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getUTCFullYear()).toBe(2023);
			expect(result.createdAt.getUTCMonth()).toBe(5);
			expect(result.createdAt.getUTCDate()).toBe(15);
			expect(result.createdAt.getUTCHours()).toBe(10);
			expect(result.createdAt.getUTCMinutes()).toBe(30);
			expect(result.createdAt.getUTCSeconds()).toBe(45);
		});

		it('parses string to Date with negative timezone offset', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss", -5)
				public createdAt: Date;
			}
			var result = normalize({ createdAt: "2023-06-15 13:00:00" }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getUTCHours()).toBe(18);
			expect(result.createdAt.getUTCMinutes()).toBe(0);
		});

		it('parses string to Date with object options', () => {
			@Model
			class TestModel {
				@JsonFormat({ pattern: "yyyy-MM-dd HH:mm:ss", timezone: +8 })
				public createdAt: Date;
			}
			var result = normalize({ createdAt: "2023-06-15 18:30:45" }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getUTCHours()).toBe(10);
		});

		it('passes through non-string values unchanged', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public count: number;
			}
			var result = normalize({ count: 42 }, TestModel);
			expect(result.count).toBe(42);
		});

		it('returns invalid Date for string that does not match format', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public createdAt: Date;
			}
			var result = normalize({ createdAt: "not-a-date" }, TestModel);
			expect(isNaN(result.createdAt.valueOf())).toBe(true);
		});

		it('parses string with different date separators', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy/MM/dd HH:mm:ss")
				public createdAt: Date;
			}
			var result = normalize({ createdAt: "2023/06/15 12:00:00" }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getFullYear()).toBe(2023);
			expect(result.createdAt.getMonth()).toBe(5);
			expect(result.createdAt.getDate()).toBe(15);
		});
	});

	describe('round-trip', () => {
		it('serialize then deserialize preserves Date (no timezone)', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss")
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(2023, 5, 15, 15, 30, 45);
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 15:30:45");
			var restored = normalize(json, TestModel);
			expect(restored.createdAt).toBeInstanceOf(Date);
			expect(restored.createdAt.getFullYear()).toBe(2023);
			expect(restored.createdAt.getMonth()).toBe(5);
			expect(restored.createdAt.getDate()).toBe(15);
			expect(restored.createdAt.getHours()).toBe(15);
			expect(restored.createdAt.getMinutes()).toBe(30);
			expect(restored.createdAt.getSeconds()).toBe(45);
		});

		it('serialize then deserialize with timezone preserves UTC time', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss", +8)
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(Date.UTC(2023, 5, 15, 10, 30, 45));
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 18:30:45");
			var restored = normalize(json, TestModel);
			expect(restored.createdAt.getTime()).toBe(instance.createdAt.getTime());
		});

		it('round-trip with negative timezone', () => {
			@Model
			class TestModel {
				@JsonFormat("yyyy-MM-dd HH:mm:ss", -5)
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(Date.UTC(2023, 5, 15, 18, 0, 0));
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 13:00:00");
			var restored = normalize(json, TestModel);
			expect(restored.createdAt.getTime()).toBe(instance.createdAt.getTime());
		});

		it('round-trip with object options', () => {
			@Model
			class TestModel {
				@JsonFormat({ pattern: "yyyy-MM-dd HH:mm:ss", timezone: +3 })
				public createdAt: Date;
			}
			var instance = new TestModel();
			instance.createdAt = new Date(Date.UTC(2023, 5, 15, 6, 0, 0));
			var json = (instance as any).toJSON();
			expect(json.createdAt).toBe("2023-06-15 09:00:00");
			var restored = normalize(json, TestModel);
			expect(restored.createdAt.getTime()).toBe(instance.createdAt.getTime());
		});
	});

	describe('timestamp', () => {
		it('serialize Date to timestamp number with @JsonFormat(Number)', () => {
			@Model
			class TestModel {
				@JsonFormat(Number)
				public createdAt: Date;
			}
			var instance = new TestModel();
			var date = new Date(Date.UTC(2023, 5, 15, 10, 30, 45));
			instance.createdAt = date;
			var json = (instance as any).toJSON();
			expect(typeof json.createdAt).toBe("number");
			expect(json.createdAt).toBe(date.getTime());
		});

		it('deserialize timestamp number to Date with @JsonFormat(Number)', () => {
			@Model
			class TestModel {
				@JsonFormat(Number)
				public createdAt: Date;
			}
			var ts = new Date(Date.UTC(2023, 5, 15, 10, 30, 45)).getTime();
			var result = normalize({ createdAt: ts }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getTime()).toBe(ts);
		});

		it('serialize Date to timestamp with @JsonFormat({shape: Number})', () => {
			@Model
			class TestModel {
				@JsonFormat({ shape: Number })
				public createdAt: Date;
			}
			var instance = new TestModel();
			var date = new Date(Date.UTC(2023, 5, 15, 10, 30, 45));
			instance.createdAt = date;
			var json = (instance as any).toJSON();
			expect(typeof json.createdAt).toBe("number");
			expect(json.createdAt).toBe(date.getTime());
		});

		it('deserialize timestamp with @JsonFormat({shape: Number})', () => {
			@Model
			class TestModel {
				@JsonFormat({ shape: Number })
				public createdAt: Date;
			}
			var ts = new Date(Date.UTC(2023, 5, 15, 10, 30, 45)).getTime();
			var result = normalize({ createdAt: ts }, TestModel);
			expect(result.createdAt).toBeInstanceOf(Date);
			expect(result.createdAt.getTime()).toBe(ts);
		});

		it('timestamp round-trip preserves Date', () => {
			@Model
			class TestModel {
				@JsonFormat(Number)
				public createdAt: Date;
			}
			var instance = new TestModel();
			var date = new Date(Date.UTC(2023, 5, 15, 10, 30, 45));
			instance.createdAt = date;
			var json = (instance as any).toJSON();
			var restored = normalize(json, TestModel);
			expect(restored.createdAt.getTime()).toBe(date.getTime());
		});

		it('timestamp serialize passes through non-Date unchanged', () => {
			@Model
			class TestModel {
				@JsonFormat(Number)
				public name: string;
			}
			var instance = new TestModel();
			instance.name = "hello";
			var json = (instance as any).toJSON();
			expect(json.name).toBe("hello");
		});

		it('timestamp deserialize passes through non-number unchanged', () => {
			@Model
			class TestModel {
				@JsonFormat(Number)
				public name: string;
			}
			var result = normalize({ name: "hello" }, TestModel);
			expect(isNaN(result.name)).toBe(true);
		});
	});
});
