import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Conponent from './conponent.vue';

describe('@Component in SFC', () => {
	it('renders initial count', () => {
		const wrapper = mount(function() {
			return <Conponent />;
		});
		expect(wrapper.find('span').text()).toBe('0');
	});

	it('increments count on button click', async () => {
		const wrapper = mount(function() {
			return <Conponent />;
		});
		expect(wrapper.find('span').text()).toBe('0');

		await wrapper.find('button').trigger('click');
		expect(wrapper.find('span').text()).toBe('1');

		await wrapper.find('button').trigger('click');
		expect(wrapper.find('span').text()).toBe('2');

		await wrapper.find('button').trigger('click');
		expect(wrapper.find('span').text()).toBe('3');
	});
});
