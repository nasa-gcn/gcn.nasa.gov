/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { DataFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import {
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  Icon,
  Table,
} from '@trussworks/react-uswds'
import { dirname } from 'path'
import { useParams } from 'react-router'
import { useWindowSize } from 'usehooks-ts'

import SchemaDefinition from '../docs_.schema.$version._index'
import type { Schema } from './components'
import {
  ReferencedElementTable,
  SchemaPropertiesTableBody,
  formatFieldName,
  formatFieldType,
} from './components'
import { Highlight } from '~/components/Highlight'
import { Tab, Tabs } from '~/components/tabs/Tabs'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import type {
  ExampleFile,
  GitContentDataResponse,
} from '~/lib/schema-data.server'
import {
  getGithubDir,
  loadJson,
  loadSchemaExamples,
} from '~/lib/schema-data.server'

export async function loader({
  params: { version, '*': path },
}: DataFunctionArgs) {
  if (!version) throw new Response('Missing version', { status: 404 })
  let jsonContent
  let data: GitContentDataResponse[]
  let examples: ExampleFile[] = []
  if (path?.endsWith('.schema.json')) {
    const parentPath = dirname(path)
    jsonContent = await loadJson(path, version)
    examples = await loadSchemaExamples(path, version)
    data = await getGithubDir(parentPath, version)
  } else {
    data = await getGithubDir(path, version)
  }
  data = data.filter((x) => !x.name.endsWith('.example.json'))
  return json(
    { data, jsonContent, examples },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}

export default function () {
  const { version, '*': path } = useParams()
  const { data, jsonContent, examples } = useLoaderData<typeof loader>()
  if (!path) {
    throw new Error('Path is not defined.')
  }

  return (
    <div className="grid-col-12">
      {jsonContent ? (
        <SchemaBody
          path={path ?? ''}
          result={jsonContent}
          selectedVersion={version ?? ''}
          examples={examples}
        />
      ) : (
        <>
          <SchemaDefinition />
          <CardGroup>
            {...data.map((x) => (
              <Link key={x.path} to={x.path} className="tablet:grid-col-3">
                <Card key={x.path} className="">
                  <CardHeader>
                    <h3 className="display-flex flex-align-center">
                      {x.type == 'dir' && (
                        <span className="margin-top-05 padding-right-05">
                          <Icon.FolderOpen />
                        </span>
                      )}
                      <span>{x.name.replace('.schema.json', '')}</span>
                    </h3>
                  </CardHeader>
                  <CardBody></CardBody>
                </Card>
              </Link>
            ))}
          </CardGroup>
        </>
      )}
    </div>
  )
}

function SchemaBody({
  path,
  result,
  selectedVersion,
  examples,
}: {
  path: string
  result: Schema
  selectedVersion: string
  examples: ExampleFile[]
}) {
  const windowSize = useWindowSize()

  return (
    <>
      {windowSize.width < 480 && <h1>{result.title}</h1>}
      <p className="usa-paragraph">{result.description}</p>
      <div>
        View the source on{' '}
        <Link
          rel="external"
          to={`https://github.com/nasa-gcn/gcn-schema/blob/${selectedVersion}/${path}`}
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
