/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { type LoaderFunctionArgs, json, redirect } from '@remix-run/node'
import { Link, useLoaderData, useRouteLoaderData } from '@remix-run/react'
import {
  Card,
  CardBody,
  CardGroup,
  CardHeader,
  Grid,
  Icon,
  Table,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import { dirname } from 'path'
import { useRef, useState } from 'react'
import { useParams } from 'react-router'
import invariant from 'tiny-invariant'
import { useOnClickOutside } from 'usehooks-ts'

import type { loader as parentLoader } from '../docs_._schema-browser'
import type { Schema } from './components'
import {
  ReferencedElementTable,
  SchemaPropertiesTableBody,
  formatFieldName,
  formatFieldType,
} from './components'
import Documentation from './documentation.md'
import DetailsDropdownButton from '~/components/DetailsDropdownButton'
import DetailsDropdownContent from '~/components/DetailsDropdownContent'
import { Highlight } from '~/components/Highlight'
import { Tab, Tabs } from '~/components/tabs'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import { exampleSuffix, schemaSuffix } from '~/lib/schema-data'
import type {
  ExampleFile,
  GitContentDataResponse,
} from '~/lib/schema-data.server'
import {
  getGithubDir,
  getLatestRelease,
  loadJson,
  loadSchemaExamples,
} from '~/lib/schema-data.server'
import type { BreadcrumbHandle } from '~/root/Title'

export const handle: BreadcrumbHandle = {
  breadcrumb({ params: { version, '*': path } }) {
    return `${version} - ${path?.replace(schemaSuffix, '')}`
  },
}

export async function loader({
  params: { version, '*': path },
}: LoaderFunctionArgs) {
  if (version === 'stable') version = undefined
  if (!version || !path) {
    version ||= await getLatestRelease()
    path ||= 'gcn/notices'
    return redirect(`/docs/schema/${version}/${path}`, {
      headers: publicStaticShortTermCacheControlHeaders,
    })
  }

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
  data = data.filter((x) => !x.name.endsWith(exampleSuffix))
  return json(
    { data, jsonContent, examples },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}

function Breadcrumbs({
  className,
  path,
}: {
  className?: string
  path: string
}) {
  const parts = path.split('/')
  const last = parts.pop()
  const countParts = parts.length
  return (
    <>
      {parts.map((part, i) => {
        return (
          <span key={i}>
            <Link
              className={classNames('usa-link text-no-underline', className)}
              to={new Array(countParts - i).fill('..').join('/')}
              relative="path"
            >
              {part}
            </Link>
            <Icon.NavigateNext role="presentation" className="text-base" />
          </span>
        )
      })}
      <b className={className}>{last}</b>
    </>
  )
}

function VersionSelector({
  version,
  versions,
  path,
}: {
  version: string
  versions: { name: string | null; ref: string }[]
  path: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [showContent, setShowContent] = useState(false)
  useOnClickOutside(ref, () => {
    setShowContent(false)
  })

  return (
    <div ref={ref}>
      <DetailsDropdownButton
        title="Select version"
        onClick={() => {
          setShowContent((shown) => !shown)
        }}
      >
        Version: {version}
      </DetailsDropdownButton>
      {showContent && (
        <DetailsDropdownContent>
          <CardHeader>
            <h3>Versions</h3>
          </CardHeader>
          <CardBody className="padding-y-0">
            {versions.map(({ name, ref }) => (
              <div key={ref}>
                <Link
                  className="usa-link"
                  to={`/docs/schema/${ref}/${path}`}
                  onClick={() => {
                    setShowContent(false)
                  }}
                >
                  {name || ref}
                </Link>
              </div>
            ))}
          </CardBody>
        </DetailsDropdownContent>
      )}
    </div>
  )
}

export default function () {
  const { version, '*': path } = useParams()
  const { data, jsonContent, examples } = useLoaderData<typeof loader>()
  const versions = useRouteLoaderData<typeof parentLoader>(
    'routes/docs_._schema-browser'
  )
  invariant(version)
  invariant(path)
  invariant(versions)

  return (
    <>
      <Grid row className="position-sticky top-0 z-100 padding-y-0 bg-white">
        <Grid
          tablet={{ col: 'fill' }}
          className="flex-align-self-center padding-y-1"
        >
          <Breadcrumbs
            path={path.replace(schemaSuffix, '')}
            className="font-ui-lg"
          />
        </Grid>
        <Grid tablet={{ col: 'auto' }} className="padding-y-1">
          <VersionSelector version={version} versions={versions} path={path} />
        </Grid>
      </Grid>
      <div className="grid-row grid-gap">
        <div className="grid-col-12">
          {jsonContent ? (
            <SchemaBody
              path={path}
              result={jsonContent}
              selectedVersion={version}
              examples={examples}
            />
          ) : (
            <>
              <Documentation />
              <CardGroup>
                {data.map((x) => (
                  <Link key={x.path} to={x.name} className="tablet:grid-col-3">
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
      </div>
    </>
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
  return (
    <>
      <h1>{result.title}</h1>
      <p className="usa-paragraph">{result.description}</p>
      <div>
        View the source on{' '}
        <Link
          className="usa-link"
          rel="external noopener"
          target="_blank"
          to={`https://github.com/nasa-gcn/gcn-schema/blob/${selectedVersion}/${path}`}
        >
          GitHub
        </Link>
      </div>
      {result.properties && (
        <>
          <h2>Properties</h2>
          <p className="usa-paragraph">
            <small>* = required</small>
          </p>
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
        </>
      )}
      {result.enum && (
        <>
          <h2>Possible Values</h2>
          <p>
            Any of the following are valid values for the {result.title}{' '}
            property:
          </p>
          <ul>
            {result.enum.map((x) => (
              <li key={x}>
                <code>{x}</code>
              </li>
            ))}
          </ul>
        </>
      )}
      {result.allOf && (
        <>
          <h3>Properties from all of the following:</h3>
          <p className="usa-paragraph">
            These properties are inherited using the <code>allOf</code> syntax.
            In order to validate, all of the following schemas must be
            individually valid, based on their respective properties. See{' '}
            <Link
              className="usa-link"
              rel="external noopener"
              target="_blank"
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
              className="usa-link"
              rel="external noopener"
              target="_blank"
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
              className="usa-link"
              rel="external noopener"
              target="_blank"
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
