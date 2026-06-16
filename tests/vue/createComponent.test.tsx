import { createComponent } from "@/vue/createComponent";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

function FunctionalComponent(props: {}) {
	return <div>Hello, FunctionalComponent!</div>;
}
function MyView(props: MyViewModel) {
	return <div>Hello, Template!</div>;
}
class MyViewModel {
}
const ClassComponent = createComponent(MyView, MyViewModel);

function TsxComponent() {
	return <>
		<div>Hello, Tsx!</div>
		<FunctionalComponent />
		<ClassComponent />
	</>;
}

describe('createComponent', () => {
	it('basic', () => {
		const wrapper = mount(TsxComponent);
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Hello, Tsx!');
		expect(children[1].textContent).toBe('Hello, FunctionalComponent!');
		expect(children[2].textContent).toBe('Hello, Template!');
	});
});
