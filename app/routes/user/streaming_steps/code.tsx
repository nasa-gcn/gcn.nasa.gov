import type { Tab } from '~/components/Tabs'
import Tabs from '~/components/Tabs'
import {
  GcnKafkaPythonSampleCode,
  GcnKafkaJsSampleCode,
} from '~/components/ClientSampleCode'
import { useClient } from '../streaming_steps'

export default function Code() {
  const clientData = useClient()

  function buildConnectionStrings() {
    return clientData.alertSettings.map(
      (item) => `'gcn.classic.${item.format}.${item.noticeType}'`
    )
  }

  function tabs(): Tab[] {
    return [
      {
        label: 'Python',
        Component: GcnKafkaPythonSampleCode({
          clientId: clientData.codeSampleClientId,
          clientSecret: clientData.codeSampleClientSecret,
          subscriptionStrings: buildConnectionStrings(),
        }),
      },
      {
        label: 'Javscript',
        Component: GcnKafkaJsSampleCode({
          clientId: clientData.codeSampleClientId, //getClientId(),
          clientSecret: clientData.codeSampleClientSecret, //getClientSecret(),
          subscriptionStrings: buildConnectionStrings(),
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
