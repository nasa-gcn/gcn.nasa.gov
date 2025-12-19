import { expect, test } from '@playwright/test'

const loadingTestsCircular = {
  subject: 'LIGO/Virgo/KAGRA S240630t: Updated Sky localization',
  eventId: 'LIGO/Virgo/KAGRA S240630t',
  submittedHow: 'web',
  // createdOn: 1719767201026,
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
  // createdOn: '2024-09-18 06:00',
  circularId: 34370,
  submitter:
    'Antonio Martin-Carrillo at UCD,Space Science Group <antonio.martin-carrillo@ucd.ie>',
  body: 'A. Martin-Carrillo (UCD), B. Schneider (MIT), T. Laskar (Utah), B. P. Gompertz (U. Birmingham), D. B. Malesani (Radboud and DAWN/NBI), A. de Ugarte Postigo (OCA/CNRS), A. J. Levan (Radboud), G. Finneran (UCD), J.F. Agui Fernandez (IAA-CSIC),  C.C. Thoene (ASU-CAS), V. D\'Elia (ASI-SSDC and INAF-OAR) and L. Izzo (INAF-OACN and DARK/NBI) report on behalf of a larger collaboration:\n\nWe obtained photometric observations of the orphan GRB afterglow ZTF23aaoohpy/AT2023lcr (Andreoni et al., GCN 3402; Swain et al., GCN 34022; Kumar et al., GCN 34025; Adami et al., GCN 34030; Perley et al., GCN 34031; Jiang et al., GCN 34040; Chen et al., GCN 34043) with the James Webb Space Telescope on 7 August 2023 (DDT program 4554, PI Martin-Carrillo). This was about 50.6 days after the likely explosion epoch (Gompertz et al., GCN 34023). Observations were obtained with the NIRCam instrument in the F115W, F150W, F277W, and F356W filters.\n\nAt the location of the optical/NIR transient, we detect a point-like source in all four bands, with F115W(AB) ~ 25.48 +/- 0.20. A fainter, extended source is observed about 0.5" to the S-W, which could be the host galaxy of AT 2023lcr.\n\nThese observations are in excess of the expected power-law decay of the GRB afterglow and are consistent with a supernova component.\n\nFurther analysis and observations are ongoing.\n\nWe thank the staff of STScI for their work to get these observations rapidly scheduled, in particular Alison Vick, Tony Keyes, Mario Gennaro and Armin Rest.',
  eventId: 'ZTF23aaoohpy',
}

const eventIdTestsCircular = {
  subject: 'GRB 230812B: GMG - GRANDMA observations',
  submittedHow: 'web',
  bibcode: '2023GCN.34404....1M',
  createdOn: 1691937605563,
  circularId: 34404,
  submitter: 'Jirong Mao at Yunnan Obs <jirongmao@mail.ynao.ac.cn>',
  body: 'J. Mao, K.-X. Lu, J.-M. Bai (YNAO), S. Karpov (FZU), M. C. Coughlin (UMN), A. Ugarte Postigo, S. Antier (OCA), O. Pyhsna (Univ. KieV), Z. Vidadi (Shao) on behalf of the Yunnan observatories team and the GRANDMA team:\n\nWe observed the field of GRB 230812B (Lesage et al. GCN 34387; Scotton et al. GCN 34392; Page GCN 34394; Zheng & Filippenko GCN 34395; Lipunov et al. GCN 34396; Salgundi et al. GCN 34397; Ackley et al. GCN 34398; Xiong et al. GCN 34401; Casentini et al. 34002; Frederiks et al. 34404) by the GMG telescope in Yunnan observatories. The observation began from UT 13:34:22 August 13, 2023, about 18.5 hours from the trigger. We clearly observed the optical afterglow of R~19.9+/-0.1. The further observation is ongoing.\n',
  eventId: 'GRB 230812B',
}

test.beforeEach(async ({ page }) => {
  await page.goto('/circulars')
  await page.waitForSelector('#query')
})

test.describe('Circulars edit page', () => {
  test('populates all fields on load', async ({ page }) => {
    test.slow()
    await page.goto(`/circulars/new/${loadingTestsCircular.circularId}`)
    await expect(page.locator('#submitter')).toHaveValue(
      loadingTestsCircular.submitter
    )
    await expect(page.locator('#subject')).toHaveValue(
      loadingTestsCircular.subject
    )
    await expect(page.getByTestId('textarea')).toHaveValue(
      loadingTestsCircular.body
    )
  })

  test('correctly updates EventId on subject edits', async ({ page }) => {
    test.slow()
    const originalEventId = 'GRB 230812B'
    const newEventId = 'GRB 230813B'
    // Replace subject with an updated ID that the event will parse out
    const testSubject = eventIdTestsCircular.subject.replace(
      originalEventId,
      newEventId
    )
    await page.goto(`/circulars/new/${eventIdTestsCircular.circularId}`)
    await page.locator('#subject').fill(testSubject)
    await page
      .getByRole('button', { name: 'Save as New Version' })
      .click({ timeout: 10000 })
    await page.waitForURL('/circulars?index')
    // Check for new event ID
    await page.goto(`/circulars/${eventIdTestsCircular.circularId}`)
    await expect(
      page.getByRole('link', {
        name: newEventId,
      })
    ).toBeVisible()
    // Reset Event ID for other browser to continue check
    await page.goto(`/circulars/new/${eventIdTestsCircular.circularId}`)
    await page
      .locator('#subject')
      .fill(testSubject.replace(newEventId, originalEventId))
    await page.waitForURL('/circulars?index')
    await page.goto(`/circulars/${eventIdTestsCircular.circularId}`)
    await expect(
      page.getByRole('link', {
        name: originalEventId,
      })
    ).toBeVisible()
  })

  test('submits expected values', async ({ page, browserName }) => {
    test.slow()
    const testSubject = `${editTestsCircular.subject} - ${browserName}`
    await page.goto(`/circulars/new/${editTestsCircular.circularId}`)
    await page.locator('#submitter').fill(editTestsCircular.submitter)
    await page.locator('#subject').fill(testSubject)
    await page.getByTestId('textarea').fill(editTestsCircular.body)
    await page
      .getByRole('button', { name: 'Save as New Version' })
      .click({ timeout: 10000 })
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
