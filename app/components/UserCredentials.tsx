import CredentialCard from './CredentialCard'
import SegmentedCards from './SegmentedCards'
import type { RedactedClientCredential } from '~/routes/user.credentials/client_credentials.server'

export function UserCredentials({
  client_credentials,
  groups,
}: {
  client_credentials: RedactedClientCredential[]
  groups: [string, string][]
}) {
  const groupDescriptions = Object.fromEntries(groups)

  return (
    <>
      <SegmentedCards>
        {client_credentials
          .filter((cred) => !cred.expired)
          .map((credential) => (
            <CredentialCard
              key={credential.client_id}
              scopeDescription={groupDescriptions[credential.scope]}
              {...credential}
            />
          ))}
      </SegmentedCards>
      {client_credentials.some((x) => x.expired) && (
        <>
          <h3>Expired Credentials</h3>
          <SegmentedCards>
            {client_credentials
              .filter((cred) => cred.expired)
              .map((credential) => (
                <CredentialCard
                  key={credential.client_id}
                  scopeDescription={groupDescriptions[credential.scope]}
                  {...credential}
                />
              ))}
          </SegmentedCards>
        </>
      )}
    </>
  )
}
