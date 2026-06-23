/**
 * 存储实例默认值的 WeakMap
 *
 * 键为组件/ViewModel 实例，值为字段名到默认值的映射。
 * 在 accessor 尚未创建时（如 @Model 构造函数阶段）暂存默认值
 */
export const DEFAULT_MAP = new WeakMap<any, Record<string, any>>();
