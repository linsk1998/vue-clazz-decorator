
import { createComponent } from "@/vue/createComponent";
import { Prop } from "@/vue/Prop";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

function MyTemplate(props: any) {
	return <div>Hello, {props.name}!</div>;
}

describe('prop', () => {
	it('basic', () => {
		const wrapper = mount(function() {
			@ViewModel
			class PropsViewModel {
				@Prop
				name?: string;
				@Prop
				fn?: Function;
				@Prop
				num?: number;
			}
			const PropsComponent = createComponent(MyTemplate, PropsViewModel);

			return <PropsComponent name="Prop" fn={function() {}} num={1} />;
		});
		expect(wrapper.element.textContent).toBe('Hello, Prop!');
	});
	it('default value', () => {
		@ViewModel
		class DefaultPropViewModel {
			@Prop
			name?: string = "123";
			@Prop
			fn?: Function;
			@Prop
			num?: number;
		}
		const DefaultPropComponent = createComponent(MyTemplate, DefaultPropViewModel);

		const wrapper = mount(function() {
			return <DefaultPropComponent />;
		});
		expect(wrapper.element.textContent).toBe('Hello, 123!');
	});
	it('different prop', () => {

		@ViewModel
		class DifferentPropViewModel {
			@Prop('myName')
			name?: string;
		}

		const DifferentPropComponent: any = createComponent(MyTemplate, DifferentPropViewModel);

		const wrapper = mount(function() {
			return <DifferentPropComponent myName="Prop" />;
		});
		expect(wrapper.element.textContent).toBe('Hello, Prop!');
	});
});
