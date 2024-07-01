/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

import AnnounceBanner, {
  AnnouncementEvent,
} from '../../app/root/AnnounceBanner'

const linkString = 'Register'

describe('AnnounceBanner component', () => {
  const linkString = 'Register'

  test('renders header text', async () => {
    render(<AnnounceBanner message="Header Text" />)
    const headerText = screen.getByText('Header Text')
    expect(headerText).toBeInTheDocument()
  })

  test('renders children when showFullBanner is true', () => {
    render(
      <AnnounceBanner message="Header Text">
        <AnnouncementEvent
          time="August 1, 2022 12:00-13:00 UTC"
          link="https://bit.ly/3Pt2TH9"
          linkstring={linkString}
          region="Atlantic"
        />
      </AnnounceBanner>
    )
    const eventTime = screen.getByText('August 1, 2022 12:00-13:00 UTC')
    const eventLink = screen.getByText(linkString)
    expect(eventTime).toBeInTheDocument()
    expect(eventLink).toBeInTheDocument()
  })

  test('does not render children when showFullBanner is false', () => {
    render(
      <AnnounceBanner message="Header Text">
        <AnnouncementEvent
          time="August 1, 2022 12:00-13:00 UTC"
          link="https://bit.ly/3Pt2TH9"
          linkstring={linkString}
          region="Atlantic"
        />
      </AnnounceBanner>
    )
    const button = screen.getByRole('button')
    fireEvent.click(button)
    const eventTime = screen.queryByText('August 1, 2022 12:00-13:00 UTC')
    const eventLink = screen.queryByText(linkString)
    expect(eventTime).not.toBeInTheDocument()
    expect(eventLink).not.toBeInTheDocument()
  })

  test('toggles showFullBanner when button is clicked', () => {
    render(<AnnounceBanner message="Header Text" />)
    const button = screen.getByRole('button')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Show more')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Show less')
  })

  test('renders presentation link', () => {
    render(<AnnounceBanner message="Header Text" />)
    const link = screen.getByText('presentation')
    expect(link).toHaveAttribute(
      'href',
      'https://nasa-gcn.github.io/gcn-presentation/'
    )
    expect(link).toHaveAttribute('rel', 'external noopener')
  })
})

describe('AnnouncementEvent component', () => {
  test('renders event information', () => {
    render(
      <AnnouncementEvent
        time="August 1, 2022 12:00-13:00 UTC"
        link="https://bit.ly/3Pt2TH9"
        linkstring={linkString}
        region="Atlantic"
      />
    )
    const eventTime = screen.getByText('August 1, 2022 12:00-13:00 UTC')
    const eventLink = screen.getByText(linkString)

    expect(eventTime).toBeInTheDocument()
    expect(eventLink).toBeInTheDocument()
  })
})
