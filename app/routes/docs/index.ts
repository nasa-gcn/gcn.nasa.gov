import { LoaderFunction, redirect } from 'remix'

export const loader: LoaderFunction = () => redirect('/docs/about')

// FIXME: workaround for https://github.com/remix-run/remix/issues/1828.
// Resource routes (without browser code) don't get server pruning done.
// Once fixed upstream, remove.
export const meta = () => ({})
