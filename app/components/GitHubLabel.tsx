import { Octokit } from 'octokit'
import { useEffect, useRef } from 'react'

const octokit = new Octokit()

export function GitHubLabel({
  owner,
  repo,
  name,
}: {
  owner: string
  repo: string
  name: string
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    ;(async () => {
      if (!ref.current) return
      const {
        data: { color },
      } = await octokit.rest.issues.getLabel({ owner, repo, name })
      ref.current.style.backgroundColor = `#${color}`
    })()
  })

  const url = new URL(`https://github.com/${owner}/${repo}/issues`)
  url.searchParams.set('q', `is:open is:issue label:"${name}"`)

  return (
    <a
      href={url.toString()}
      ref={ref}
      className="text-white text-semibold font-body-3xs padding-x-1 radius-pill"
      style={{
        backgroundColor: 'gray',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </a>
  )
}
