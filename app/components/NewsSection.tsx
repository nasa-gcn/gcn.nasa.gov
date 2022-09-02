import {
  Collection,
  CollectionCalendarDate,
  CollectionDescription,
  CollectionHeading,
  CollectionItem,
  Link,
} from '@trussworks/react-uswds'
import type { ReactNode } from 'react'

export interface NewsProps {
  Date: string
  Title: string
  BodyText: ReactNode
}

export default function NewsSection({ news }: { news?: NewsProps[] }) {
  const newsList: NewsProps[] = [
    {
      Date: 'September 2, 2022',
      Title: 'GECAM New Notice Type Available',
      BodyText:
        'The GCN system has been modified to incorporate the distribution of the GECAM Notices.\
         [link to GECAM missions page]  GECAM notices are available via GCN Classic distribution\
          methods and formats (binary socket, VOEvent xml socket, text via email and SMS) as well as GCN Classic Over Kafka, and the newly released self-service configuration of GCN Notices over email.',
    },
    {
      Date: 'September 2, 2022',
      Title:
        'Self-Service Configuration of GCN Notices over Email for Transient Alerts',
      BodyText:
        'This new feature will greatly simplify and enhance the user experience for subscribing to GCN Notices.  Using the same accounts on https://gcn.nasa.gov as GCN Classic Over Kafka, users can now sign up to subscribe to any of the public GCN Notice types in any of the 3 legacy formats (text, binary, VOEvent), and edit their settings at will.',
    },
    {
      Date: 'August 1, 2022',
      Title: 'New GCN Webinars',
      BodyText: (
        <>
          GCN held three public webinars to introduce the new GCN, the GCN
          Classic over Kafka service, and plans for new features and feedback.
          See the {' '}
          <Link href="https://nasa-gcn.github.io/gcn-presentation/">
            slides
          </Link>.
        </>
      ),
    },
    {
      Date: 'July 20, 2022',
      Title: 'GCN Classic over Kafka Now Available',
      BodyText: (
        <>
          All three classic GCN Notice formats (text, VOEvent, 160-byte binary
          packet) are now also available over Kafka. This new Kafka streaming
          service can be used as a drop-in replacement for GCN Classic socket
          and VOEvent subscribers, with an upcoming release serving email
          subscribers. (GCN Circ{' '}
          <Link href="https://gcn.gsfc.nasa.gov/gcn3/32419.gcn3">#32419</Link>),
        </>
      ),
    },
  ]

  return (
    <>
      <h2 className="">News and Events</h2>
      <Collection>
        {newsList?.map((article) => (
          <CollectionItem
            key={article.Title}
            variantComponent={
              <CollectionCalendarDate datetime={article.Date} />
            }
          >
            <CollectionHeading headingLevel="h3">
              {article.Title}
            </CollectionHeading>
            <CollectionDescription>{article.BodyText}</CollectionDescription>
          </CollectionItem>
        ))}
      </Collection>
    </>
  )
}
