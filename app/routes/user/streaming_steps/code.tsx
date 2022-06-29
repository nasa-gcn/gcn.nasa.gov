import type { Tab } from '~/components/Tabs'
import Tabs from '~/components/Tabs'
import { ClientSampleCode } from '~/components/ClientSampleCode'
import { useClient } from '../streaming_steps'

export default function Code() {
  const clientData = useClient()

  function buildConnectionStrings() {
    return clientData.noticeTypes?.map(
      (item) => `'gcn.classic.${clientData.noticeFormat}.${item}'`
    )
  }

  function tabs(): Tab[] {
    return [
      {
        label: 'Python',
        Component: ClientSampleCode({
          clientId: clientData.codeSampleClientId,
          clientSecret: clientData.codeSampleClientSecret,
          noticeTypes: buildConnectionStrings(),
          language: 'python',
        }),
      },
      {
        label: 'Javscript',
        Component: ClientSampleCode({
          clientId: clientData.codeSampleClientId, //getClientId(),
          clientSecret: clientData.codeSampleClientSecret, //getClientSecret(),
          noticeTypes: buildConnectionStrings(),
          language: 'mjs',
        }),
      },
    ]
  }

  return (
    <>
      <Tabs tabs={tabs()} />
    </>
  )
}
