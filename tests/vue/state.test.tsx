import { Model } from "@/model/Model";
import { createComponent } from "@/vue/createComponent";
import { Inject } from "@/vue/Inject";
import { OnDidCreate } from "@/vue/lifecycle";
import { Prop } from "@/vue/Prop";
import { Provide } from "@/vue/Provide";
import { Reactive } from "@/vue/Reactive";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('state', () => {
	it('basic', async () => {
		function StateView(props: StateViewModel) {
			return <>
				<div>Count: {props.count}</div>
				<button type="button" onClick={props.decrease}>-</button>
				<button type="button" onClick={props.increase}>+</button>
			</>;
		}
		@ViewModel
		class StateViewModel {
			@State
			count = 0;

			decrease() {
				this.count--;
			}
			increase() {
				this.count++;
			}
		}
		const StateCom = createComponent(StateView, StateViewModel);

		const wrapper = mount(function() {
			return <StateCom />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 0');

		// 找到按钮并模拟点击
		const buttons = wrapper.findAll('button');
		await buttons[1].trigger('click');
		expect(children[0].textContent).toBe('Count: 1');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('Count: 0');
	});
	it('prop state', async () => {
		function StateView(props: StateViewModel) {
			return <>
				<div>Count: {props.count}</div>
				<button type="button" onClick={props.decrease}>-</button>
				<button type="button" onClick={props.increase}>+</button>
			</>;
		}
		@ViewModel
		class StateViewModel {
			@Prop
			@State
			count: number;

			decrease() {
				this.count--;
			}
			increase() {
				this.count++;
			}
		}
		const StateCom = createComponent(StateView, StateViewModel);
		const wrapper = mount(function(props) {
			return <StateCom {...props} />;
		}, {
			propsData: {
				count: 1
			}
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 1');

		// 找到按钮并模拟点击
		const buttons = wrapper.findAll('button');
		await buttons[1].trigger('click');
		expect(children[0].textContent).toBe('Count: 2');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('Count: 1');
	});
	it('@State + @Prop combination', async () => {
		function ComboView(props: ComboViewModel) {
			return <>
				<div>Name: {props.name}</div>
				<button type="button" onClick={props.rename}>Rename</button>
			</>;
		}
		@ViewModel
		class ComboViewModel {
			@Prop
			@State
			name: string;

			rename() {
				this.name = 'updated';
			}
		}
		const ComboCom = createComponent(ComboView, ComboViewModel);
		const wrapper = mount(function(props) {
			return <ComboCom {...props} />;
		}, {
			propsData: {
				name: 'initial'
			}
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Name: initial');

		// @State 使注入的 prop 值可变
		const button = wrapper.find('button');
		await button.trigger('click');
		expect(children[0].textContent).toBe('Name: updated');
	});
	it('prop state default value', async () => {
		function StateView(props: StateViewModel) {
			return <>
				<div>Count: {props.count}</div>
				<button type="button" onClick={props.decrease}>-</button>
				<button type="button" onClick={props.increase}>+</button>
			</>;
		}
		@ViewModel
		class StateViewModel {
			@Prop
			@State
			count: number = 2;

			decrease() {
				this.count--;
			}
			increase() {
				this.count++;
			}
		}
		const StateCom = createComponent(StateView, StateViewModel);
		const wrapper = mount(function() {
			return <StateCom />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 2');

		// 找到按钮并模拟点击
		const buttons = wrapper.findAll('button');
		await buttons[1].trigger('click');
		expect(children[0].textContent).toBe('Count: 3');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('Count: 2');
	});
	it('@State + @Inject combination', async () => {
		@ViewModel
		class AncestorViewModel {
			@Provide('sharedCount')
			count = 10;
		}
		function DescendantView(props: DescendantViewModel) {
			return <>
				<div>Count: {props.sharedCount}</div>
				<button type="button" onClick={props.increase}>+</button>
			</>;
		}
		@ViewModel
		class DescendantViewModel {
			@Inject
			@State
			sharedCount: number;

			increase() {
				this.sharedCount++;
			}
		}
		const Descendant = createComponent(DescendantView, DescendantViewModel);
		const Ancestor = createComponent(function() {
			return <Descendant />;
		}, AncestorViewModel);
		const wrapper = mount(function() {
			return <Ancestor />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 10');

		// @State 使注入的 provide 值可变
		const button = wrapper.find('button');
		await button.trigger('click');
		expect(children[0].textContent).toBe('Count: 11');
	});
	it('@Reactive deep reactivity', async () => {
		function ReactiveView(props: ReactiveViewModel) {
			return <>
				<div>Name: {props.user.name}</div>
				<button type="button" onClick={props.rename}>Rename</button>
			</>;
		}
		@Model
		class Profile {
			public name: string;
			public age: number;
		}
		@ViewModel
		class ReactiveViewModel {
			@Reactive(Profile)
			user: Profile;

			@OnDidCreate
			created() {
				this.user = { name: "张三", age: 25 } as Profile;
			}

			rename() {
				this.user.name = "李四";
			}
		}
		const ReactiveCom = createComponent(ReactiveView, ReactiveViewModel);
		const wrapper = mount(function() {
			return <ReactiveCom />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Name: 张三');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(children[0].textContent).toBe('Name: 李四');
	});
	it('@Reactive with nested object type', async () => {
		@Model
		class Profile {
			public name: string;
			public age: number;
		}
		function ReactiveView(props: ReactiveViewModel) {
			return <>
				<div>Name: {props.profile.name}, Age: {props.profile.age}</div>
				<button type="button" onClick={props.birthday}>Birthday</button>
			</>;
		}
		@ViewModel
		class ReactiveViewModel {
			@Reactive(Profile)
			profile: Profile;

			@OnDidCreate
			created() {
				this.profile = { name: "王五", age: 30 } as Profile;
			}

			birthday() {
				this.profile.age++;
			}
		}
		const ReactiveCom = createComponent(ReactiveView, ReactiveViewModel);
		const wrapper = mount(function() {
			return <ReactiveCom />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Name: 王五, Age: 30');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(children[0].textContent).toBe('Name: 王五, Age: 31');
	});
});
