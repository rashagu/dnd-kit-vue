import { expect, test, describe } from 'vitest'
import Comp from "./demo1/SortableDemo1";
import {mount} from "@vue/test-utils";

test('SortableDemo1 test', async () => {
  const wrapper = mount(Comp, {})
  const text = wrapper.findAll('div[aria-roledescription="sortable"]')
  expect(text.length).toEqual(10)
})
