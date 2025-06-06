/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import { ClientSampleCode } from '~/components/ClientSampleCode'
import { useDomain } from '~/root'

jest.mock('~/root', () => ({
  useDomain: jest.fn(),
}))

describe('ClientSampleCode', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  const topics = [
    'gcn.classic.text.FERMI_GBM_FIN_POS',
    'gcn.classic.text.LVC_INITIAL',
  ]
  const clientId = 'my_client_id'
  const clientSecret = 'my_client_secret'

  it('renders Python example code', () => {
    const { container, getByText } = render(
      <ClientSampleCode
        topics={topics}
        clientId={clientId}
        clientSecret={clientSecret}
        listTopics={false}
        language="py"
      />
    )

    expect(container.querySelector('.language-sh')).not.toBeNull()
    expect(container.querySelector('.language-py')).not.toBeNull()
    expect(getByText('pip')).toHaveAttribute('href', 'https://pip.pypa.io/')
    expect(getByText('conda')).toHaveAttribute('href', 'https://docs.conda.io/')
    expect(getByText(`example.py`)).toBeInTheDocument()
    expect(container.textContent).toContain(clientId)
    expect(container.textContent).toContain(clientSecret)
    expect(container.textContent).toContain(topics[0])
    expect(container.textContent).toContain(topics[1])
  })

  it('renders Python example code with domain', () => {
    const domain = 'test.gcn.nasa.gov'

    ;(useDomain as jest.Mock).mockReturnValueOnce(domain)

    const { container } = render(
      <ClientSampleCode
        topics={topics}
        clientId={clientId}
        clientSecret={clientSecret}
        listTopics={false}
        language="py"
      />
    )
    expect(container.textContent).toContain(domain)
  })

  it('renders shell commands for pip and conda', () => {
    const topics = [
      'gcn.classic.text.FERMI_GBM_FIN_POS',
      'gcn.classic.text.LVC_INITIAL',
    ]
    const clientId = 'my_client_id'
    const clientSecret = 'my_client_secret'
    const { container, getByText } = render(
      <ClientSampleCode
        topics={topics}
        clientId={clientId}
        clientSecret={clientSecret}
        listTopics={false}
        language="py"
      />
    )

    expect(container.querySelector('.language-sh')?.textContent).not.toBeNull()
    expect(container.querySelector('.language-py')).not.toBeNull()
    expect(getByText('pip')).toHaveAttribute('href', 'https://pip.pypa.io/')
    expect(getByText('conda')).toHaveAttribute('href', 'https://docs.conda.io/')
    expect(container.textContent).toContain('pip install gcn-kafka')
    expect(container.textContent).toContain(
      'conda install -c conda-forge gcn-kafka'
    )
  })

  it('renders Python example code with list of topics', () => {
    const clientId = 'my_client_id'
    const clientSecret = 'my_client_secret'
    const { container } = render(
      <ClientSampleCode
        clientId={clientId}
        clientSecret={clientSecret}
        listTopics
        language="py"
        topics={[]}
      />
    )

    expect(container.textContent).toContain(
      'print(consumer.list_topics().topics)'
    )
  })
})
