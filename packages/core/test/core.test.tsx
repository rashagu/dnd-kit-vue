import { expect, test, describe } from 'vitest'
import Comp from "./demo/CoreTest";
import {mount} from "@vue/test-utils";

test('Draggable Test', async () => {
  const wrapper = mount(Comp, {})
  const text = wrapper.get('span').text()
  expect(text).toEqual('handle')
})
