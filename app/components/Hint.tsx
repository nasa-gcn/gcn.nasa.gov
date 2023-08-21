/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import classNames from 'classnames'

/**
 * A component for providing form input hints.
 *
 * @example
 * ```
 * <>
 *   <Label htmlFor="zip">
 *     Zip Code
 *     <Hint>A 5-digit zip code.</Hint>
 *   </Label>
 *   <TextInput id="zip" name="zip" type="number" />
 * </>
 * ```
 * */
export default function Hint({
  children,
  className,
  ...props
}: JSX.IntrinsicElements['div']) {
  return (
    <div className={classNames(['usa-hint', className])} {...props}>
      <small>{children}</small>
    </div>
  )
}
