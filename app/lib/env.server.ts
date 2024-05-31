/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

function dieForEnv(key: string): never {
  throw new Error(`environment variable ${key} must be set`)
}

export function getEnvOrDie(key: string) {
  const result = process.env[key]
  if (!result) dieForEnv(key)
  return result
}

export function getEnvOrDieInProduction(key: string) {
  const result = process.env[key]
  if (!result) {
    if (process.env.NODE_ENV === 'production') {
      dieForEnv(key)
    }
    console.warn(
      `environment variable ${key} must be set for production. Proceeding anyway since we are in ${process.env.NODE_ENV}`
    )
  }
  return result
}

function getOriginSandbox() {
  const {
    ports: { http },
  } = JSON.parse(getEnvOrDie('ARC_SANDBOX'))
  return `http://localhost:${http}`
}

function getOrigin() {
  return getEnvOrDieInProduction('ORIGIN') || getOriginSandbox()
}

function getHostname() {
  return new URL(getOrigin()).hostname
}

function getDomain() {
  const hostname = getHostname()
  if (hostname === 'gcn.nasa.gov') {
    return undefined
  } else if (hostname === 'dev.gcn.nasa.gov') {
    return 'dev.gcn.nasa.gov'
  } else {
    return 'test.gcn.nasa.gov'
  }
}

function getFeatures() {
  return (
    process.env.GCN_FEATURES?.toUpperCase().split(',').filter(Boolean) ?? []
  )
}

function getSessionSecret() {
  return getEnvOrDieInProduction('SESSION_SECRET') || 'fallback-secret-for-dev'
}

function getStaticBucket() {
  return getEnvOrDie('ARC_STATIC_BUCKET')
}

function getRegion() {
  const result = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION
  if (!result)
    throw new Error('Either AWS_REGION or AWS_DEFAULT_REGION must be defined')
  return result
}

export const origin = /* @__PURE__ */ getOrigin()
export const hostname = /* @__PURE__ */ getHostname()
export const domain = /* @__PURE__ */ getDomain()
export const features = /* @__PURE__ */ getFeatures()
export const sessionSecret = /* @__PURE__ */ getSessionSecret()
export const staticBucket = /* @__PURE__ */ getStaticBucket()
export const region = /* @__PURE__ */ getRegion()

/**
 * Return true if the given feature flag is enabled.
 *
 * Feature flags are configured by the environment variable GCN_FEATURES, which
 * is a comma-separated list of enabled features.
 */
export function feature(feature: string) {
  return features.includes(feature.toUpperCase())
}
