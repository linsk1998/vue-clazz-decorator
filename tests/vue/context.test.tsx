import { Computed } from "@/vue/Computed";
import { createComponent } from "@/vue/createComponent";
import { Inject } from "@/vue/Inject";
import { ModelValue } from "@/vue/ModelValue";
import { Prop } from "@/vue/Prop";
import { Provide } from "@/vue/Provide";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';


describe('context', () => {
	describe('basic', () => {
		it('class', async () => {
			@ViewModel
			@Provide('ancestor')
			class AncestorViewModel {
				name = 'ancestor';
			}
			@ViewModel
			class DescendantViewModel {
				name = 'descendant';

				@Inject('ancestor')
				ancestor: AncestorViewModel;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <div>{props.ancestor.name}</div>;
			}, DescendantViewModel);
			var Ancestor = createComponent(function() {
				return <div><Descendant /></div>;
			}, AncestorViewModel);
			const wrapper = mount(function() {
				return <>
					<Ancestor />
				</>;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('ancestor');
		});
		it('property', async () => {
			@ViewModel
			class AncestorViewModel {
				@Provide('ancestorName')
				name = 'ancestor';
			}
			@ViewModel
			class DescendantViewModel {
				name = 'descendant';

				@Inject
				ancestorName: AncestorViewModel;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <div>{props.ancestorName}</div>;
			}, DescendantViewModel);
			var Ancestor = createComponent(function(props: AncestorViewModel) {
				return <div>
					<Descendant />
				</div>;
			}, AncestorViewModel);
			const wrapper = mount(function() {
				return <>
					<Ancestor />
				</>;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('ancestor');
		});
		it('state', async () => {
			@ViewModel
			class AncestorViewModel {
				@Provide('ancestorName')
				@State
				name = 'ancestor';

				onClick() {
					this.name = 'state';
				};
			}
			@ViewModel
			class DescendantViewModel {
				name = 'descendant';

				@Inject
				ancestorName: AncestorViewModel;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <div>{props.ancestorName}</div>;
			}, DescendantViewModel);
			var Ancestor = createComponent(function(props: AncestorViewModel) {
				return <>
					<Descendant />
					<button type="button" onClick={props.onClick}>Context Change</button>
				</>;
			}, AncestorViewModel);
			const wrapper = mount(function() {
				return <>
					<Ancestor />
				</>;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('ancestor');
			await wrapper.find('button').trigger('click');
			expect(children[0].textContent).toBe('state');
		});
		it('provide + method', async () => {
			@ViewModel
			class AncestorViewModel {
				@State
				count = 0;

				@Provide('increment')
				increment() {
					this.count++;
				}
			}
			@ViewModel
			class DescendantViewModel {
				@Inject('increment')
				increment: () => void;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <button type="button" onClick={props.increment}>Call Ancestor</button>;
			}, DescendantViewModel);
			var Ancestor = createComponent(function(props: AncestorViewModel) {
				return <>
					<div>Count: {props.count}</div>
					<Descendant />
				</>;
			}, AncestorViewModel);
			const wrapper = mount(function() {
				return <Ancestor />;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('Count: 0');
			// 后代通过注入的方法修改祖先状态
			await wrapper.find('button').trigger('click');
			expect(children[0].textContent).toBe('Count: 1');
		});
		it('provide + prop', async () => {
			@ViewModel
			class AncestorViewModel {
				@Provide('ancestorLabel')
				@Prop
				label: string;
			}
			@ViewModel
			class DescendantViewModel {
				@Inject('ancestorLabel')
				label: string;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <span>{props.label}</span>;
			}, DescendantViewModel);
			var Ancestor = createComponent(function(props: AncestorViewModel) {
				return <>
					<div>{props.label}</div>
					<Descendant />
				</>;
			}, AncestorViewModel);
			const wrapper = mount(function(props) {
				return <Ancestor {...props} />;
			}, {
				propsData: {
					label: 'hello'
				}
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('hello');
			// 后代通过注入获取祖先的 prop 值
			expect(children[1].textContent).toBe('hello');
		});
		it('provide + computed', async () => {
			@ViewModel
			class AncestorViewModel {
				@State
				count = 5;

				@Provide('doubleCount')
				@Computed
				get doubleCount(): number {
					return this.count * 2;
				}

				increase() {
					this.count++;
				}
			}
			@ViewModel
			class DescendantViewModel {
				@Inject('doubleCount')
				doubleCount: number;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <span>{props.doubleCount}</span>;
			}, DescendantViewModel);
			var Ancestor = createComponent(function(props: AncestorViewModel) {
				return <>
					<div>{props.doubleCount}</div>
					<Descendant />
					<button type="button" onClick={props.increase}>+</button>
				</>;
			}, AncestorViewModel);
			const wrapper = mount(function() {
				return <Ancestor />;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('10');
			// 后代通过注入获取祖先的计算属性值
			expect(children[1].textContent).toBe('10');
			// 祖先状态变化后，后代的计算值同步更新
			await wrapper.find('button').trigger('click');
			expect(children[0].textContent).toBe('12');
			expect(children[1].textContent).toBe('12');
		});
		it('provide + modelValue', async () => {
			@ViewModel
			class DescendantViewModel {
				@Inject('inputValue')
				value: string;
			}
			var Descendant = createComponent(function(props: DescendantViewModel) {
				return <span>{props.value}</span>;
			}, DescendantViewModel);

			@ViewModel
			class InputViewModel {
				@Provide('inputValue')
				@ModelValue
				value = 'init';
			}
			function InputView(props: InputViewModel) {
				return <>
					<input type="text" v-model={props.value} />
					<Descendant />
				</>;
			}
			const Input = createComponent(InputView, InputViewModel);

			@ViewModel
			class ParentViewModel {
				@State
				text = 'init';
			}
			var Parent = createComponent(function(props: ParentViewModel) {
				return <>
					<div>{props.text}</div>
					<Input v-model={props.text} />
				</>;
			}, ParentViewModel);
			const wrapper = mount(function() {
				return <Parent />;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('init');
			// 后代通过注入获取祖先的 modelValue 值
			const inputWrapper = wrapper.find('span');
			expect(inputWrapper.text()).toBe('init');

			// 通过 input 修改值，后代同步更新
			const input = wrapper.find('input');
			await input.setValue('changed');
			expect(children[0].textContent).toBe('changed');
			expect(inputWrapper.text()).toBe('changed');
		});
	});
});
