import { createComponent } from "@/vue/createComponent";
import { useChildren } from "@/vue/useChildren";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { useSlots } from "vue";

describe('slot', () => {
	describe('basic', () => {
		it('default', async () => {
			var Provider = createComponent(function(props) {
				return <div>{useChildren()}</div>;
			});
			const wrapper = mount(function() {
				return <>
					<Provider>Hello, Tsx!</Provider>
				</>;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('Hello, Tsx!');
		});
		it('name', async () => {
			var Provider = createComponent(function(props: any) {
				const slots = useSlots();
				return <>
					<div class="header">{props.header}</div>
					<div class="body">{slots.body?.()}</div>
					<div class="footer">{slots.footer?.()}</div>
				</>;
			});
			const wrapper = mount(function() {
				return <>
					<Provider
						header={<h4>header</h4>}
						v-slots={{
							body: () => <p>body</p>,
							footer: () => <p>footer</p>
						}}
					>Hello, Tsx!</Provider>
				</>;
			});
			const children = wrapper.element.children;
			expect(children[0].textContent).toBe('header');
			expect(children[1].textContent).toBe('body');
			expect(children[2].textContent).toBe('footer');
		});
	});
});
