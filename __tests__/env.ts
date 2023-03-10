/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import { feature, getEnvOrDie, getFeatures } from '../app/lib/env.server'

let oldEnv: typeof process.env
beforeEach(() => {
  oldEnv = process.env
})
afterEach(() => {
  process.env = { ...oldEnv }
})

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
}

describe('features', () => {
  const key = 'GCN_FEATURES'

  test.each([undefined, '', ',', ',,,'])(
    'environment variable is %p',
    (value) => {
      setEnv(key, value)
      expect(getFeatures()).toStrictEqual([])
      expect(feature('FOO')).toBe(false)
    }
  )

  test.each(['FOO', 'FOO,', ',,FOO,'])(
    'environment variable contains one feature',
    (value) => {
      setEnv(key, value)
      expect(getFeatures()).toStrictEqual(['FOO'])
      expect(feature('FOO')).toBe(true)
      expect(feature('BAR')).toBe(false)
    }
  )

  test.each(['FOO,BAR', 'FOO,,BAR', 'FOO,BAR,'])(
    'environment variable contains two features',
    () => {
      setEnv(key, 'FOO,BAR')
      expect(getFeatures()).toStrictEqual(['FOO', 'BAR'])
      expect(feature('FOO')).toBe(true)
      expect(feature('BAR')).toBe(true)
      expect(feature('BAT')).toBe(false)
    }
  )
})

describe('getEnvOrDie', () => {
  const key = 'FOO'

  test('returns the value if the environment variable exists', () => {
    setEnv(key, 'BAR')
    expect(getEnvOrDie(key)).toStrictEqual('BAR')
  })

  test.each([undefined, ''])(
    'throws if the environment variable is %p',
    (value) => {
      setEnv(key, value)
      expect(() => {
        getEnvOrDie('FOO')
      }).toThrow()
    }
  )
})
