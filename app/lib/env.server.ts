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

export function getEnvBannerHeaderAndDescription() {
  const production_hostname = 'gcn.nasa.gov'
  const hostname = getHostname()
  let heading, description
  if (hostname === `dev.${production_hostname}`) {
    heading = 'Development'
    description = 'the internal development version'
  } else if (hostname === `test.${production_hostname}`) {
    heading = 'Testing'
    description = 'the public testing version'
  } else if (hostname === 'localhost') {
    heading = 'Local Development'
    description = 'a local development version'
  } else {
    heading = 'Non-Production'
    description = 'a non-production version'
  }

  return { heading, description }
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
