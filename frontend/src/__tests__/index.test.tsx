// Copyright 2024 The Lynx Authors. All rights reserved.
// Licensed under the Apache License Version 2.0 that can be found in the
// LICENSE file in the root directory of this source tree.
import '@testing-library/jest-dom'
import { expect, test, vi } from 'vitest'
import { render, getQueriesForElement } from '@lynx-js/react/testing-library'

import { App } from '../App.jsx'
import App from '../App'

test('App', async () => {
  const cb = vi.fn()

  render(<App />)
  
  // Test that the app renders successfully
  expect(elementTree.root).toBeDefined()
  expect(elementTree.root).toMatchInlineSnapshot(`
    <page>
      <view
        style="background-color:#ff0000;height:100vh;display:flex;align-items:center;justify-content:center"
      >
        <text
          style="color:#ffffff;font-size:24px"
        >
          HELLO LYNX
        </text>
      </view>
    </page>
  `)
  const {
    findByText,
  } = getQueriesForElement(elementTree.root!)
  const element = await findByText('HELLO LYNX')
  expect(element).toBeInTheDocument()
  expect(element).toMatchInlineSnapshot(`
    <text
      style="color:#ffffff;font-size:24px"
    >
      HELLO LYNX
    </text>
  `)
})
