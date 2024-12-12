import { expect, test } from '@playwright/test'

const loadingTestsCircular = {
  subject: 'LIGO/Virgo/KAGRA S240630t: Updated Sky localization',
  eventId: 'LIGO/Virgo/KAGRA S240630t',
  submittedHow: 'web',
  createdOn: 1719767201026,
  circularId: 36796,
  submitter:
    'Christopher P L Berry at LVK Collaboration <christopher.berry@ligo.org>',
  format: 'text/plain',
  body: 'The LIGO Scientific Collaboration, the Virgo Collaboration, and the KAGRA Collaboration report:\n\nWe have conducted further analysis of the LIGO Hanford Observatory (H1), LIGO Livingston Observatory (L1), and Virgo Observatory (V1) data around the time of the compact binary merger (CBC) candidate S240630t (GCN Circular 36794). Parameter estimation has been performed using Bilby [1] and a new sky map, Bilby.multiorder.fits,0, distributed via GCN Notice, is available for retrieval from the GraceDB event page:\n\nhttps://gracedb.ligo.org/superevents/S240630t\n\nFor the Bilby.multiorder.fits,0 sky map, the 90% credible region is 670 deg2. Marginalized over the whole sky, the a posteriori luminosity distance estimate is 3161 +/- 841 Mpc (a posteriori mean +/- standard deviation).\n\nFor further information about analysis methodology and the contents of this alert, refer to the LIGO/Virgo/KAGRA Public Alerts User Guide https://emfollow.docs.ligo.org/.\n\n [1] Ashton et al. ApJS 241, 27 (2019) doi:10.3847/1538-4365/ab06fc and Morisaki et al. (2023) arXiv:2307.13380',
}

test.describe('Circulars correction page', () => {
  test('populates all fields on load', async ({ page }) => {
    test.slow()
    await page.goto(`/circulars/correction/${loadingTestsCircular.circularId}`)
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
})
