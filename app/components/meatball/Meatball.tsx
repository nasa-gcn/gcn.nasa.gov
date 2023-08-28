/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import logo from './logo.svg'

export function Meatball(
  props: Omit<JSX.IntrinsicElements['img'], 'src' | 'alt' | 'width' | 'height'>
) {
  return (
    <img {...props} src={logo} alt="NASA logo" width={311.62} height={257.99} />
  )
}
