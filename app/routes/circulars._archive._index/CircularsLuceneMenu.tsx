import { Link } from '@remix-run/react'
import { Button, Grid, GridContainer, Icon } from '@trussworks/react-uswds'
import React, { useState } from 'react'

export function LuceneAccordion() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div
      className="usa-accordion usa-accordion--multiselectable usa-accordion--bordered margin-y-1"
      data-allow-multiple
    >
      <div>
        <div
          className="bg-base-lightest hover:bg-base-lighter height-auto cursor-pointer padding-y-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <GridContainer>
            <Grid row className="padding-y-1">
              <Grid col={11} className="grid-col">
                <p className="margin-y-0">Advanced Search</p>
              </Grid>
              <Grid col={1}>
                <div className="float-right">
                  <Button
                    type="button"
                    className="usa-button--unstyled"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? <Icon.ExpandLess /> : <Icon.ExpandMore />}
                  </Button>
                </div>
              </Grid>
            </Grid>
          </GridContainer>
          <div
            id="accordion-item-1"
            hidden={!isOpen}
            className="usa-accordion__content usa-prose padding-y-1"
          >
            To narrow the search results, use Lucene search syntax. This allows
            for specifying which circular field to search (submitter, subject,
            and/or body). Further documentation can be found on the{' '}
            <Link className="usa-link" to="/docs/circulars/lucene">
              Lucene Search Syntax Page
            </Link>
            {'. '}
          </div>
        </div>
      </div>
    </div>
  )
}
