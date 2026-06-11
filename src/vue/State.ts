import { EsAccessorDecorator, EsFieldDecorator, LegacyPropertyDecorator } from "@/decorator/types";
import { metadata } from "@/metadata/metadata";

type StateDecorator<This extends object, Value> = EsFieldDecorator<This, Value> & EsAccessorDecorator<This, Value> & LegacyPropertyDecorator<This>;

export const State: StateDecorator<object, any> = metadata('state', true);
