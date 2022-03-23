/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Use https URL for static bucket proxy
// FIXME: remove once https://github.com/architect/package/pull/150 has been merged
module.exports = function httpsBucketUrl(arc, sam) {
  sam.Resources.HTTP.Properties.DefinitionBody.paths['/_static/{proxy+}'].get[
    'x-amazon-apigateway-integration'
  ].uri['Fn::Sub'][0] = sam.Resources.HTTP.Properties.DefinitionBody.paths[
    '/_static/{proxy+}'
  ].get['x-amazon-apigateway-integration'].uri['Fn::Sub'][0].replace(
    'http://',
    'https://'
  )
  return sam
}
