import { createComponent } from "@/vue/createComponent";
import { Prop } from "@/vue/Prop";
import { ViewModel } from "@/vue/ViewModel";
import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

function CallBackView(props: CallBackViewModel) {
	return <div>
		<button type="button" onClick={props.onClick}></button>
	</div>;
}

@ViewModel
export class CallBackViewModel {
	/** 传入断言函数 */
	@Prop
	assert: Function;

	onClick() {
		Reflect.apply(this.assert, this, arguments);
	}
}

export const CallBackCom = createComponent(CallBackView, CallBackViewModel);

describe('event', () => {
	it('experimental', async () => {
		// 创建函数监视器
		const assertCalled = vi.fn();

		const wrapper = mount(function(props) {
			return <CallBackCom {...props} />;
		}, {
			propsData: {
				assert() {
					assertCalled();
					expect(this).toBeInstanceOf(CallBackViewModel);
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
