import { useRef } from 'react'
import { Link } from 'remix'
import {
  Button,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalToggleButton,
  ModalRef,
} from '@trussworks/react-uswds'

export function LoginButton() {
  const modalRef = useRef<ModalRef>(null)
  return (
    <>
      <Modal
        aria-labelledby="consent-heading"
        aria-describedby="consent-description"
        id="consent-modal"
        ref={modalRef}
        isLarge
      >
        <ModalHeading id="consent-heading">NASA IT Consent</ModalHeading>
        <div className="usa-prose">
          <p id="consent-description">
            By accessing and using this information system, you acknowledge and
            consent to the following:
          </p>
          <p>
            You are accessing a U.S. Government information system, which
            includes: (1) this computer; (2) this computer network; (3) all
            computers connected to this network including end user systems; ( 4)
            all devices and storage media attached to this network or to any
            computer on this network; and (5) cloud and remote information
            services. This information system is provided for U.S.
            Government-authorized use only. You have no reasonable expectation
            of privacy regarding any communication transmitted through or data
            stored on this information system. At any time, and for any lawful
            purpose, the U.S. Government may monitor, intercept, search, and
            seize any communication or data transiting, stored on, or traveling
            to or from this information system. You are NOT authorized to
            process classified information on this information system.
            Unauthorized or improper use of this system may result in suspension
            or loss of access privileges, disciplinary action, and civil and/or
            criminal penalties.
          </p>
        </div>
        <ModalFooter>
          <Link to="/login">
            <Button type="button">I Agree</Button>
          </Link>
          <ModalToggleButton modalRef={modalRef} outline closer>
            Cancel
          </ModalToggleButton>
        </ModalFooter>
      </Modal>
      <ModalToggleButton
        modalRef={modalRef}
        outline
        className="text-white"
        opener
      >
        Sign in / Sign up
      </ModalToggleButton>
    </>
  )
}
