import {
    Button,
    IconContentCopy
  } from '@trussworks/react-uswds'
  
  import CopyToClipboard from 'react-copy-to-clipboard'

  export interface CopyableCodeProps {
    text: string
  }

  export default function CopyableCode(props: CopyableCodeProps) {
    return (
      <CopyToClipboard text={props.text}>
        <Button
          type="button"
          unstyled
          className="padding-1px text-base-darkest"
          title="Copy to clipboard"
        >
          <IconContentCopy />
          {' '}
          <code>
            <small>
              {props.text}
            </small>
          </code>
        </Button>
      </CopyToClipboard>
    )
  }
