import type { DataFunctionArgs } from '@remix-run/node'
import { Link, NavLink, useLoaderData } from '@remix-run/react'
import { Icon, SideNav, Table } from '@trussworks/react-uswds'
import { json, redirect, useParams } from 'react-router'

import SchemaDefinition from '../docs_.schema.$version._index'
import type { Schema } from './components'
import {
  ReferencedElementTable,
  SchemaPropertiesTableBody,
  formatFieldName,
  formatFieldType,
} from './components'
import { Highlight } from '~/components/Highlight'
import { SideNavSub } from '~/components/SideNav'
import { Tab, Tabs } from '~/components/tabs/Tabs'
import { publicStaticShortTermCacheControlHeaders } from '~/lib/headers.server'
import type { ExampleFiles, GitContentDataResponse } from '~/lib/schema-data'
import {
  getGithubDir,
  getVersionRefs,
  loadJson,
  loadSchemaExamples,
} from '~/lib/schema-data'

export async function loader({
  params: { version, '*': path },
}: DataFunctionArgs) {
  if (!version) throw new Response(null, { status: 404 })
  if (path?.endsWith('/')) {
    return redirect(`${path.slice(0, -1)}`)
  }
  let jsonContent
  let data
  let examples: ExampleFiles[] = []
  const versions = await getVersionRefs()
  if (path?.endsWith('.schema.json')) {
    const fileName = path.split('/').at(-1)
    const parentPath = path.replace(`/${fileName}`, '')
    jsonContent = await loadJson(path, version)
    examples = await loadSchemaExamples(path, version)
    data = await getGithubDir(parentPath, version)
  } else {
    data = await getGithubDir(path, version)
  }
  data = data.filter((x) => !x.name.endsWith('.example.json'))
  return json(
    { data, jsonContent, examples, versions },
    { headers: publicStaticShortTermCacheControlHeaders }
  )
}

export default function () {
  const { version, '*': path } = useParams()
  const { data, jsonContent, examples } = useLoaderData()
  if (!path) {
    throw new Error('Path is not defined.')
  }
  const previous = path?.replace(`/${path.split('/').at(-1)}`, '')
  return (
    <>
      <div className="desktop:grid-col-3">
        <div className="position-sticky top-0">
          <SideNav
            items={[
              path != previous && (
                <Link key={previous} to={previous}>
                  Previous
                </Link>
              ),
              !path.endsWith('.schema.json') && (
                <NavLink key={path} to={path}>
                  {path}
                </NavLink>
              ),
              <SideNavSub
                key="subnav"
                items={data.map((x: GitContentDataResponse) => (
                  <NavLink key={x.path} to={x.path}>
                    <span className="display-flex flex-align-center">
                      {x.type == 'dir' && (
                        <span className="margin-top-05 padding-right-05">
                          <Icon.FolderOpen />
                        </span>
                      )}
                      <span>{x.name}</span>
                    </span>
                  </NavLink>
                ))}
                base={path}
              ></SideNavSub>,
            ]}
          />
        </div>
      </div>
      <div className="desktop:grid-col-9 desktop:margin-top-neg-6">
        {jsonContent ? (
          <SchemaBody
            path={path ?? ''}
            result={jsonContent}
            selectedVersion={version ?? ''}
            examples={examples}
          />
        ) : (
          <SchemaDefinition />
        )}
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
  examples: ExampleFiles[]
}) {
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
