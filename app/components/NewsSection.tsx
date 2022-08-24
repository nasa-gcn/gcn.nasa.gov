import {
  Collection,
  CollectionCalendarDate,
  CollectionDescription,
  CollectionHeading,
  CollectionItem,
  Grid,
} from '@trussworks/react-uswds'
import moment from 'moment'
import SectionWrapper from './SectionWrapper'

export interface NewsProps {
  Date: number
  Title: string
  BodyText: string
}

export default function NewsSection({ news }: { news?: NewsProps[] }) {
  const testContent: NewsProps[] = [
    {
      Date: Date.now(),
      Title: 'Article 1 Something new ',
      BodyText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse cursus, orci sed \
      congue molestie, orci diam pharetra ipsum, eu laoreet justo magna vel dui. Sed ut mattis dui. Ut id commodo dui.',
    },
    {
      Date: Date.now(),
      Title: 'Article 2 Another',
      BodyText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse cursus, orci sed \
      congue molestie, orci diam pharetra ipsum, eu laoreet justo magna vel dui. Sed ut mattis dui. Ut id commodo dui.',
    },
    {
      Date: Date.now(),
      Title: 'Article 3, This could be a link too',
      BodyText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse cursus, orci sed \
      congue molestie, orci diam pharetra ipsum, eu laoreet justo magna vel dui. Sed ut mattis dui. Ut id commodo dui.',
    },
  ]

  return (
    <>
      <SectionWrapper className="usa-section--light">
        <Grid row gap>
          <Grid tablet={{ col: 6 }}>
            <h2 className="">News</h2>
            <Collection>
              {testContent?.map((article) => (
                <CollectionItem
                  key={article.Title}
                  variantComponent={
                    <CollectionCalendarDate
                      datetime={moment.utc(article.Date).toString()}
                    />
                  }
                >
                  <CollectionHeading headingLevel="h3">
                    {article.Title}
                  </CollectionHeading>
                  <CollectionDescription>
                    {article.BodyText}
                  </CollectionDescription>
                </CollectionItem>
              ))}
            </Collection>
          </Grid>
          <Grid tablet={{ col: 6 }}>
            <h2 className="">Upcoming Events</h2>
            {testContent?.map((article) => (
              <Grid row key={article.Title}>
                <Grid col={1}>
                  <div className="border-right-1px border-base-light">
                    <p className="margin-bottom-0 text-center">
                      {moment.utc(article.Date).format('MMM')}
                    </p>
                    <p className="margin-top-0 text-center">
                      {moment.utc(article.Date).format('DD')}
                    </p>
                  </div>
                </Grid>
                <Grid col={11}>
                  <h4 className="margin-left-1">{article.Title}</h4>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </SectionWrapper>
    </>
  )
}
