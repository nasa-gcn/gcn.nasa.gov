/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { feature, getFeatures } from '../app/lib/env.server'

describe('features', () => {
  let old: string | undefined

  function setEnv(value: string | undefined) {
    if (value === undefined) delete process.env.GCN_FEATURES
    else process.env.GCN_FEATURES = value
  }

  beforeAll(() => {
    old = process.env.GCN_FEATURES
  })

  afterAll(() => {
    setEnv(old)
  })

  test.each([undefined, '', ',', ',,,'])(
    'environment variable is %p',
    (value) => {
      setEnv(value)
      expect(getFeatures()).toStrictEqual([])
      expect(feature('FOO')).toBe(false)
    }
  )

  test.each(['FOO', 'FOO,', ',,FOO,'])(
    'environment variable contains one feature',
    (value) => {
      setEnv(value)
      expect(getFeatures()).toStrictEqual(['FOO'])
      expect(feature('FOO')).toBe(true)
      expect(feature('BAR')).toBe(false)
    }
  )

  test.each(['FOO,BAR', 'FOO,,BAR', 'FOO,BAR,'])(
    'environment variable contains two features',
    () => {
      setEnv('FOO,BAR')
      expect(getFeatures()).toStrictEqual(['FOO', 'BAR'])
      expect(feature('FOO')).toBe(true)
      expect(feature('BAR')).toBe(true)
      expect(feature('BAT')).toBe(false)
    }
  )
})
