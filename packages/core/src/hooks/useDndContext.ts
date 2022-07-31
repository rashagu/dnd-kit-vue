
import {PublicContext, PublicContextDescriptor} from '../store';
import {inject, ref} from "vue";
import {defaultPublicContext} from "../store/context";

export function useDndContext() {
  return inject('PublicContext', ref<PublicContextDescriptor>(defaultPublicContext)).value;
}

export type UseDndContextReturnValue = any;
