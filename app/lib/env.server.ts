/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

export function getEnvOrDie(key: string) {
  const result = process.env[key]
  if (!result) throw new Error(`environment variable ${key} must be set`)
  return result
}

export function getEnvOrDieInProduction(key: string) {
  const result = process.env[key]
  if (!result) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`environment variable ${key} must be set`)
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

export function getOrigin() {
  return getEnvOrDieInProduction('ORIGIN') || getOriginSandbox()
}

export function getHostname() {
  return new URL(getOrigin()).hostname
}

export function getFeatures() {
  return (
    process.env.GCN_FEATURES?.toUpperCase().split(',').filter(Boolean) ?? []
  )
}

/**
 * Return true if the given feature flag is enabled.
 *
 * Feature flags are configured by the environment variable GCN_FEATURES, which
 * is a comma-separated list of enabled features.
 */
export function feature(feature: string) {
  const featureUppercase = feature.toUpperCase()
  return getFeatures().includes(featureUppercase)
}
