/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardGroup,
  Grid,
  Textarea,
} from '@trussworks/react-uswds'
import classNames from 'classnames'
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import dedent from 'ts-dedent'

import {
  MarkdownBody,
  PlainTextBody,
} from '../../circulars.$circularId.($version)/Body'
import { GitLabIcon } from './GitLabIcon'
import { onKeyDown } from './onKeyDown'
import { TabButton, TabButtonGroup } from '~/components/tabs'

import styles from './index.module.css'
import iconBold from '@gitlab/svgs/dist/sprite_icons/bold.svg'
import iconCode from '@gitlab/svgs/dist/sprite_icons/code.svg'
import iconText from '@gitlab/svgs/dist/sprite_icons/doc-text.svg'
import iconEllipsis from '@gitlab/svgs/dist/sprite_icons/ellipsis_h.svg'
import iconHeading from '@gitlab/svgs/dist/sprite_icons/heading.svg'
import iconItalic from '@gitlab/svgs/dist/sprite_icons/italic.svg'
import iconLink from '@gitlab/svgs/dist/sprite_icons/link.svg'
import iconListBulleted from '@gitlab/svgs/dist/sprite_icons/list-bulleted.svg'
import iconListNumbered from '@gitlab/svgs/dist/sprite_icons/list-numbered.svg'
import iconMarkdown from '@gitlab/svgs/dist/sprite_icons/markdown-mark-solid.svg'
import iconQuote from '@gitlab/svgs/dist/sprite_icons/quote.svg'
import iconTable from '@gitlab/svgs/dist/sprite_icons/table.svg'

function SlimButton({ className, ...props }: Parameters<typeof Button>[0]) {
  return (
    <Button
      className={classNames(className, 'height-4 padding-y-1 padding-x-105')}
      {...props}
    />
  )
}

function PlainTextButton({
  checked,
  ...props
}: { checked?: boolean } & Omit<
  Parameters<typeof Button>[0],
  'type' | 'outline' | 'children' | 'title'
>) {
  return (
    <SlimButton outline={!checked} type="button" {...props}>
      <GitLabIcon src={iconText} className="width-2 height-2" />
      <span className="display-none tablet-lg:display-inline"> Plain Text</span>
    </SlimButton>
  )
}

function MarkdownButton({
  checked,
  ...props
}: { checked?: boolean } & Omit<
  Parameters<typeof Button>[0],
  'type' | 'outline' | 'children' | 'title'
>) {
  return (
    <SlimButton outline={!checked} type="button" {...props}>
      <GitLabIcon src={iconMarkdown} className="width-2 height-105" />
      <span className="display-none tablet-lg:display-inline"> Markdown</span>
    </SlimButton>
  )
}

function StyleButton({
  src,
  className,
  disabled,
  ...props
}: { src: string } & Omit<
  Parameters<typeof SlimButton>[0],
  'unstyled' | 'type' | 'children'
>) {
  return (
    <SlimButton
      unstyled
      type="button"
      className={classNames(
        className,
        'width-3 padding-0 margin-top-05 border-0 radius-md hover:text-white',
        {
          'hover:bg-primary active:bg-primary-dark': !disabled,
          'hover:bg-base-light active:bg-base-dark text-base': disabled,
        }
      )}
      {...props}
    >
      <GitLabIcon src={src} className="width-full height-full" />
    </SlimButton>
  )
}

export function insertText(text: string) {
  if (text.length > 0) document.execCommand('insertText', false, text)
  else document.execCommand('delete', false)
}

export const linesep = '\n'

