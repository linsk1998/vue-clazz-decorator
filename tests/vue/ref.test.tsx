import { createComponent } from "@/vue/createComponent";
import { Prop } from "@/vue/Prop";
import { Ref } from "@/vue/Ref";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';


describe('ref', () => {
	it('dom', async () => {
		function RefView(props: RefViewModel) {
			return <div>
				<button ref="button" type="button" onClick={props.onClick}>Caption</button>
			</div>;
		}

		@ViewModel
		class RefViewModel {
			/** 传入断言函数 */
			@Prop
			assert: Function;

			@Ref
			button: HTMLButtonElement;
			@Ref('button')
			button2: HTMLButtonElement;

			onClick() {
				Reflect.apply(this.assert, this, [this.button, this.button2]);
			}
		}

		const RefCom = createComponent(RefView, RefViewModel);

		// 创建函数监视器
		const assertCalled = vi.fn();

		const wrapper = mount(function(props) {
			return <RefCom {...props} />;
		}, {
			propsData: {
				assert(btn: HTMLButtonElement, btn2: HTMLButtonElement) {
					assertCalled();
					expect(btn.tagName).toBe("BUTTON");
					expect(btn.type).toBe("button");
					expect(btn.innerHTML).toBe("Caption");
					expect(btn).toBe(btn2);
				}
			}
		});

		// 找到按钮并模拟点击
		const button = wrapper.find('button');
		await button.trigger('click');

		// 断言函数被调用
		expect(assertCalled).toHaveBeenCalled();

		// 清理监视器
		assertCalled.mockRestore();
	});
	it('component', async () => {
		@ViewModel
		class CatViewModel {
			name = "Tom";
		}
		function CatView(props: CatViewModel) {
			return <div>{props.name}</div>;
		}
		const Cat = createComponent(CatView, CatViewModel);

		@ViewModel
		class RefViewModel {
			/** 传入断言函数 */
			@Prop
			assert: Function;

			@Ref
			cat: CatViewModel;

			onClick() {
				Reflect.apply(this.assert, this, [this.cat]);
			}
		}
		function RefView(props: RefViewModel) {
			return <>
				<Cat ref="cat" />
				<button ref="button" type="button" onClick={props.onClick}>Caption</button>
			</>;
		}

		const RefCom = createComponent(RefView, RefViewModel);

		// 创建函数监视器
		const assertCalled = vi.fn();

		const wrapper = mount(function(props) {
			return <RefCom {...props} />;
		}, {
			propsData: {
				assert(cat: CatViewModel) {
					assertCalled();
					expect(cat instanceof CatViewModel).toBe(true);
					expect(cat.name).toBe("Tom");
					expect('$' in cat).toBe(false);
				}
			}
		});

		// 找到按钮并模拟点击
		const button = wrapper.find('button');
		await button.trigger('click');

		// 断言函数被调用
		expect(assertCalled).toHaveBeenCalled();

		// 清理监视器
		assertCalled.mockRestore();
	});
});
