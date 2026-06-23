import { useSlots } from "vue";

/**
 * 获取默认插槽的子节点
 *
 * 封装 `useSlots().default?.()` 调用，用于在组件中渲染子组件内容
 *
 * @returns 子节点 VNode 数组或 undefined
 */
export function useChildren() {
	return useSlots().default?.();
}
