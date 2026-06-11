import { Computed } from "@/vue/Computed";
import { createComponent } from "@/vue/createComponent";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';


describe('computed', () => {
	it('experimental', async () => {
		function ComputedView(props: ComputedViewModel) {
			return <>
				<div>Double Count: {props.doubleCount}</div>
				<button type="button" onClick={props.decrease}>-</button>
				<button type="button" onClick={props.increase}>+</button>
			</>;
		}
		@ViewModel
		class ComputedViewModel {
			@State
			count = 0;

			@Computed
			get doubleCount(): number {
				return this.count * 2;
			}

			decrease() {
				this.count--;
			}
			increase() {
				this.count++;
			}
		}
		const ComputedCom = createComponent(ComputedView, ComputedViewModel);

		const wrapper = mount(function() {
			return <ComputedCom />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Double Count: 0');

		// 找到按钮并模拟点击
		const buttons = wrapper.findAll('button');
		await buttons[1].trigger('click');
		expect(children[0].textContent).toBe('Double Count: 2');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('Double Count: 0');
	});
});
