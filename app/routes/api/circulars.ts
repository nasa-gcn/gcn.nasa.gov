import type { DataFunctionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { getFormDataString } from '~/lib/utils'
import type { CircularModel } from './circulars.server'
import { CircularsServer } from './circulars.server'

export async function loader({ request }: DataFunctionArgs) {
  const machine = await CircularsServer.create()
  const data = await machine.getCirculars('')
  const pageStr = new URL(request.url).searchParams.get('page')
  const limit = 10 // new URL(request.url).searchParams.get('limit')
  const page = pageStr ? parseInt(pageStr) : 1

  return json({
    page: page,
    items: data.items.slice(limit * (page - 1), page * limit - 1),
    pageCount: Math.ceil(data.items.length / limit),
  })
}

export async function action({ request }: DataFunctionArgs) {
  try {
    const [data] = await Promise.all([request.formData()])
    if (dataIsValid(data)) {
      const circularModel: CircularModel = {
        subject: getFormDataString(data, 'subject') ?? '',
        body: getFormDataString(data, 'body') ?? '',
        linkedEvent: getFormDataString(data, 'linkedEvent'),
      }
      const hostname = new URL(request.url).hostname
      const production_hostname = 'gcn.nasa.gov'
      if (hostname == production_hostname || hostname == 'localhost') {
        // Internal request
        const machine = await CircularsServer.create(request)
        await machine.createNewCircular(circularModel)

        return redirect('/circulars')
      } else {
        // Validate user and create stuff, maybe issue new creds for programatic access?
        console.log(getFormDataString(data, 'clientId'))
        console.log(getFormDataString(data, 'clientSecret'))

        if (false) {
          const machine = await CircularsServer.create(request)
          await machine.createNewCircular(circularModel)
        }

        return new Response('success')
      }
    } else {
      return {
        error: 'bad data',
        status: 400,
        data: data,
      }
    }
  } catch (error: any) {
    console.log('Error: ')
    console.log(error)

    return {
      error: error.statusText ?? 'bad request',
      status: error.status ?? 400,
    }
  }
}

function dataIsValid(data: FormData) {
  return (
    !!getFormDataString(data, 'body') && !!getFormDataString(data, 'subject') // &&
    //!!getFormDataString(data, 'linkedEvent')
  )
}
