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

const editTestsCircular = {
  subject:
    'ZTF23aaoohpy/AT2023lcr: JWST observations consistent with the presence of a supernova',
  submittedHow: 'web',
  bibcode: '2023GCN.34370....1M',
  createdOn: '2024-09-18 06:00',
  circularId: 34370,
  submitter:
    'Antonio Martin-Carrillo at UCD,Space Science Group <antonio.martin-carrillo@ucd.ie>',
  body: 'A. Martin-Carrillo (UCD), B. Schneider (MIT), T. Laskar (Utah), B. P. Gompertz (U. Birmingham), D. B. Malesani (Radboud and DAWN/NBI), A. de Ugarte Postigo (OCA/CNRS), A. J. Levan (Radboud), G. Finneran (UCD), J.F. Agui Fernandez (IAA-CSIC),  C.C. Thoene (ASU-CAS), V. D\'Elia (ASI-SSDC and INAF-OAR) and L. Izzo (INAF-OACN and DARK/NBI) report on behalf of a larger collaboration:\n\nWe obtained photometric observations of the orphan GRB afterglow ZTF23aaoohpy/AT2023lcr (Andreoni et al., GCN 3402; Swain et al., GCN 34022; Kumar et al., GCN 34025; Adami et al., GCN 34030; Perley et al., GCN 34031; Jiang et al., GCN 34040; Chen et al., GCN 34043) with the James Webb Space Telescope on 7 August 2023 (DDT program 4554, PI Martin-Carrillo). This was about 50.6 days after the likely explosion epoch (Gompertz et al., GCN 34023). Observations were obtained with the NIRCam instrument in the F115W, F150W, F277W, and F356W filters.\n\nAt the location of the optical/NIR transient, we detect a point-like source in all four bands, with F115W(AB) ~ 25.48 +/- 0.20. A fainter, extended source is observed about 0.5" to the S-W, which could be the host galaxy of AT 2023lcr.\n\nThese observations are in excess of the expected power-law decay of the GRB afterglow and are consistent with a supernova component.\n\nFurther analysis and observations are ongoing.\n\nWe thank the staff of STScI for their work to get these observations rapidly scheduled, in particular Alison Vick, Tony Keyes, Mario Gennaro and Armin Rest.',
  eventId: 'ZTF23aaoohpy',
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
