/**
 * vue-clazz-decorator 主入口模块
 *
 * 提供基于装饰器的 Vue 类组件开发方案，包括：
 * - 组件装饰器（@Component、@ViewModel）
 * - 属性装饰器（@Prop、@State、@Ref、@Inject、@Provide、@ModelValue）
 * - 方法装饰器（@Watch、@Emit、生命周期钩子）
 * - 数据模型装饰器（@Model、@Type、@Json...）
 * - 元数据反射 API
 *
 * @module vue-clazz-decorator
 */
export { nextTick } from "vue";
export * from "./decorator/types";
export * from "./metadata/defineClassMetadata";
export * from "./metadata/defineFieldMetadata";
export * from "./metadata/defineMetadata";
export * from "./metadata/deleteMetadata";
export * from "./metadata/getClassMetadataValues";
export * from "./metadata/getFieldMetadataValues";
export * from "./metadata/getMetadata";
export * from "./metadata/getMetadataKeys";
export * from "./metadata/getOwnMetadata";
export * from "./metadata/getOwnMetadataKeys";
export * from "./metadata/hasMetadata";
export * from "./metadata/hasOwnMetadata";
export * from "./metadata/metadata";
export * from "./model/ArrayType";
export * from "./model/From";
export * from "./model/hydrate";
export * from "./model/Json";
export * from "./model/Model";
export * from "./model/normalize";
export * from "./model/reactive";
export * from "./model/Type";
export * from "./vue/Component";
export * from "./vue/Computed";
export * from "./vue/createComponent";
export * from "./vue/Inject";
export * from "./vue/lifecycle";
export * from "./vue/Prop";
export * from "./vue/Provide";
export * from "./vue/Ref";
export * from "./vue/signals";
export * from "./vue/State";
export * from "./vue/use";
export * from "./vue/useChildren";
export * from "./vue/ViewModel";
export * from "./vue/Watch";

