import { createComponent } from "@/vue/createComponent";
import { OnDidCatch, OnDidMount, OnDidUnmount, OnDidUpdate, OnWillMount, OnWillUnmount, OnWillUpdate } from "@/vue/lifecycle";
import { Prop } from "@/vue/Prop";
import { State } from "@/vue/State";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from "vue";

describe('lifecycle', () => {
	describe('hooks', () => {
		it('OnWillMount + OnDidMount', async () => {
			const willMountFn = vi.fn();
			const didMountFn = vi.fn();

			function LifecycleView(props: LifecycleViewModel) {
				return <div>Lifecycle</div>;
			}
			@ViewModel
			class LifecycleViewModel {
				@Prop
				willMountFn: Function;
				@Prop
				didMountFn: Function;

				@OnWillMount
				handleWillMount() {
					this.willMountFn();
				}
				@OnDidMount
				handleDidMount() {
					this.didMountFn();
				}
			}
			const LifecycleCom = createComponent(LifecycleView, LifecycleViewModel);

			mount(function(props) {
				return <LifecycleCom {...props} />;
			}, {
				propsData: {
					willMountFn,
					didMountFn,
				}
			});

			await nextTick();
			expect(willMountFn).toHaveBeenCalled();
			expect(didMountFn).toHaveBeenCalled();
		});

		it('OnWillUpdate + OnDidUpdate', async () => {
			const willUpdateFn = vi.fn();
			const didUpdateFn = vi.fn();

			function LifecycleView(props: LifecycleViewModel) {
				return <>
					<div>Count: {props.count}</div>
					<button type="button" onClick={props.increase}>+</button>
				</>;
			}
			@ViewModel
			class LifecycleViewModel {
				@State
				count = 0;

				@Prop
				willUpdateFn: Function;
				@Prop
				didUpdateFn: Function;

				increase() {
					this.count++;
				}

				@OnWillUpdate
				handleWillUpdate() {
					this.willUpdateFn();
				}
				@OnDidUpdate
				handleDidUpdate() {
					this.didUpdateFn();
				}
			}
			const LifecycleCom = createComponent(LifecycleView, LifecycleViewModel);

			const wrapper = mount(function(props) {
				return <LifecycleCom {...props} />;
			}, {
				propsData: {
					willUpdateFn,
					didUpdateFn,
				}
			});

			expect(willUpdateFn).not.toHaveBeenCalled();
			expect(didUpdateFn).not.toHaveBeenCalled();

			await wrapper.find('button').trigger('click');
			await nextTick();

			expect(willUpdateFn).toHaveBeenCalled();
			expect(didUpdateFn).toHaveBeenCalled();
		});

		it('OnWillUnmount + OnDidUnmount', async () => {
			const willUnmountFn = vi.fn();
			const didUnmountFn = vi.fn();

			function LifecycleView(props: LifecycleViewModel) {
				return <div>Lifecycle</div>;
			}
			@ViewModel
			class LifecycleViewModel {
				@Prop
				willUnmountFn: Function;
				@Prop
				didUnmountFn: Function;

				@OnWillUnmount
				handleWillUnmount() {
					this.willUnmountFn();
				}
				@OnDidUnmount
				handleDidUnmount() {
					this.didUnmountFn();
				}
			}
			const LifecycleCom = createComponent(LifecycleView, LifecycleViewModel);

			const wrapper = mount(function(props) {
				return <LifecycleCom {...props} />;
			}, {
				propsData: {
					willUnmountFn,
					didUnmountFn,
				}
			});

			expect(willUnmountFn).not.toHaveBeenCalled();
			expect(didUnmountFn).not.toHaveBeenCalled();

			wrapper.unmount();
			await nextTick();

			expect(willUnmountFn).toHaveBeenCalled();
			expect(didUnmountFn).toHaveBeenCalled();
		});

		it('OnDidCatch', async () => {
			const didCatchFn = vi.fn();

			function ChildView(props: ChildViewModel) {
				return <div>child</div>;
			}
			@ViewModel
			class ChildViewModel {
				@OnDidMount
				throwError() {
					throw new Error('child error');
				}
			}
			const ChildCom = createComponent(ChildView, ChildViewModel);

			function LifecycleView(props: LifecycleViewModel) {
				return <div><ChildCom /></div>;
			}
			@ViewModel
			class LifecycleViewModel {
				@Prop
				didCatchFn: Function;

				@OnDidCatch
				handleError(err: Error) {
					this.didCatchFn(err);
					return false;
				}
			}
			const LifecycleCom = createComponent(LifecycleView, LifecycleViewModel);

			mount(function(props) {
				return <LifecycleCom {...props} />;
			}, {
				propsData: {
					didCatchFn,
				}
			});

			await nextTick();
			expect(didCatchFn).toHaveBeenCalled();
			expect(didCatchFn.mock.calls[0][0]).toBeInstanceOf(Error);
		});
	});
});
