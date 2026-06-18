import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import HelloWorld from './HelloWorld.vue';
import OptionsApi from './OptionsApi.vue';

describe('HelloWorld.vue', () => {
	it('renders the correct message', () => {
		const wrapper = mount(HelloWorld);
		expect(wrapper.text()).toContain('Hello, World!');
	});
	it('incorrect options api', () => {
		const wrapper = mount(OptionsApi);
		expect(wrapper.text()).not.toContain('Hello, World!');
	});
});
