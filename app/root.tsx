import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration
} from "remix";
import type { MetaFunction } from "remix";

// import '@trussworks/react-uswds/lib/uswds.css'
// import '@trussworks/react-uswds/lib/index.css'
import styles1 from '@trussworks/react-uswds/lib/uswds.css'
import styles2 from '@trussworks/react-uswds/lib/uswds.css'
import {
  GovBanner,
  GridContainer,
  Header,
  Title
} from '@trussworks/react-uswds'
import { makeUSWDSIcon } from "@trussworks/react-uswds/lib/components/Icon/Icon";

export const meta: MetaFunction = () => {
  return { title: "New Remix App" };
};

export function links() {
  return [
    {
      rel: "stylesheet",
      href: styles1
    },
    {
      rel: "stylesheet",
      href: styles2
    }
  ];
}

export default function App() {
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
              <Title>General Coordinates Network</Title>
            </div>
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
  );
}
