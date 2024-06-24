import { expect, test } from '@playwright/test'

const loadingTestsCircular = {
  subject:
    'AMON Coincidence Alert from the sub-threshold IceCube-HAWC search NuEm-230927A',
  submittedHow: 'email-legacy',
  editedOn: 1695837395712,
  circularId: 34776,
  submitter: 'Hugo Ayala at Pennsylvania State University <hgayala@psu.edu>',
  body: 'The AMON,  IceCube, and HAWC collaborations report:\n\nThe AMON NuEm stream channel found a coincidence alert from the\nIceCube online neutrino selection + HAWC daily monitoring analysis.\nThe analysis looks for IceCube neutrino events -mostly atmospheric\nin origin- around the position and transit time of a HAWC cluster of\nlikely gamma rays, as identified in the integrated observations from\na single transit, in this case having a duration of 6.06 hours.\n\nThe HAWC transit interval starts from 2023/09/27 01:10:10 UT  to\n2023/09/27 07:20:17 UT\n(End of the HAWC transit time)\n\nThe location of the coincidence is reported as\nRA (J2000): 331.92 deg\nDec (J2000): 12.44 deg\nLocation uncertainty (50% containment): 0.13 deg (statistical only).\nLocation uncertainty (90% containment): 0.24 deg (statistical only).\n\nThe false alarm rate (FAR) of this coincidence is 3.9 per year.\nWe encourage follow-up observations of the alert region contingent on\nthe availability of resources and interest, given the quoted FAR.\n\nAMON seeks to perform a real-time correlation analysis of the\nhigh-energy signals across all known astronomical messengers. More\ninformation about AMON can be found in https://www.amon.psu.edu/\nInformation on the IceCube collaboration: http://icecube.wisc.edu/\nInformation on the HAWC collaboration: https://www.hawc-observatory.org\n',
  editedBy: 'Example at Example <example@example.com>',
  createdOn: 1694188746530,
  version: 3,
}

const editTestsCircular = {
  subject:
    'ZTF and SEDM Observations of the Candidate Optical Afterglow AT 2024sva',
  createdOn: '2024-09-18 06:00',
  submitter: 'example@example.com',
  body: 'Smaller body for Playwright test',
  circularId: 34730,
}

test.describe('Circulars edit page', () => {
  test('populates all fields on load', async ({ page }) => {
    test.slow()
    await page.goto(`/circulars/edit/${loadingTestsCircular.circularId}`)
    await expect(page.locator('#submitter')).toHaveValue(
      loadingTestsCircular.submitter
    )
    const testDateTime = new Date(loadingTestsCircular.createdOn).toISOString()
    await expect(page.locator('#createdOn')).toHaveValue(testDateTime)
    await expect(page.locator('#subject')).toHaveValue(
      loadingTestsCircular.subject
    )
    await expect(page.getByTestId('textarea')).toHaveValue(
      loadingTestsCircular.body
    )
  })

  test('submits expected values', async ({ page, browserName }) => {
    test.slow()
    const testSubject = `${editTestsCircular.subject} - ${browserName}`
    await page.goto(`/circulars/edit/${editTestsCircular.circularId}`)
    await page.locator('#submitter').fill(editTestsCircular.submitter)
    await page.locator('#createdOn').fill(editTestsCircular.createdOn)
    await page.locator('#subject').fill(testSubject)
    await page.getByTestId('textarea').fill(editTestsCircular.body)
    await page.getByRole('button', { name: 'Update' }).click({ timeout: 10000 })
    await page.waitForURL('/circulars?index')
    await expect(
      page.getByRole('link', {
        name: testSubject,
      })
    ).toBeVisible()
    await page
      .getByRole('link', {
        name: testSubject,
      })
      .click({ timeout: 10000 })
  })
})
