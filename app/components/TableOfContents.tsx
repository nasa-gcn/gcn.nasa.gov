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
    <details>
      <summary>Table of Contents</summary>

      <nav
        aria-label="Table of contents"
        className={classNames('padding-2', className)}
      >
        <ul className="usa-list usa-list--unstyled margin-0">
          {items.map((item) => (
            <li
              key={item.id}
              className={classNames('margin-bottom-1', {
                [`margin-left-${(item.level - 1) * 2}`]:
                  item.level >= 3 && item.level <= 6,
              })}
            >
              <a className="usa-link" href={`#${item.id}`}>
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  )
}
