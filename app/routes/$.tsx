import type { LoaderFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { ButtonGroup } from '@trussworks/react-uswds'

export const handle = {
  breadcrumb: 'Page Not Found',
  getSitemapEntries: () => null,
}

export const loader: LoaderFunction = function () {
  throw new Response(null, { status: 404 })
}

export function CatchBoundary() {
  return (
    <>
      <h1>Page not found</h1>
      <p className="usa-intro">
        We're sorry, we can't find the page you're looking for. It might have
        been removed, changed its name, or is otherwise unavailable.
      </p>
      <p className="usa-paragraph">
        Visit our homepage for helpful tools and resources, or contact us and
        we'll point you in the right direction.
      </p>
      <ButtonGroup>
        <Link to="/" className="usa-button">
          Visit homepage
        </Link>
        <a
          href="https://heasarc.gsfc.nasa.gov/cgi-bin/Feedback?selected=kafkagcn"
          className="usa-button usa-button--outline"
        >
          Contact us
        </a>
      </ButtonGroup>
    </>
  )
}

export default function () {}
