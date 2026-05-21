import { useEffect, useRef } from 'react'

export function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    import('mermaid').then((mermaidModule) => {
      const mermaid = mermaidModule.default || mermaidModule

      mermaid.initialize({ startOnLoad: false })

      if (ref.current) {
        const id = `mermaid-${Math.random().toString(36).substring(2)}`
        mermaid
          .render(id, chart)
          .then((result) => {
            if (ref.current) {
              ref.current.innerHTML = result.svg
            }
          })
          .catch((error) => {
            console.error('Failed to render Mermaid diagram:', error)
          })
      }
    })
  }, [chart])

  return <div ref={ref} suppressHydrationWarning />
}
