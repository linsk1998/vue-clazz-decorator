import { metadata } from "@/metadata/metadata";
import type { AutoPropertyDecorator } from "../decorator/types";

type StateDecorator<This extends object, Value> = AutoPropertyDecorator<This, Value>;

export const State: StateDecorator<object, any> = metadata('state', true);
