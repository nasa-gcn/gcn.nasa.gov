/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { Table } from '@trussworks/react-uswds'

import { Highlight } from '~/components/Highlight'
import type { Schema, SchemaProperty } from '~/components/SchemaBrowserElements'
import { SchemaPropertiesTableBody } from '~/components/SchemaBrowserElements'
import { ReferencedElementTable } from '~/components/SchemaBrowserElements'
import { Tab, Tabs } from '~/components/Tabs'
import { loadJson, loadSchemaExamples } from '~/lib/schema-data'

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  if (!path) throw new Response(null, { status: 404 })
  let result: Schema
  if (!path.includes('.schema.json')) throw new Response(null, { status: 404 })
  const examples = await loadSchemaExamples(path)
  result = await loadJson(path)

  return { path, result, examples }
}

export default function () {
  const { path, result, examples } = useLoaderData<typeof loader>()
  const anchor = `#${result.title?.replaceAll(' ', '-')}`
  return (
    <>
      <h1 id={anchor}>
        <a href={anchor}>{result.title ?? path}</a>
      </h1>
      <p className="usa-paragraph">{result.description}</p>
      <div>
        View the source on{' '}
        <Link
          rel="external"
          to={`https://github.com/nasa-gcn/gcn-schema/blob/main/${path}`}
        >
          Github
        </Link>
      </div>
      <h2>Properties</h2>
      <p className="usa-paragraph">
        <small>* = required</small>
      </p>
      {result.properties && (
        <Table stackedStyle="default">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <SchemaPropertiesTableBody schema={result} />
          </tbody>
        </Table>
      )}

      {result.allOf && (
        <>
          <h3>Properties from all of the following:</h3>
          <p className="usa-paragraph">
            These properties are inherited using the <code>allOf</code> syntax.
            In order to validate, all of the following schemas must be
            individually valid, based on their respective properties. See{' '}
            <Link
              rel="external"
              to="https://json-schema.org/understanding-json-schema/reference/combining.html#allof"
            >
              allOf
            </Link>{' '}
            for more information.
          </p>
          <ReferencedElementTable items={result.allOf} />
        </>
      )}

      {result.anyOf && (
        <>
          <h3>Properties from any of the following:</h3>
          <p className="usa-paragraph">
            These properties are inherited using the <code>anyOf</code> syntax.
            In order to validate, at least one of the following schemas must be
            individually valid based on their respective properties. See{' '}
            <Link
              rel="external"
              to="https://json-schema.org/understanding-json-schema/reference/combining.html#anyof"
            >
              anyOf
            </Link>{' '}
            for more information.
          </p>
          <ReferencedElementTable items={result.anyOf} />
        </>
      )}

      {result.oneOf && (
        <>
          <h3>Properties from one of the following:</h3>
          <p className="usa-paragraph">
            These properties are inherited using the <code>oneOf</code> syntax.
            In order to validate, exactly one of the following schemas must be
            individually valid based on their respective properties. See{' '}
            <Link
              rel="external"
              to="https://json-schema.org/understanding-json-schema/reference/combining.html#oneof"
            >
              oneOf
            </Link>{' '}
            for more information.
          </p>
          <ReferencedElementTable items={result.oneOf} />
        </>
      )}

      {result.$defs && (
        <>
          <h3>Locally defined sub-schemas</h3>
          <p className="usa-paragraph">
            These sub-schemas are defined locally within the same{' '}
            <code>.schema.json</code> file as the current schema definition.
          </p>
          <Table fullWidth stackedStyle="headers">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(result.$defs).map((itemKey) => (
                <tr key={itemKey}>
                  <th scope="row">
                    {formatFieldName(itemKey, result.required)}
                  </th>
                  <td>
                    {result.$defs && formatFieldType(result.$defs[itemKey])}
                  </td>
                  <td>
                    {(result.$defs && result.$defs[itemKey].description) ?? ''}
                    {result.$defs && result.$defs[itemKey].enum && (
                      <>
                        <br />
                        Options: {result.$defs[itemKey].enum?.join(', ')}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      {examples.length > 0 && (
        <>
          <h2>Example</h2>
          <Tabs>
            {examples.map((example) => (
              <Tab key={example.name} label={example.name}>
                <Highlight
                  language="json"
                  code={JSON.stringify(example.content, null, 2)}
                />
              </Tab>
            ))}
          </Tabs>
        </>
      )}
    </>
  )
}

function formatFieldName(name: string, requiredProps?: string[]) {
  let formattedName = name
  if (requiredProps && requiredProps.includes(name)) formattedName += '*'
  return formattedName
}

function formatFieldType(item: SchemaProperty): string {
  if (item.type) return item.type
  if (item.enum) return 'enum'
  if (item.$ref) return item.$ref.split('/').slice(-1)[0]
  return ''
}