export function RichEditor({
  className,
  onChange,
  defaultValue,
  defaultMarkdown,
  markdownStateSetter,
  ...props
}: {
  defaultValue?: string
  defaultMarkdown?: boolean
  markdownStateSetter?: (value: 'text/plain' | 'text/markdown') => void
} & Omit<
  Parameters<typeof Textarea>[0],
  'children' | 'defaultValue' | 'name' | 'id'
>) {
  defaultMarkdown = Boolean(defaultMarkdown)
  const [markdown, setMarkdown] = useState(defaultMarkdown)
  const [editing, setEditing] = useState(true)
  const [value, setValue] = useState(defaultValue ?? '')
  const [showPopover, setShowPopover] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const Preview = markdown ? MarkdownBody : PlainTextBody

  function toggleMarkdown() {
    setMarkdown((state) => !state)
  }

  function toggleShowPopover() {
    setShowPopover((state) => !state)
  }

  function edit() {
    setEditing(true)
    flushSync(() => {})
    inputRef.current?.focus()
  }

  function preview() {
    setEditing(false)
    inputRef.current?.blur()
  }

  const toggleMarkdownButtonProps = {
    title: `Toggle between plain text and rich formatted Markdown text. Markdown is currently ${markdown ? 'enabled' : 'disabled'}.`,
  }

  function styleBlock(startText: string = '') {
    return () => {
      const input = inputRef.current
      if (input) {
        let { selectionStart, selectionEnd } = input
        const { value } = input

        selectionStart =
          selectionStart < 1
            ? 0
            : value.lastIndexOf(linesep, selectionStart - 1) + linesep.length
        selectionEnd =
          selectionEnd <= selectionStart
            ? selectionStart
            : value.indexOf(linesep, selectionEnd - 1)
        if (selectionEnd < 0) selectionEnd = value.length

        const text = value.substring(selectionStart, selectionEnd)
        const lines = text.split(linesep)
        let newLines
        if (lines.every((line) => line === '')) {
          newLines = lines.map(() => startText)
        } else if (
          lines.every((line) => line === '' || line.startsWith(startText))
        ) {
          newLines = lines.map((line) =>
            line === '' ? '' : line.substring(startText.length)
          )
        } else {
          newLines = lines.map((line) =>
            line === '' ? '' : startText.concat(line)
          )
        }
        const newText = newLines.join(linesep)
        input.setSelectionRange(selectionStart, selectionEnd)
        insertText(newText)
        if (newText === '' || newText === startText) {
          input.setSelectionRange(
            selectionStart + newText.length,
            selectionStart + newText.length
          )
        } else {
          input.setSelectionRange(
            selectionStart,
            selectionStart + newText.length + linesep.length
          )
        }
      }
      setMarkdown(true)
    }
  }

  function styleSpan(startText: string = '', endText: string = '') {
    return () => {
      const input = inputRef.current
      if (input) {
        const { selectionStart, selectionEnd, value } = input

        if (
          value.substring(selectionStart - startText.length, selectionStart) ===
            startText &&
          value.substring(selectionEnd, selectionEnd + endText.length) ===
            endText
        ) {
          input.setSelectionRange(
            selectionStart - startText.length,
            selectionEnd + endText.length
          )
          insertText(value.substring(selectionStart, selectionEnd))
          input.setSelectionRange(
            selectionStart - startText.length,
            selectionEnd - startText.length
          )
        } else if (
          selectionEnd - selectionStart > startText.length + endText.length &&
          value.substring(selectionStart, selectionStart + startText.length) ===
            startText &&
          value.substring(selectionEnd - endText.length, selectionEnd) ===
            endText
        ) {
          insertText(
            value.substring(
              selectionStart + startText.length,
              selectionEnd - endText.length
            )
          )
          input.setSelectionRange(
            selectionStart,
            selectionEnd - startText.length - endText.length
          )
        } else {
          insertText(
            startText
              .concat(value.substring(selectionStart, selectionEnd))
              .concat(endText)
          )
          input.setSelectionRange(
            selectionStart + startText.length,
            selectionEnd + startText.length
          )
        }
      }
      setMarkdown(true)
    }
  }

  function styleTable() {
    const input = inputRef.current
    if (input) {
      const { selectionStart } = input
      const newText = dedent`

        | Heading 1    | Heading 2    |
        | ------------ | ------------ |
        | Row 1, col 1 | Row 1, col 2 | 
        | Row 2, col 1 | Row 2, col 2 |

        `
      insertText(newText)
      input.setSelectionRange(selectionStart, selectionStart + newText.length)
    }
    setMarkdown(true)
  }

  const toolbar = (
    <>
      <StyleButton
        src={iconHeading}
        title="Heading"
        onClick={styleBlock('# ')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconBold}
        title="Bold"
        onClick={styleSpan('**', '**')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconItalic}
        title="Italic"
        onClick={styleSpan('*', '*')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconCode}
        title="Code"
        onClick={styleSpan('`', '`')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconLink}
        title="Link"
        onClick={styleSpan('[', ']()')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconQuote}
        title="Quote"
        onClick={styleBlock('> ')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconListBulleted}
        title="Bulleted List"
        onClick={styleBlock('- ')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconListNumbered}
        title="Numbered List"
        onClick={styleBlock('1. ')}
        disabled={!markdown}
      />
      <StyleButton
        src={iconTable}
        title="Table"
        onClick={styleTable}
        disabled={!markdown}
      />
    </>
  )

  return (
    <div
      className={styles.editor}
      onMouseDown={(e) => {
        if (editing && e.target !== inputRef.current) {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }}
    >
      <Grid row className="position-absolute width-full padding-top-05">
        <Grid
          col="auto"
          className="width-1 margin-bottom-05 border-primary border-bottom-2px"
        />
        <Grid col="auto">
          <TabButtonGroup>
            <TabButton
              defaultChecked
              id="editButton"
              aria-controls="body"
              onClick={edit}
            >
              Edit
            </TabButton>
            <TabButton
              onClick={preview}
              aria-controls="preview"
              id="previewButton"
            >
              Preview
            </TabButton>
          </TabButtonGroup>
        </Grid>
        <Grid
          col="auto"
          className="margin-bottom-05 padding-top-1 padding-left-1 border-primary border-bottom-2px"
        >
          <input
            type="hidden"
            name="format"
            value={markdown ? 'text/markdown' : 'text/plain'}
          />
          <ButtonGroup type="segmented">
            <PlainTextButton
              {...toggleMarkdownButtonProps}
              checked={!markdown}
              onClick={() => {
                markdownStateSetter?.('text/plain')
                toggleMarkdown()
              }}
            />
            <MarkdownButton
              {...toggleMarkdownButtonProps}
              checked={markdown}
              onClick={() => {
                markdownStateSetter?.('text/markdown')
                toggleMarkdown()
              }}
            />
          </ButtonGroup>
        </Grid>
        {editing && (
          <Grid
            col="auto"
            className="display-none tablet:display-block margin-bottom-05 padding-top-1 padding-left-1 border-primary border-bottom-2px"
          >
            {toolbar}
          </Grid>
        )}
        <Grid
          col="fill"
          className="text-right margin-bottom-05 padding-top-1 padding-x-1 border-primary border-bottom-2px"
        >
          {editing && (
            <span className="display-inline tablet:display-none">
              <StyleButton
                title="Markdown formatting options"
                src={iconEllipsis}
                onClick={() => {
                  toggleShowPopover()
                }}
                disabled={!markdown}
              />
            </span>
          )}
        </Grid>
      </Grid>
      {editing && showPopover && (
        <CardGroup
          className={classNames(
            'display-inline tablet:display-none',
            styles.toolbarPopover
          )}
        >
          <Card>
            <CardBody>{toolbar}</CardBody>
          </Card>
        </CardGroup>
      )}
      <Textarea
        id="body"
        name="body"
        aria-labelledby="editButton"
        className={classNames(
          { [styles.hidden]: !editing },
          'font-code-sm',
          className
        )}
        defaultValue={defaultValue}
        inputRef={inputRef}
        onChange={(e) => {
          setValue(e.target.value)
          onChange?.(e)
        }}
        onKeyDown={onKeyDown}
        {...props}
      />
      {editing || (
        <Preview
          id="preview"
          role="tabpanel"
          aria-labelledby="previewButton"
          className={styles.preview}
        >
          {value}
        </Preview>
      )}
    </div>
  )
}
