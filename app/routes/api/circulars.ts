import type { DataFunctionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { getFormDataString } from '~/lib/utils'
import { list, put } from '../circulars/circulars.server'

export async function loader(args: DataFunctionArgs) {
  return await handleCircularsLoader(args)
}

/** Returns all Circulars segmented by page  */
export async function handleCircularsLoader({
  request: { url },
}: DataFunctionArgs) {
  const { searchParams } = new URL(url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const results = await list({ page, limit: 100 })

  return {
    page,
    ...results,
  }
}

export async function action({ request }: DataFunctionArgs) {
  const data = await request.formData()
  const body = getFormDataString(data, 'body')
  const subject = getFormDataString(data, 'subject')
  if (!body || !subject)
    throw new Response('Body and subject are required', { status: 400 })
  if (!subjectLineIsValid(subject))
    throw new Response(
      'Subject must conform to the rules defined at https://gcn.nasa.gov/circulars#submission-process'
    )
  await put(subject, body, request)
  return redirect('/circulars/archive')
}

export function subjectLineIsValid(subject: string) {
  return validSubjectKeywords.some((x) => subject.indexOf(x) > -1)
}

export const validSubjectKeywords = [
  'AGILE',
  'ANTARES',
  'AXP',
  'Chandra',
  'Fermi',
  'FXT',
  'grb',
  'GRB',
  'GW',
  'HAWC',
  'HST',
  'IBAS',
  'IceCube',
  'ICECUBE',
  'INTEGRAL',
  'IPN',
  'KONUS',
  'LIGO',
  'LVC',
  'MAXI',
  'RATIR',
  'SDSS',
  'SGR',
  'Swift',
  'SWIFT',
  'Virgo',
  'VLA',
  'VLBI',
  'XRB',
  'XTR',
]
