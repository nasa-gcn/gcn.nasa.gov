import { expect, test } from '@playwright/test'

const testCircular = {
  subject:
    'ZTF and SEDM Observations of the Candidate Optical Afterglow AT 2023sva',
  submittedHow: 'web',
  createdOn: 1695059730507,
  circularId: 34730,
  submitter: 'jlv93@cornell.edu',
  body: 'Jada L. Vail, Maggie L. Li (Cornell), Jacob Wise (LJMU), D. A. Perley (LJMU), Anna Y. Q. Ho (Cornell), Eric Burns (LSU), Michael Coughlin (UMN) report: \n\nWe report the identification of a fast-evolving red transient by the Zwicky Transient Facility (ZTF) and Spectral Energy Distribution Machine (SEDM). AT 2023sva is located at the position (J2000) of:\n\nRA = 00:56:59.19 (14.24662 deg)\nDec = +80:08:44.12 (80.14559 deg)\n\nIt was first detected by ZTF on 2023-09-17 09:38:31 UT at r = 17.71 +/- 0.05 mag (MJD=60204.40175) and g = 18.49 +/- 0.06 mag (MJD=60204.44580) as part of the public all-sky survey. ZTF also obtained a non-detection ~2 days prior at r > 20.91 mag  (MJD=60202.24319), indicating a fast rise rate of >1.5 mag/day in r. The transient was detected in follow-up Spectral Energy Distribution Machine (SEDM) observations at r = 20.22 +/- 0.08 mag (MJD=60205.48761) and g = 20.73 +/- 0.10 mag (MJD=60205.48597), implying red colors and rapid fading (~2.3 mag/day fade in r). \n\nAT2023sva was also detected by ATLAS (ATLAS23srq) at MJD 60204.43499 and saved to the TNS (Tonry et al. 2023, TNS Report No. 188327). The last ATLAS non-detection was at MJD 60202.48470. The Galactic latitude of AT 2023sva is 17.27 degrees, and the Galactic reddening toward the direction of AT 2023sva is: E(g-r) = 0.249 from Schlafly & Finkbeiner (2011).\n\nThe fast rise, fast decay, red color, and lack of an archival optical counterpart make AT 2023sva a strong candidate afterglow. We identify the temporally and spatially coincident Fermi-GBM trigger bn230916144 / 716527670, initially classified as a GRB with 64% probability at position (J2000) of RA, Dec = 00:26:52.8, +87:43:12. The localization error radius is 21.44 deg. The time of the GBM trigger was 2023-09-16 03:27:46 UT (MJD=60203.14428), 1.3 days prior to the first ZTF detection of AT 2023sva. If the Fermi-GBM trigger is indeed a GRB then we suggest this as the prompt counterpart to AT 2023sva. If the trigger is of another origin, then no identified prompt signal has been reported thus far.\n\nWe encourage spectroscopic follow-up observations.\n\nZTF is supported by the National Science Foundation under Grant No. AST-2034437 and a collaboration including Caltech, IPAC, the Weizmann Institute for Science, the Oskar Klein Center at Stockholm University, the University of Maryland, Deutsches Elektronen-Synchrotron and Humboldt University, the TANGO Consortium of Taiwan, the University of Wisconsin at Milwaukee, Trinity College Dublin, Lawrence Livermore National Laboratories, and IN2P3, France. Operations are conducted by COO, IPAC, and UW.\n\nSED Machine is based upon work supported by the National Science Foundation under Grant No. 1106171.\n',
}
const testDateTime = new Date(testCircular.createdOn)

const testDate = testDateTime.toISOString().split('T')[0]
// Formatting to 12 hours
const testTime = `${testDateTime.getUTCHours() % 12}:${testDateTime.getUTCMinutes()}${testDateTime.getUTCHours() > 12 ? 'pm' : 'am'}`

test.describe('Circulars archive page', () => {
  test('responds to changes in the number of results per page', async ({
    page,
  }) => {
    await page.goto('/circulars')
    for (const expectedResultsPerPage of [10, 20]) {
      await page
        .getByTitle('Number of results per page')
        .selectOption({ label: `${expectedResultsPerPage} / page` })
      await page.waitForFunction(
        (n) =>
          document.getElementsByTagName('ol')[0].getElementsByTagName('li')
            .length === n,
        expectedResultsPerPage
      )
    }
  })
})

test.describe('Circulars edit page', () => {
  test('populates all fields on load', async ({ page }) => {
    await page.goto(`/circulars/edit/${testCircular.circularId}`)
    await expect(page.locator('#submitter')).toHaveValue(testCircular.submitter)
    await expect(page.getByTestId('date-picker-external-input')).toHaveValue(
      testDate
    )
    // Time is only mapped to the minute, and in 12 hour format (for now)
    await expect(page.getByTestId('combo-box-input')).toHaveValue(testTime)
    await expect(
      page.getByPlaceholder('GRB 240614A: observations of')
    ).toHaveValue(testCircular.subject)
    await expect(page.getByTestId('textarea')).toHaveValue(testCircular.body)
  })
})

test.describe('Circulars correction page', () => {
  test('populates all fields on load', async ({ page }) => {
    await page.goto(`/circulars/correction/${testCircular.circularId}`)
    await expect(page.locator('#submitter')).toHaveValue(testCircular.submitter)
    await expect(page.getByTestId('date-picker-external-input')).toHaveValue(
      testDate
    )
    // Time is only mapped to the minute, and in 12 hour format (for now)
    await expect(page.getByTestId('combo-box-input')).toHaveValue(testTime)
    await expect(
      page.getByPlaceholder('GRB 240614A: observations of')
    ).toHaveValue(testCircular.subject)
    await expect(page.getByTestId('textarea')).toHaveValue(testCircular.body)
  })
})
