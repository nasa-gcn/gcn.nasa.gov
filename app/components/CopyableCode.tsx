import {
    Button,
    IconContentCopy
  } from '@trussworks/react-uswds'
  
  import CopyToClipboard from 'react-copy-to-clipboard'

  export default function CopyableCode(props: JSX.IntrinsicElements['span']) {
    console.log(props.children)
    return (
      <CopyToClipboard text={props.children}>
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
              {props.children}
            </small>
          </code>
        </Button>
      </CopyToClipboard>
    )
  }
