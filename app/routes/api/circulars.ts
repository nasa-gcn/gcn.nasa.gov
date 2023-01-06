import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { getFormDataString } from '~/lib/utils'
import { CircularsServer } from '../circulars/circulars.server'

export async function loader(args: DataFunctionArgs) {
  return await handleCircularsLoader(args)
}

export async function handleCircularsLoader({ request }: DataFunctionArgs) {
  const machine = await CircularsServer.create(request)
  const data = await machine.getCirculars('')
  const searchParams = new URL(request.url).searchParams
  const pageStr = searchParams.get('page')
  const searchTerm = searchParams.get('search')
  let filteredDataItems = data
  if (searchTerm) {
    filteredDataItems = filteredDataItems.filter(
      (x) =>
        x.subject.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||
        x.body.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
    )
  }
  const limit = 10 // searchParams.get('limit')
  const page = pageStr ? parseInt(pageStr) : 1
  return {
    page: page,
    searchTerm,
    items: filteredDataItems.slice(limit * (page - 1), page * limit - 1),
    pageCount: Math.ceil(filteredDataItems.length / limit),
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  const server = await CircularsServer.create(request)
  await server.createNewCircular(body, subject)

  return redirect('/circulars')
}
