import classNames from 'classnames'
import { useEffect, useState } from 'react'

type TocItem = {
  id: string
  level: number
  text: string
}

function compileTOC(container: ParentNode): TocItem[] {
  return Array.from(container.querySelectorAll('h2, h3, h4, h5, h6'))
    .map((heading) => ({
      id: heading.id,
      level: Number.parseInt(heading.tagName.slice(1), 10),
      text: heading.textContent?.trim() ?? '',
    }))
    .filter((heading) => heading.id && heading.text)
}

export function TableOfContents({
  className,
  selector = '[data-mdx-content]',
}: {
  className?: string
  selector?: string
}) {
  const [items, setItems] = useState<TocItem[]>([])

  useEffect(() => {
    const container = document.querySelector(selector)

    if (container) {
      setItems(compileTOC(container))
    }
  }, [selector])

  if (items.length === 0) {
    return null
  }

  return (
    <nav
      aria-label="Table of contents"
      className={classNames('margin-y-4 padding-2', className)}
    >
      <p className="usa-label margin-top-0 margin-bottom-2">
        Table of Contents
      </p>
      <ul className="usa-list usa-list--unstyled margin-0">
        {items.map((item) => (
          <li
            key={item.id}
            className={classNames('margin-bottom-1', {
              'margin-left-2': item.level === 3,
              'margin-left-4': item.level === 4,
              'margin-left-6': item.level === 5,
              'margin-left-8': item.level === 6,
            })}
          >
            <a className="usa-link" href={`#${item.id}`}>
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
