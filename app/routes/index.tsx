import {
  useState,
  useRef
} from 'react'

import {
  Alert,
  Button,
  IconDelete,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalRef,
  ModalToggleButton,
  Table,
  TextInput
} from '@trussworks/react-uswds'

import { useLoaderData } from 'remix'

import CopyableCode from '~/components/CopyableCode'

export let loader = () => [
  {
    name: "Fritz Marshal",
    client_id: "qiYEw7QkwoL9yzP4zI0tVKSXiG"
  },
  {
    name: "My MacBook",
    client_id: "C9SJFMLl4xhKoUDMDkeH2ccnnM"
  },
  {
    name: "Lab Desktop",
    client_id: "oNv8GCPQY2hMsMgj4doRj2eP6F"
  }
]

interface ClientCredentialProps {
  name: string,
  client_id: string,
  client_secret?: string,
  onDelete?: (client_id: string) => void
}

function ClientCredential(props: ClientCredentialProps) {
  const modalRef = useRef<ModalRef>(null)

  const handleDelete: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    modalRef?.current?.toggleModal(e, false)
    if (props.onDelete !== undefined)
    {
      props.onDelete(props.client_id)
    }
  }

  return (
    <tr>
      <td>{props.name}</td>
      <td><CopyableCode text={props.client_id} /></td>
      <td>
        {
          (props.client_secret)
          ? (<CopyableCode text={props.client_secret} />)
          : (<span className="text-base">(not shown)</span>)
        }
      </td>
      <td>
        <ModalToggleButton
          type="button"
          unstyled
          title="Delete this client credential"
          modalRef={modalRef}
          opener
        >
          <big><IconDelete /></big>
        </ModalToggleButton>

        <Modal
          id="modal-delete"
          ref={modalRef}
          aria-labelledby="modal-delete-heading"
          aria-describedby="modal-delete-description"
        >
          <ModalHeading id="modal-delete-heading">
            Delete Client Credential
          </ModalHeading>
          <div className="usa-prose">
            <p id="modal-delete-description">Are you sure that you want to delete the client credential named "{props.name}" with client ID <code>{props.client_id}</code>?</p>
            <p>This action cannot be undone.</p>
          </div>
          <ModalFooter>
            <Button data-close-modal type="button" onClick={handleDelete}>
              Delete
            </Button>
            <ModalToggleButton modalRef={modalRef} closer outline>
              Cancel
            </ModalToggleButton>
          </ModalFooter>
        </Modal>
      </td>
    </tr>
  )
}

export default function Index() {
  const modalRef = useRef<ModalRef>(null)
  const [items, setItems] = useState(useLoaderData())
  const [name, setName] = useState('')
  const [created, setCreated] = useState(false)

  function handleDelete(client_id: string)
  {
    setItems(items.filter(item => item.client_id != client_id))
  }

  function randomAlphanumericChar() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return alphabet.charAt(Math.floor(Math.random() * alphabet.length))
  }

  function randomAlphanumericString(length: Number)
  {
    return [...Array(length).keys()].map((item) => randomAlphanumericChar()).join('')
  }

  const handleCreate: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    modalRef?.current?.toggleModal(e, false)
    const item = {
      name: name,
      client_id: randomAlphanumericString(26),
      client_secret: randomAlphanumericString(52)
    }
    setItems([...items, item])
    setCreated(true)
  }

  return (
    <section>
      <h1>
        Client Credentials
      </h1>
      <div className="usa-prose">
        <p>A Client Credential is a randomly generated Client ID and Client Secret that you can use in script to connect to the GCN Kafka broker.</p>
      </div>
      <p>
        <ModalToggleButton modalRef={modalRef} opener>
          Create new client credential
        </ModalToggleButton>
      </p>
      {
        (items.length > 0)
        ? (
          <Table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Client ID</th>
                <th>Client Secret</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                items.map(item => <ClientCredential {...item} key={item.client_id} onDelete={handleDelete} />)
              }
            </tbody>
          </Table>
        )
        : ''
      }

      <Modal
        id="modal-new"
        ref={modalRef}
        aria-labelledby="modal-new-heading"
        aria-describedby="modal-new-description"
      >
        <ModalHeading id="modal-new-heading">
          Create New Client Credential
        </ModalHeading>
        <div className="usa-prose">
          <p id="modal-new-description">Choose a name for your new client credential.</p>
          <p className="text-base">The name should help you remember what you use the client credential for, or where you use it. Examples: "My Laptop", "Lab Desktop", "GRB Pipeline".</p>
        </div>
        <Label htmlFor="name">Name</Label>
        <TextInput data-focus name="name" id="name" type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <ModalFooter>
          <Button data-close-modal type="button" onClick={handleCreate}>
            Create
          </Button>
          <ModalToggleButton modalRef={modalRef} closer outline>
            Cancel
          </ModalToggleButton>
        </ModalFooter>
      </Modal>

      {
        (created)
        ? (
          <Alert type="success" heading="Your new client credential was created.">
            Make sure that you copy the client secret. It will only be shown once.
          </Alert>
        )
        : ''
      }
    </section>
  )
}
