import { Computed } from "@/vue/Computed";
import { createComponent } from "@/vue/createComponent";
import { State } from "@/vue/State";
import { use } from "@/vue/use";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('use', () => {
	it('basic state', async () => {
		@ViewModel
		class CounterViewModel {
			@State
			count = 0;

			increase() {
				this.count++;
			}
		}

		@ViewModel
		class AppViewModel {
			counter = use(CounterViewModel);
		}

		function AppView(props: AppViewModel) {
			return <>
				<div>Count: {props.counter.count}</div>
				<button type="button" onClick={props.counter.increase}>+</button>
			</>;
		}
		const App = createComponent(AppView, AppViewModel);

		const wrapper = mount(function() {
			return <App />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 0');

		await wrapper.find('button').trigger('click');
		expect(children[0].textContent).toBe('Count: 1');
	});

	it('state isolation between multiple use()', async () => {
		@ViewModel
		class CounterViewModel {
			@State
			count = 0;

			increase() {
				this.count++;
			}
		}

		@ViewModel
		class AppViewModel {
			counter1 = use(CounterViewModel);
			counter2 = use(CounterViewModel);
		}

		function AppView(props: AppViewModel) {
			return <>
				<div class="c1">Count1: {props.counter1.count}</div>
				<div class="c2">Count2: {props.counter2.count}</div>
				<button type="button" onClick={props.counter1.increase}>+</button>
			</>;
		}
		const App = createComponent(AppView, AppViewModel);

		const wrapper = mount(function() {
			return <App />;
		});

		expect(wrapper.find('.c1').text()).toBe('Count1: 0');
		expect(wrapper.find('.c2').text()).toBe('Count2: 0');

		await wrapper.find('button').trigger('click');
		expect(wrapper.find('.c1').text()).toBe('Count1: 1');
		expect(wrapper.find('.c2').text()).toBe('Count2: 0');
	});

	it('with computed', async () => {
		@ViewModel
		class CounterViewModel {
			@State
			count = 0;

			@Computed
			get doubleCount(): number {
				return this.count * 2;
			}

			increase() {
				this.count++;
			}
		}

		@ViewModel
		class AppViewModel {
			counter = use(CounterViewModel);
		}

		function AppView(props: AppViewModel) {
			return <>
				<div>Count: {props.counter.count}</div>
				<div>Double: {props.counter.doubleCount}</div>
				<button type="button" onClick={props.counter.increase}>+</button>
			</>;
		}
		const App = createComponent(AppView, AppViewModel);

		const wrapper = mount(function() {
			return <App />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 0');
		expect(children[1].textContent).toBe('Double: 0');

		await wrapper.find('button').trigger('click');
		expect(children[0].textContent).toBe('Count: 1');
		expect(children[1].textContent).toBe('Double: 2');
	});

	it('instanceof', () => {
		@ViewModel
		class FooViewModel {
			@State
			value = "hello";
		}

		@ViewModel
		class AppViewModel {
			foo = use(FooViewModel);
		}

		function AppView(props: AppViewModel) {
			return <div>{props.foo.value}</div>;
		}
		const App = createComponent(AppView, AppViewModel);

		const wrapper = mount(function() {
			return <App />;
		});
		expect(wrapper.element.textContent).toBe('hello');
	});

	it('multiple ViewModel composition', async () => {
		@ViewModel
		class LoggerViewModel {
			@State
			logs: string[] = [];

			log(msg: string) {
				this.logs = [...this.logs, msg];
			}
		}

		@ViewModel
		class CounterViewModel {
			@State
			count = 0;

			increase() {
				this.count++;
			}
		}

		@ViewModel
		class AppViewModel {
			logger = use(LoggerViewModel);
			counter = use(CounterViewModel);

			onIncrease() {
				this.counter.increase();
				this.logger.log('increased');
			}
		}

		function AppView(props: AppViewModel) {
			return <>
				<div>Count: {props.counter.count}</div>
				<div>Logs: {props.logger.logs.length}</div>
				<button type="button" onClick={props.onIncrease}>+</button>
			</>;
		}
		const App = createComponent(AppView, AppViewModel);

		const wrapper = mount(function() {
			return <App />;
		});
		const children = wrapper.element.children;
		expect(children[0].textContent).toBe('Count: 0');
		expect(children[1].textContent).toBe('Logs: 0');

		await wrapper.find('button').trigger('click');
		expect(children[0].textContent).toBe('Count: 1');
		expect(children[1].textContent).toBe('Logs: 1');

		await wrapper.find('button').trigger('click');
		expect(children[0].textContent).toBe('Count: 2');
		expect(children[1].textContent).toBe('Logs: 2');
	});
});
