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
      Title: 'Article 1',
      BodyText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse cursus, orci sed \
      congue molestie, orci diam pharetra ipsum, eu laoreet justo magna vel dui. Sed ut mattis dui. Ut id commodo dui. \
       Maecenas ante nulla, porta ut aliquam sit amet, convallis quis augue. Integer scelerisque vitae enim non \
        malesuada. Morbi suscipit eros eget sem facilisis, ac fringilla diam maximus. Maecenas maximus dolor ut',
    },
    {
      Date: Date.now() + 78524,
      Title: 'Article 2',
      BodyText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse cursus, orci sed \
      congue molestie, orci diam pharetra ipsum, eu laoreet justo magna vel dui. Sed ut mattis dui. Ut id commodo dui. \
       Maecenas ante nulla, porta ut aliquam sit amet, convallis quis augue. Integer scelerisque vitae enim non \
        malesuada. Morbi suscipit eros eget sem facilisis, ac fringilla diam maximus. Maecenas maximus dolor ut',
    },
    {
      Date: Date.now() - 785256,
      Title: 'Article 3',
      BodyText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse cursus, orci sed \
      congue molestie, orci diam pharetra ipsum, eu laoreet justo magna vel dui. Sed ut mattis dui. Ut id commodo dui. \
       Maecenas ante nulla, porta ut aliquam sit amet, convallis quis augue. Integer scelerisque vitae enim non \
        malesuada. Morbi suscipit eros eget sem facilisis, ac fringilla diam maximus. Maecenas maximus dolor ut',
    },
  ]

  return (
    <>
      <div className="usa-section usa-section--light usa-prose">
        <SectionWrapper>
          <h2 className="">Upcoming events and News</h2>
          {testContent?.map((article) => (
            <div key={article.Title}>
              <p className="">
                {moment.utc(article.Date).format('MMMM DD, YYYY')}
              </p>
              <h4 className="">{article.Title}</h4>
              <p>{article.BodyText}</p>
            </div>
          ))}
        </SectionWrapper>
      </div>
    </>
  )
}
