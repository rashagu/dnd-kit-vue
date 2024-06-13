
import {PublicContext, type PublicContextDescriptor} from '../store';
import {inject, ref} from "vue";
import {defaultPublicContext} from "../store/context";

export function useDndContext() {
  return inject('PublicContext', ref<PublicContextDescriptor>(defaultPublicContext));
}

export type UseDndContextReturnValue = any;
