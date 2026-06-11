import { createComponent } from "@/vue/createComponent";
import { Inject } from "@/vue/Inject";
import { Prop } from "@/vue/Prop";
import { Provide } from "@/vue/Provide";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('state', () => {
	it('experimental', async () => {
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
	it('experimental prop state', async () => {
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
	it('experimental @State + @Prop combination', async () => {
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
	it('experimental prop state default value', async () => {
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
	it('experimental @State + @Inject combination', async () => {
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
});
