import { Octokit } from '@octokit/rest'
import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'

const githubData = {
  owner: 'nasa-gcn',
  repo: 'gcn-schema',
}
const octokit = new Octokit()

export async function loader({ params: { '*': path } }: DataFunctionArgs) {
  let latestRelease
  try {
    latestRelease = (await octokit.rest.repos.getLatestRelease(githubData)).data
  } catch (error) {
    latestRelease = { tag_name: 'main' }
  }
  return redirect(`/docs/schema-browser/${latestRelease.tag_name}/${path}`)
}
