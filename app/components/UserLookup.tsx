/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useFetcher } from '@remix-run/react'
import type { action } from 'app/routes/api.users'
import classnames from 'classnames'
import type { UseComboboxProps, UseComboboxStateChange } from 'downshift'
import { useCombobox } from 'downshift'
import debounce from 'lodash/debounce.js'
import { useCallback, useEffect, useState } from 'react'

import { formatAuthor } from '~/routes/circulars/circulars.lib'

import loaderImage from 'nasawds/src/img/loader.gif'

export interface UserLookup {
  sub?: string
  email: string
  name?: string
  affiliation?: string
}

interface UserComboBoxProps
  extends Omit<
    UseComboboxProps<UserLookup>,
    'items' | 'onInputValueChange' | 'itemToString'
  > {
  disabled?: boolean
  className?: string
  group?: string
  onChange?: () => void
}

interface UserComboBoxHandle {
  reset?: () => void
}

export function UserLookupComboBox({
  disabled,
  className,
  group,
  onChange,
  // ref,
  ...props
}: UserComboBoxProps & UserComboBoxHandle) {
  const fetcher = useFetcher<typeof action>()
  const [items, setItems] = useState<UserLookup[]>([])

  useEffect(() => {
    setItems(fetcher.data?.users ?? [])
  }, [fetcher.data])

  if (onChange) onChange()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onInputValueChange = useCallback(
    debounce(
      ({ inputValue, isOpen }: UseComboboxStateChange<UserLookup>) => {
        if (inputValue && isOpen) {
          const data = new FormData()
          data.set('filter', inputValue.split(' ')[0])
          data.set('intent', 'filter')
          data.set('group', group ?? '')
          fetcher.submit(data, { method: 'POST', action: '/api/users' })
        } else {
          setItems([])
        }
      },
      500,
      { trailing: true }
    ),
    []
  )

  const {
    reset,
    isOpen,
    highlightedIndex,
    selectedItem,
    getMenuProps,
    getInputProps,
    getItemProps,
    getToggleButtonProps,
  } = useCombobox<UserLookup>({
    items,
    onInputValueChange,
    itemToString(item) {
      return item ? formatAuthor(item) : ''
    },
    ...props,
  })

  const loading = fetcher.state === 'submitting'
  const pristine = Boolean(selectedItem)

  return (
    <div
      data-testid="combo-box"
      data-enhanced="true"
      className={classnames('usa-combo-box', className, {
        'usa-combo-box--pristine': pristine || loading,
      })}
    >
      <input
        autoCapitalize="off"
        autoComplete="off"
        className="usa-combo-box__input"
        disabled={disabled}
        {...getInputProps()}
        // Funky escape sequence is a zero-width character to prevent Safari
        // from attempting to autofill the user's own email address, which
        // would be triggered by the presence of the string "email" in the
        // placeholder.
        placeholder="Name or em&#8203;ail address of user"
      />
      <span className="usa-combo-box__clear-input__wrapper" tabIndex={-1}>
        <button
          type="button"
          className="usa-combo-box__clear-input"
          aria-label="Clear the select contents"
          style={
            loading ? { backgroundImage: `url('${loaderImage}')` } : undefined
          }
          onClick={() => reset()}
          hidden={(!pristine || disabled) && !loading}
          disabled={disabled}
        >
          &nbsp;
        </button>
      </span>
      <span className="usa-combo-box__input-button-separator">&nbsp;</span>
      <span className="usa-combo-box__toggle-list__wrapper" tabIndex={-1}>
        <button
          type="button"
          className="usa-combo-box__toggle-list"
          {...getToggleButtonProps()}
        >
          &nbsp;
        </button>
      </span>
      <ul
        {...getMenuProps()}
        className="usa-combo-box__list"
        role="listbox"
        hidden={!isOpen}
      >
        {isOpen &&
          (items.length ? (
            items.map((item, index) => (
              <li
                key={item.sub}
                className={classnames('usa-combo-box__list-option', {
                  'usa-combo-box__list-option--focused':
                    index === highlightedIndex,
                  'usa-combo-box__list-option--selected':
                    selectedItem?.sub === item.sub,
                })}
                {...getItemProps({ item, index })}
              >
                {formatAuthor(item)}
              </li>
            ))
          ) : (
            <li className="usa-combo-box__list-option--no-results">
              No results found
            </li>
          ))}
      </ul>
    </div>
  )
}
