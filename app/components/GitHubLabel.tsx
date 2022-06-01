import { hex } from 'color-convert'
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

  async function setColor() {
    if (!ref.current) return

    const {
      data: { color },
    } = await octokit.rest.issues.getLabel({ owner, repo, name })

    const inverse = hex.gray(color)[0] < 60

    ref.current.style.backgroundColor = `#${color}`
    ref.current.style.color = inverse ? 'white' : 'black'
  }

  useEffect(() => {
    setColor()
  })

  const url = new URL(`https://github.com/${owner}/${repo}/issues`)
  url.searchParams.set('q', `is:open is:issue label:"${name}"`)

  return (
    <a
      href={url.toString()}
      ref={ref}
      className="text-semibold font-body-3xs padding-x-1 radius-pill"
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
