/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { Link, useResolvedPath } from '@remix-run/react'
import { Icon, Table } from '@trussworks/react-uswds'
import { useState } from 'react'

import styles from './TableColumns.module.css'

export type ReferencedSchema = {
  $ref: string
  type: string
  schema?: Schema
}

export type SchemaProperty = {
  description: string
  type?: string | string[]
  enum?: string[]
  $ref?: string
}

export type Schema = {
  $id: string
  $schema?: string
  type: string
  title?: string
  description?: string
  properties?: { [key: string]: SchemaProperty }
  enum?: string[]
  $defs?: { [key: string]: SchemaProperty }
  anyOf?: ReferencedSchema[]
  allOf?: ReferencedSchema[]
  oneOf?: ReferencedSchema[]
  required?: string[]
}

function useLinkString(path: string) {
  return useResolvedPath(`../${path}`, {
    relative: 'path',
  })
}

function ReferencedElementRow({ item }: { item: ReferencedSchema }) {
  const [showHiddenRow, toggleHiddenRow] = useState(false)
  const locallyDefined = item.$ref?.startsWith('#')
  const linkString = useLinkString(item.$ref ?? '')
  return (
    <>
      <tr onClick={() => toggleHiddenRow(!showHiddenRow)}>
        {locallyDefined ? (
          <>
            <td colSpan={2}>
              {item.$ref && item.$ref.split('/').slice(-1)[0]}
            </td>
            <td>See below</td>
          </>
        ) : (
          <>
            <td colSpan={2}>
              {showHiddenRow ? (
                <Icon.ExpandLess aria-label="Collapse" />
              ) : (
                <Icon.ExpandMore aria-label="Expand" />
              )}
              <Link className="usa-link" to={linkString}>
                {item.$ref && item.$ref.split('/').slice(-1)[0]}
              </Link>
            </td>
            <td className={styles.TableColumns}>
              {item.$ref && item.$ref.split('/').slice(-2)[0]} schema object{' '}
              <small>(click to {showHiddenRow ? 'collapse' : 'expand'})</small>
            </td>
          </>
        )}
      </tr>
      {!locallyDefined && item.schema && showHiddenRow && (
        <SchemaPropertiesTableBody schema={item.schema} indent />
      )}
    </>
  )
}

export function ReferencedElementTable({
  items,
}: {
  items: ReferencedSchema[]
}) {
  return (
    <Table fullWidth stackedStyle="headers">
      <thead>
        <tr>
          <th colSpan={2}>Name</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <ReferencedElementRow item={item} key={item.$ref} />
        ))}
      </tbody>
    </Table>
  )
}

export function SchemaPropertiesTableBody({
  schema,
  indent,
}: {
  schema: Schema
  indent?: boolean
}) {
  return (
    <>
      {schema.properties &&
        Object.keys(schema.properties).map((itemKey) => (
          <tr key={itemKey}>
            <th scope="row" className={indent ? 'text-indent-4' : ''}>
              {formatFieldName(itemKey, schema.required)}
            </th>
            <td>
              {schema.properties && formatFieldType(schema.properties[itemKey])}
            </td>
            <td className={styles.TableColumns}>
              {(schema.properties && schema.properties[itemKey].description) ??
                ''}
              {schema.properties && schema.properties[itemKey].enum && (
                <>
                  <br />
                  Options: {schema.properties[itemKey].enum?.join(', ')}
                </>
              )}
            </td>
          </tr>
        ))}
    </>
  )
}

export function formatFieldName(name: string, requiredProps?: string[]) {
  let formattedName = name
  if (requiredProps && requiredProps.includes(name)) formattedName += '*'
  return formattedName
}

export function formatFieldType(item: SchemaProperty): string {
  if (typeof item.type === 'object') return item.type.join(' | ')
  if (item.type) return item.type
  if (item.enum) return 'enum'
  if (item.$ref) return item.$ref.split('/').slice(-1)[0]
  return ''
}
