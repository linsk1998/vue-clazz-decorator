
import { createComponent } from "@/vue/createComponent";
import { Prop } from "@/vue/Prop";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

function MyTemplate(props: any) {
	return <div>Hello, {props.name}!</div>;
}

@ViewModel
class PropsViewModel {
	@Prop
	name?: string;
	@Prop
	fn?: Function;
	@Prop
	num?: number;
}

export const PropsComponent = createComponent(MyTemplate, PropsViewModel);

export function ComponentWithProps() {
	return <PropsComponent name="Prop" fn={function() { }} num={1} />;
};

@ViewModel
class DefaultPropViewModel {
	@Prop
	name?: string = "123";
	@Prop
	fn?: Function;
	@Prop
	num?: number;
}

export const DefaultPropComponent = createComponent(MyTemplate, DefaultPropViewModel);

@ViewModel
class DiffrentPropViewModel {
	@Prop('myName')
	name?: string;
}

export const DiffrentPropComponent: any = createComponent(MyTemplate, DiffrentPropViewModel);

function DiffrentPropsComponentDemo() {
	return <DiffrentPropComponent myName="Prop" />;
}

describe('prop', () => {
	it('experimental', () => {
		const wrapper = mount(ComponentWithProps);
		expect(wrapper.element.textContent).toBe('Hello, Prop!');
	});
	it('experimental default value', () => {
		const wrapper = mount(function() {
			return <DefaultPropComponent />;
		});
		expect(wrapper.element.textContent).toBe('Hello, 123!');
	});
	it('experimental diffrent prop', () => {
		const wrapper = mount(DiffrentPropsComponentDemo);
		expect(wrapper.element.textContent).toBe('Hello, Prop!');
	});
});
