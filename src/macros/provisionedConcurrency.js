/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

// Configure provisioned concurrency
module.exports = function provisionedConcurrency(arc, sam) {
  sam.Resources.AnyCatchallHTTPLambda.Properties.ProvisionedConcurrencyConfig =
    {
      ProvisionedConcurrentExecutions: 1,
    }
  return sam
}
