// ---
// handle:
//   breadcrumb: Schema Design
// ---
import {
  Link,
  ProcessList,
  ProcessListHeading,
  ProcessListItem,
} from '@trussworks/react-uswds'

import { Highlight } from '~/components/Highlight'

export default function SchemaDocumentation() {
  return (
    <>
      <h1>GCN Unified Schema</h1>
      <p>
        The GCN Unified schema is standardized way of organizing the GCN notices
        data of same properities and units. The notice schema is defined using
        JSON (JavaScript Object Notation), a lightweight data-interchange
        format. A set of core schema is designed as building blocks for new GCN
        Notices.
      </p>
      <p>
        Instrument-specific schema can be created, first using the set of core
        schema, followed by set of specific properties. Please add your schema
        to this repository under{' '}
        <Link href="https://github.com/nasa-gcn/gcn-schema" rel="external">
          Github
        </Link>{' '}
        and submit a pull request for the GCN Team to review. Your pipeline will
        generate JSON files following these schema and send alerts to GCN as
        described in New Notice Producers.
      </p>
      <h1>Getting Started</h1>
      <p>
        The first step is to checkout step the gcn-schema repo from github.
        (Vidushi, make this a link). The structure of the repository gives each
        producer their own folder to define schemas on a individual mission
        level. For example, the schema definition for IceCube alerts are located
        in the directory <code>gcn/notices/icecube/</code>.
      </p>
      <p>
        tell them how to name their schema folder path structure and how to name
        ther files (*.schema.json and *.example.json patters)
      </p>
      <p>Here is the starting point for construction of schema</p>
      <Highlight
        language="json"
        code={JSON.stringify(
          {
            $id: 'https://gcn.nasa.gov/<your path>/<your schema name>.schema.json',
            $schema: 'https://json-schema.org/draft/2020-12/schema',
            type: 'object',
            title: 'Your Schema Name',
            description: 'A description for your schema',
          },
          null,
          2
        )}
      />
      <p>Here is an example .example file</p>
      <h1> Git Instructions </h1>
      For Pull Requests (PRs) and Schema Development Prettier and npm run
      validate
      <h1>Best practices</h1>
      <ProcessList>
        <ProcessListItem>
          <ProcessListHeading type="h3">
            Define allOf or anyOf
          </ProcessListHeading>
          Instructions on how to create multiresolution healpix maps
        </ProcessListItem>
        <ProcessListItem>
          <ProcessListHeading type="h3">
            Handle HEALPix Map and Fits file
          </ProcessListHeading>
          Instructions on how to create multiresolution healpix maps.
          instructions on how to base64 encode fits files and include them in a
          JSON notice. Instructions for decoding base64 encoded fits file string
          (w/ example).
        </ProcessListItem>
        <ProcessListItem>
          <ProcessListHeading type="h3">Best practices</ProcessListHeading>
          Best practices for schema updates (ex. Deprecation of fields that are
          being updated or replaced,)
        </ProcessListItem>
      </ProcessList>
    </>
  )
}
