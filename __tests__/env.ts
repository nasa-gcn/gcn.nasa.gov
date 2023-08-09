/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type * as EnvModule from '../app/lib/env.server'

let oldEnv: typeof process.env
beforeEach(() => {
  oldEnv = { ...process.env }
})
afterEach(() => {
  process.env = { ...oldEnv }
})

function importEnv() {
  let result: typeof EnvModule
  jest.isolateModules(() => {
    result = require('../app/lib/env.server')
  })
  // result is assigned by the above call to isolatedModulesAsync
  return result!
}

function setEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
}

describe('features', () => {
  const key = 'GCN_FEATURES'

  // ORIGIN must be defined
  beforeEach(() => {
    setEnv('ORIGIN', 'http://example.gov')
  })

  test.each([undefined, '', ',', ',,,'])(
    'environment variable is %p',
    async (value) => {
      setEnv(key, value)
      const { feature, features } = importEnv()
      expect(features).toStrictEqual([])
      expect(feature('FOO')).toBe(false)
    }
  )

  test.each(['FOO', 'FOO,', ',,FOO,'])(
    'environment variable contains one feature',
    async (value) => {
      setEnv(key, value)
      const { feature, features } = importEnv()
      expect(features).toStrictEqual(['FOO'])
      expect(feature('FOO')).toBe(true)
      expect(feature('BAR')).toBe(false)
    }
  )

  test.each(['FOO,BAR', 'FOO,,BAR', 'FOO,BAR,'])(
    'environment variable contains two features',
    () => {
      setEnv(key, 'FOO,BAR')
      const { feature, features } = importEnv()
      expect(features).toStrictEqual(['FOO', 'BAR'])
      expect(feature('FOO')).toBe(true)
      expect(feature('BAR')).toBe(true)
      expect(feature('BAT')).toBe(false)
    }
  )
})

describe('getEnvOrDie', () => {
  const key = 'FOO'

  beforeEach(() => {
    setEnv('ORIGIN', 'http://example.gov')
  })

  test('returns the value if the environment variable exists', () => {
    setEnv(key, 'BAR')
    const { getEnvOrDie } = importEnv()
    expect(getEnvOrDie(key)).toStrictEqual('BAR')
  })

  test.each([undefined, ''])(
    'throws if the environment variable is %p',
    (value) => {
      setEnv(key, value)
      const { getEnvOrDie } = importEnv()
      expect(() => {
        getEnvOrDie('FOO')
      }).toThrow()
    }
  )
})

describe('getOrigin', () => {
  const key = 'ORIGIN'

  test('gets sandbox origin when ORIGIN is not defined', () => {
    setEnv('ARC_SANDBOX', JSON.stringify({ ports: { http: 1234 } }))
    const { origin } = importEnv()
    expect(origin).toBe('http://localhost:1234')
  })

  test('gets env.ORIGIN when ORIGIN is defined', () => {
    setEnv(key, 'https://gcn.nasa.gov')
    const { origin } = importEnv()
    expect(origin).toBe('https://gcn.nasa.gov')
  })
})

describe('getHostname', () => {
  test('returns localhost when ORIGIN is not defined', () => {
    setEnv('ORIGIN', undefined)
    setEnv('ARC_SANDBOX', JSON.stringify({ ports: { http: 1234 } }))
    const { hostname } = importEnv()
    expect(hostname).toBe('localhost')
  })

  test('returns dev.gcn.nasa.gov when ORIGIN is https://dev.gcn.nasa.gov', () => {
    setEnv('ORIGIN', 'https://dev.gcn.nasa.gov')
    setEnv('ARC_SANDBOX', JSON.stringify({ ports: { http: 1234 } }))
    const { hostname } = importEnv()
    expect(hostname).toBe('dev.gcn.nasa.gov')
  })
})

describe('getEnvOrDieInProduction', () => {
  const key = 'FOO'

  // ORIGIN must be defined
  beforeEach(() => {
    setEnv('ORIGIN', 'http://example.gov')
  })

  test('returns undefined if the variable does not exist', () => {
    setEnv('TEST', undefined)
    const { getEnvOrDieInProduction } = importEnv()
    expect(getEnvOrDieInProduction('TEST')).toBe(undefined)
  })

  test('throws an error in production', () => {
    setEnv('TEST', undefined)
    setEnv('NODE_ENV', 'production')
    const { getEnvOrDieInProduction } = importEnv()
    expect(() => getEnvOrDieInProduction('TEST')).toThrow(
      'environment variable TEST must be set'
    )
  })

  test('returns the value if the environment variable exists', () => {
    setEnv(key, 'BAR')
    const { getEnvOrDieInProduction } = importEnv()
    expect(getEnvOrDieInProduction(key)).toStrictEqual('BAR')
  })
})
