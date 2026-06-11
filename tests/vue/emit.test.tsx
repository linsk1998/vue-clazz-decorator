import { createComponent } from "@/vue/createComponent";
import { Emit } from "@/vue/Emit";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('v-model', () => {
	it('experimental: component', async () => {
		var ret: string;
		@ViewModel
		class ButtonViewModel {
			@Emit
			onClick: Function;

			bindClick(e) {
				ret = this.onClick(e);
			}
		}
		function ButtonView(props: ButtonViewModel) {
			return <button type="button" onClick={props.bindClick}>button</button>;
		}
		const Button = createComponent(ButtonView, ButtonViewModel);

		@ViewModel
		class StateViewModel {
			@State
			text = "init";

			onSetText() {
				return this.text = "setted";
			}
		}
		function StateView(props: StateViewModel) {
			return <>
				<div>{props.text}</div>
				<Button onClick={props.onSetText} />
			</>;
		}
		const StateCom = createComponent(StateView, StateViewModel);

		const wrapper = mount(function() {
			return <StateCom />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('init');

		const buttons = wrapper.findAll('button');
		await buttons[0].trigger('click');
		expect(children[0].textContent).toBe('setted');
		expect(ret).toBe('setted');
	});
});
