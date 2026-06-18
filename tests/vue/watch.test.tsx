import { Model } from "@/model/Model";
import { createComponent } from "@/vue/createComponent";
import { OnDidCreate } from "@/vue/lifecycle";
import { Reactive } from "@/vue/Reactive";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { Watch } from "@/vue/Watch";
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

describe('watch', () => {
	it('string source', async () => {
		let changed: string;
		@ViewModel
		class WatchViewModel {
			@State
			name = 'initial';

			@Watch('name')
			protected onNameChange(newValue: string, oldValue: string) {
				changed = `new:${newValue}, old:${oldValue}`;
			}

			rename(value: string) {
				this.name = value;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.name}</div>
				<button type="button" onClick={() => props.rename('changed')}>rename</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('initial');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('changed');
		expect(changed).toBe('new:changed, old:initial');
	});

	it('arrow function source (inst => inst.xxx)', async () => {
		let changed: string;
		@ViewModel
		class WatchViewModel {
			@State
			count = 0;

			@Watch((inst: WatchViewModel) => inst.count)
			protected onCountChange(newValue: number, oldValue: number) {
				changed = `new:${newValue}, old:${oldValue}`;
			}

			increment() {
				this.count++;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.count}</div>
				<button type="button" onClick={props.increment}>+</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('0');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('1');
		expect(changed).toBe('new:1, old:0');
	});

	it('regular function source (function() { return this.xxx })', async () => {
		let changed: string;
		@ViewModel
		class WatchViewModel {
			@State
			title = 'old';

			@Watch(function(this: WatchViewModel) { return this.title; })
			protected onTitleChange(newValue: string, oldValue: string) {
				changed = `new:${newValue}, old:${oldValue}`;
			}

			updateTitle(value: string) {
				this.title = value;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.title}</div>
				<button type="button" onClick={() => props.updateTitle('new')}>update</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('old');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('new');
		expect(changed).toBe('new:new, old:old');
	});

	it('immediate option', async () => {
		let immediateValue: string;
		let changeValue: string;
		@ViewModel
		class WatchViewModel {
			@State
			status = 'ready';

			@Watch('status', { immediate: true })
			protected onStatusChange(newValue: string, oldValue: string) {
				if(oldValue === undefined) {
					immediateValue = `immediate:${newValue}`;
				} else {
					changeValue = `new:${newValue}, old:${oldValue}`;
				}
			}

			updateStatus(value: string) {
				this.status = value;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.status}</div>
				<button type="button" onClick={() => props.updateStatus('done')}>done</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('ready');
		expect(immediateValue).toBe('immediate:ready');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('done');
		expect(changeValue).toBe('new:done, old:ready');
	});

	it('deep option', async () => {
		let changed: string;
		@Model
		class Nested {
			name: string;
		}
		@ViewModel
		class WatchViewModel {
			@Reactive(Nested)
			obj: Nested;

			@Watch('obj', { deep: true })
			protected onObjChange(newValue: any, oldValue: any) {
				changed = `new:${newValue.name}, old:${oldValue.name}`;
			}

			@OnDidCreate
			created() {
				this.obj = { name: 'hello' } as Nested;
			}

			updateNested() {
				this.obj.name = 'world';
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.obj.name}</div>
				<button type="button" onClick={props.updateNested}>update</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('hello');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('world');
		expect(changed).toBe('new:world, old:world');
	});

	it('multiple watch handlers', async () => {
		let lastNameChange: string;
		let firstNameChange: string;
		@ViewModel
		class WatchViewModel {
			@State
			firstName = 'John';

			@State
			lastName = 'Doe';

			@Watch('firstName')
			protected onFirstNameChange(newValue: string, oldValue: string) {
				firstNameChange = `new:${newValue}, old:${oldValue}`;
			}

			@Watch((inst: WatchViewModel) => inst.lastName)
			protected onLastNameChange(newValue: string, oldValue: string) {
				lastNameChange = `new:${newValue}, old:${oldValue}`;
			}

			updateFirstName(value: string) {
				this.firstName = value;
			}
			updateLastName(value: string) {
				this.lastName = value;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.firstName} {props.lastName}</div>
				<button type="button" id="first" onClick={() => props.updateFirstName('Jane')}>f</button>
				<button type="button" id="last" onClick={() => props.updateLastName('Smith')}>l</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('John Doe');

		await wrapper.find('#first').trigger('click');
		expect(firstNameChange).toBe('new:Jane, old:John');
		expect(lastNameChange).toBeUndefined();

		await wrapper.find('#last').trigger('click');
		expect(lastNameChange).toBe('new:Smith, old:Doe');
	});

	it('watch with expression using arrow function source', async () => {
		let changed: string;
		@ViewModel
		class WatchViewModel {
			@State
			a = 1;

			@State
			b = 2;

			@Watch((inst: WatchViewModel) => inst.a + inst.b)
			protected onSumChange(newValue: number, oldValue: number) {
				changed = `new:${newValue}, old:${oldValue}`;
			}

			updateA(value: number) {
				this.a = value;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.a + props.b}</div>
				<button type="button" onClick={() => props.updateA(10)}>update</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('3');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('12');
		expect(changed).toBe('new:12, old:3');
	});

	it('regular function source using this', async () => {
		let calls: string[] = [];
		@ViewModel
		class WatchViewModel {
			@State
			count = 0;

			@State
			step = 1;

			@Watch(function(this: WatchViewModel) {
				return this.count * this.step;
			})
			protected onScaledChange(newValue: number, oldValue: number) {
				calls.push(`new:${newValue}, old:${oldValue}`);
			}

			next() {
				this.count += this.step;
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.count}</div>
				<button type="button" onClick={props.next}>next</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});

		await wrapper.find('button').trigger('click');
		expect(calls).toEqual(['new:1, old:0']);

		await wrapper.find('button').trigger('click');
		expect(calls).toEqual(['new:1, old:0', 'new:2, old:1']);
	});

	it('string source for nested property path', async () => {
		let changed: string;
		@ViewModel
		class WatchViewModel {
			@State
			user = { profile: { name: 'Alice' } };

			@Watch('user')
			protected onUserChange(newValue: any, oldValue: any) {
				changed = `new:${newValue.profile.name}, old:${oldValue.profile.name}`;
			}

			rename(value: string) {
				this.user = { profile: { name: value } };
			}
		}
		function WatchView(props: WatchViewModel) {
			return <>
				<div>{props.user.profile.name}</div>
				<button type="button" onClick={() => props.rename('Bob')}>rename</button>
			</>;
		}
		const WatchCom = createComponent(WatchView, WatchViewModel);
		const wrapper = mount(function() {
			return <WatchCom />;
		});
		expect(wrapper.element.children[0].textContent).toBe('Alice');

		const button = wrapper.find('button');
		await button.trigger('click');
		expect(wrapper.element.children[0].textContent).toBe('Bob');
		expect(changed).toBe('new:Bob, old:Alice');
	});
});
