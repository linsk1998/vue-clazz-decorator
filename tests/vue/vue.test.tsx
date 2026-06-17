import { createComponent } from "@/vue/createComponent";
import { Prop } from "@/vue/Prop";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Template from './template.vue';
import Vapor from './vapor.vue';

describe('vue file as template (direct SFC)', () => {

	it('SFC pass-through without ViewModel', () => {
		const wrapper = mount(function() {
			return <Template title="Pass-through" />;
		});
		expect(wrapper.find('div').text()).toBe('Pass-through:');
	});

	it('SFC + ViewModel with @State', () => {
		@ViewModel
		class AppViewModel {
			@State
			title = 'Hello';
		}

		const App = createComponent(Template, AppViewModel);
		const wrapper = mount(function() {
			return <App />;
		});
		expect(wrapper.find('div').text()).toBe('Hello:');
	});

	it('SFC + ViewModel with default slot', () => {
		@ViewModel
		class AppViewModel {
			@State
			title = 'Hello';
		}

		const App = createComponent(Template, AppViewModel);
		const wrapper = mount(function() {
			return <App>SFC</App>;
		});
		expect(wrapper.find('div').text()).toBe('Hello:SFC');
	});

	it('SFC + ViewModel with @Prop decorator', () => {
		@ViewModel
		class AppViewModel {
			@Prop
			title: string;
		}

		const App = createComponent(Template, AppViewModel);
		const wrapper = mount(function(props: Record<string, any>) {
			return <App {...props} />;
		}, {
			propsData: {
				title: 'Prop from parent'
			}
		});
		expect(wrapper.find('div').text()).toBe('Prop from parent:');
	});

	it('Vapor SFC + ViewModel with @State', () => {
		@ViewModel
		class AppViewModel {
			@State
			title = 'Hello from Vapor';
		}
		const App = createComponent(Vapor, AppViewModel);
		const wrapper = mount(function() {
			return <App />;
		});
		expect(wrapper.find('div').text()).toBe('Hello from Vapor');
	});

});
