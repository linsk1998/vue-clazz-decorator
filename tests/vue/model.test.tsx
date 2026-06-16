import { createComponent } from "@/vue/createComponent";
import { ModelValue } from "@/vue/ModelValue";
import { Prop } from "@/vue/Prop";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

describe('v-model', () => {
	it('input', async () => {
		function StateView(props: StateViewModel) {
			return <>
				<div>{props.text}</div>
				<input type="text" v-model={props.text} />
				<button type="button" onClick={props.onSetText}>set</button>
				<button type="button" onClick={props.onAssert}>assert</button>
			</>;
		}
		@ViewModel
		class StateViewModel {
			/** 传入断言函数 */
			@Prop
			assert: Function;

			@State
			text = "init";

			onSetText() {
				this.text = "setted";
			}

			onAssert() {
				Reflect.apply(this.assert, this, [this.text]);
			}
		}
		const StateCom = createComponent(StateView, StateViewModel);

		// 创建函数监视器
		const assertCalled = vi.fn();
		const wrapper = mount(function(props) {
			return <StateCom {...props} />;
		}, {
			propsData: {
				assert(text: string) {
					assertCalled();
					expect(text).toBe("input");
				}
			}
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('init');

		const input = wrapper.find('input');
		expect(input.element.value).toBe('init');

		const buttons = wrapper.findAll('button');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('setted');

		await input.setValue('input');
		expect(children[0].textContent).toBe('input');
		await buttons[1].trigger('click');
		expect(assertCalled).toHaveBeenCalled();
	});
	it('component', async () => {
		@ViewModel
		class InputViewModel {
			@ModelValue
			value = "init";
		}
		function InputView(props: InputViewModel) {
			return <input type="text" v-model={props.value} />;
		}
		const Input = createComponent(InputView, InputViewModel);

		@ViewModel
		class StateViewModel {
			/** 传入断言函数 */
			@Prop
			assert: Function;

			@State
			text = "init";

			onSetText() {
				this.text = "setted";
			}

			onAssert() {
				Reflect.apply(this.assert, this, [this.text]);
			}
		}
		function StateView(props: StateViewModel) {
			return <>
				<div>{props.text}</div>
				<Input v-model={props.text} />
				<button type="button" onClick={props.onSetText}>set</button>
				<button type="button" onClick={props.onAssert}>assert</button>
			</>;
		}
		const StateCom = createComponent(StateView, StateViewModel);

		// 创建函数监视器
		const assertCalled = vi.fn();
		const wrapper = mount(function(props) {
			return <StateCom {...props} />;
		}, {
			propsData: {
				assert(text: string) {
					assertCalled();
					expect(text).toBe("input");
				}
			}
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('init');

		const input = wrapper.find('input');
		expect(input.element.value).toBe('init');

		const buttons = wrapper.findAll('button');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('setted');

		await input.setValue('input');
		expect(children[0].textContent).toBe('input');
		await buttons[1].trigger('click');
		expect(assertCalled).toHaveBeenCalled();
	});
});
