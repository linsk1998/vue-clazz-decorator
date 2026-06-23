/** 类型测试：验证 vue-clazz-decorator 的类型正确性。通过相对路径直接引用 types/index.d.ts，等价于消费者 import from "vue-clazz-decorator"。 */
import { nextTick } from 'vue';
import type {
	AutoAccessorDecorator,
	AutoClassDecorator,
	AutoMethodDecorator,
	AutoPropertyDecorator,
} from 'vue-clazz-decorator';
import {
	ArrayType,
	Computed,
	computed,
	createComponent,
	defineMetadata,
	deleteMetadata,
	// 工厂函数
	From,
	getMetadata,
	getMetadataKeys,
	getOwnMetadata,
	getOwnMetadataKeys,
	hasMetadata,
	hasOwnMetadata,
	hydrate,
	Inject,
	JsonExpose,
	JsonFormat,
	JsonIgnore,
	// JSON 序列化
	JsonProperty,
	// Metadata
	metadata,
	// Model 层
	Model,
	normalize,
	OnDidCatch,
	// 生命周期
	OnDidCreate,
	OnDidMount,
	OnDidUnmount,
	OnDidUpdate,
	OnWillMount,
	OnWillUnmount,
	OnWillUpdate,
	Prop,
	Provide,
	reactive,
	Ref,
	// 装饰器
	State,
	state,
	Type,
	// View/ViewModel
	ViewModel,
	Watch
} from 'vue-clazz-decorator';

// ============ ViewModel + 组件装饰器 ============

@ViewModel
class TestViewModel {
	@State
	public name: string = 'hello';

	@Prop
	public count: number = 0;

	@Computed
	public get fullName(): string {
		return this.name + '!';
	}

	// @Computed 也接受 setter
	@Computed
	public get computedWithSetter(): number {
		return this.count;
	}
	public set computedWithSetter(v: number) {
		this.count = v;
	}

	// Inject 基本用法 + from 用法
	@Inject
	public injected!: any;

	@Inject('key1')
	public keyedInject!: any;

	// Provide 基本用法 + key 用法
	@Provide
	public provided: string = 'val';

	// Ref 模板引用
	@Ref
	public myRef!: HTMLElement;

	// 方法装饰器：Watch
	@Watch('name')
	public onNameChange(newVal: string, oldVal: string): void {}

	@Watch('name', { deep: true, immediate: true })
	public onNameDeep(newVal: string, oldVal: string): void {}

	// 生命周期
	@OnDidCreate
	public didCreate(): void {}

	@OnWillMount
	public willMount(): void {}

	@OnDidMount
	public didMount(): void {}

	@OnWillUpdate
	public willUpdate(): void {}

	@OnDidUpdate
	public didUpdate(): void {}

	@OnWillUnmount
	public willUnmount(): void {}

	@OnDidUnmount
	public didUnmount(): void {}

	@OnDidCatch
	public didCatch(err: Error): void {}

	// Metadata 装饰器
	@metadata('label', '用户名')
	public username: string = '';
}

// ============ Model 层 ============

@Model
class DeptModel {
	name: string = '';
}

@Model
class RoleModel {
	name: string = '';

	// JSON 键名映射
	@JsonProperty('role_name')
	public roleName: string = '';

	// 控制序列化方向
	@JsonExpose(true, true)
	public synced: string = '';

	@JsonExpose({ serialize: true, deserialize: false })
	public readOnly: string = '';

	// 忽略字段
	@JsonIgnore
	public internal: string = '';

	// 日期格式化
	@JsonFormat('yyyy-MM-dd')
	public createdAt: Date = new Date();

	@JsonFormat(Number)
	public timestamp: Date = new Date();
}

@Model
class UserModel {
	name: string = '';
	age: number = 0;

	// 子对象
	dept: DeptModel = new DeptModel();

	// 数组，需要显式标注泛型类型
	@Type(ArrayType(RoleModel))
	roles: RoleModel[] = [];
}

// ============ 类型推导测试：装饰器工厂返回正确类型 ============

// @Type 返回装饰器
const typeDeco: AutoPropertyDecorator<any, UserModel> & AutoAccessorDecorator<any, UserModel> = Type(UserModel);

// metadata 返回通用装饰器
const metaDeco: AutoPropertyDecorator<any, any> & AutoAccessorDecorator<any, any> & AutoMethodDecorator<any, any> & AutoClassDecorator<any> = metadata('key', 'value');

// @JsonProperty 返回属性装饰器
const jsonDeco: AutoPropertyDecorator<any, any> = JsonProperty('key');

// @From 返回属性装饰器
const fromDeco: AutoPropertyDecorator<any, any> = From(UserModel, 'name');

// ============ reactive / hydrate / normalize ============

// 类型测试：reactive 返回正确的类型
const user: UserModel = reactive({}, UserModel);
const users: UserModel[] = reactive([], ArrayType(UserModel));

// hydrate 返回正确的类型
const hydrated: UserModel = hydrate({ name: 'test', age: 18 }, UserModel);

// normalize 返回正确的类型
const normalized: UserModel = normalize({ name: 'test', age: 18 }, UserModel);

// ============ state / computed 工厂函数 ============

// state 工厂创建响应式访问器
const nameAccessor = state<string>('');
const nameValue: string | null | undefined = nameAccessor.get();

// computed 工厂
const fullAccessor = computed(() => 'hello');
const fullValue: string | null | undefined = fullAccessor.get();

// ============ Metadata API ============

getMetadata('design:type', UserModel.prototype, 'name');
getOwnMetadata('design:type', UserModel.prototype, 'name');
defineMetadata('custom', true, UserModel.prototype, 'name');
hasMetadata('design:type', UserModel.prototype, 'name');
hasOwnMetadata('custom', UserModel.prototype, 'name');
deleteMetadata('custom', UserModel.prototype, 'name');
getMetadataKeys(UserModel.prototype, 'name');
getOwnMetadataKeys(UserModel.prototype, 'name');

// ============ createComponent ============

function MyTemplate(props: TestViewModel): any { return null; }
const MyComponent = createComponent(MyTemplate, TestViewModel);

// ============ nextTick re-export ============

const tick: Promise<void> = nextTick();
