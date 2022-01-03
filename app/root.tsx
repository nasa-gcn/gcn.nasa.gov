import {
  Link,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from 'remix'

import type {
  LoaderFunction,
  MetaFunction
} from 'remix'

import {
  PrimaryNav,
  GovBanner,
  GridContainer,
  Header,
  Title
} from '@trussworks/react-uswds'

import { storage } from '~/auth.server'

export const meta: MetaFunction = () => {
  return { title: 'GCN - General Coordinates Network' }
}

export const links = () => [
  {
    rel: "stylesheet",
    // FIXME: should get from bundle using webpack or postcss
    href: "https://unpkg.com/uswds@2.11.2/dist/css/uswds.min.css"
  }
]

export const loader: LoaderFunction = async function ({request}) {
  const session = await storage.getSession(request.headers.get('Cookie'))
  return {
    email: session.get('email')
  }
}

export default function App() {
  const data = useLoaderData()

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <GovBanner />
        <Header basic>
          <div className="usa-nav-container">
            <div className="usa-navbar">
              <Title>
                <Link to="/">General Coordinates Network</Link>
              </Title>
            </div>
            <PrimaryNav items={[
              <a href="#" className="usa-nav__link">
                Notices
              </a>,
              <a href="#" className="usa-nav__link">
                Circulars
              </a>
            ]}>
              {
                (data.email) ? (
                  <span>Logged in as {data.email}</span>
                ) : (
                  <Link to="/login">Log in</Link>
                )
              }
            </PrimaryNav>
            </div>
        </Header>
        <ScrollRestoration />
        <section className="usa-section">
          <GridContainer>
            <Outlet />
          </GridContainer>
        </section>
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}
      </body>
    </html>
  )
}
