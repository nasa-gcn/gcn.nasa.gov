/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react'

import type { NoticeFormat } from '../NoticeFormat'
import { NestedCheckboxes } from '../nested-checkboxes/NestedCheckboxes'
import { NoticeTypes } from './Notices'
import { triggerRate } from './rates'
import { useFeature } from '~/root'

const minRate = 1 / 7

function humanizedCount(count: number, singular: string, plural?: string) {
  const noun = count === 1 ? singular : (plural ?? `${singular}s`)
  return `${count} ${noun}`
}

function humanizedRate(rate: number, singular: string, plural?: string) {
  let isUpperBound
  if (rate < minRate) {
    isUpperBound = true
    rate = minRate
  }

  let unit = 'day'
  if (rate) {
    for (const { factor, unit: proposedUnit } of [
      { factor: 1 / 86400, unit: 'second' },
      { factor: 3600, unit: 'hour' },
      { factor: 24, unit: 'day' },
      { factor: 7, unit: 'week' },
      { factor: 4, unit: 'month' },
      { factor: 12, unit: 'year' },
    ]) {
      rate *= factor
      unit = proposedUnit
      if (rate > 0.5) break
    }
  }
  return `${isUpperBound ? '< ' : ''}${humanizedCount(Math.round(rate), singular, plural)} per ${unit}`
}

const NoticeTypeLinks: { [key: string]: string | undefined } = {
  AGILE: 'agile',
  AMON: 'icecube',
  Calet: 'calet',
  Fermi: 'fermi',
  IceCube: 'icecube',
  INTEGRAL: 'integral',
  IPN: '',
  GECAM: 'gecam',
  LVC: 'lvk',
  MAXI: 'maxi',
  Swift: 'swift',
  Other: undefined,
}

export const JsonNoticeTypes: { [key: string]: string[] } = {
  Circulars: ['gcn.circulars'],
  Heartbeat: ['gcn.heartbeat'],
  IceCube: ['gcn.notices.icecube.lvk_nu_track_search'],
  LVK: ['igwn.gwalert'],
  Swift: ['gcn.notices.swift.bat.guano'],
  'DSA-110': ['gcn.notices.dsa110.frb'],
  'Einstein Probe': ['gcn.notices.einstein_probe.wxt.alert'],
  'Super-Kamiokande': ['gcn.notices.superk.sn_alert'],
}

const JsonNoticeTypeLinks: { [key: string]: string | undefined } = {
  Circulars: '/circulars',
  Heartbeat: '/docs/faq#how-can-i-tell-that-my-kafka-client-is-working',
  IceCube: '/missions/icecube',
  LVK: 'https://emfollow.docs.ligo.org/userguide/tutorial/receiving/gcn.html#receiving-and-parsing-notices',
  Swift: '/missions/swift',
  'DSA-110': '/missions/dsa110',
  'Einstein Probe': '/missions/einstein-probe',
  'Super-Kamiokande': '/missions/sksn',
}

interface NoticeTypeCheckboxProps {
  defaultSelected?: string[]
  selectedFormat?: NoticeFormat
  validationFunction?: (arg: any) => void
}

export function NoticeTypeCheckboxes({
  defaultSelected,
  selectedFormat = 'text',
  validationFunction,
}: NoticeTypeCheckboxProps) {
  const [userSelected, setUserSelected] = useState(new Set<string>())
  const [selectedCounter, setSelectedCounter] = useState(0)
  const [alertEstimate, setAlertEstimate] = useState(0)

  if (useFeature('SVOM_QUICKSTART')) {
    JsonNoticeTypes.SVOM = ['gcn.notices.svom']
    JsonNoticeTypeLinks.SVOM = '/missions/svom'
  }

  const displayNoticeTypes: { [key: string]: string[] } = {
    ...NoticeTypes,
  }

  if (selectedFormat == 'voevent') {
    displayNoticeTypes['SVOM'] = [
      'gcn.notices.svom.voevent.grm',
      'gcn.notices.svom.voevent.eclairs',
      'gcn.notices.svom.voevent.mxt',
    ]
  }

  if (useFeature('FERMI_GBM_QUICKSTART')) {
    JsonNoticeTypes.Fermi = ['gcn.notices.fermi.gbm']
    JsonNoticeTypeLinks.Fermi = '/missions/fermi'
  }

  if (useFeature('CHIME')) {
    JsonNoticeTypes.Chime = ['gcn.notices.chime.alert']
    JsonNoticeTypeLinks.Chime = '/missions/chime'
  }

  if (useFeature('KM3NET')) {
    JsonNoticeTypes.KM3NET = ['gcn.notices.km3net']
    JsonNoticeTypeLinks.KM3NET = '/missions/km3net'
  }

  const counterFunction = (childRef: HTMLInputElement) => {
    if (childRef.checked) {
      userSelected.add(childRef.name)
    } else {
      userSelected.delete(childRef.name)
    }
    setUserSelected(userSelected)

    setSelectedCounter(userSelected.size)

    let estimate = 0
    for (const noticeType of userSelected) {
      estimate +=
        triggerRate[
          selectedFormat === 'json'
            ? noticeType
            : `gcn.classic.${selectedFormat}.${noticeType}`
        ] ?? 0
    }
    setAlertEstimate(estimate)

    if (validationFunction) {
      validationFunction(selectedCounter)
    }
  }

  return (
    <>
      <NestedCheckboxes
        key={selectedFormat}
        nodes={Object.entries(
          selectedFormat == 'json' ? JsonNoticeTypes : displayNoticeTypes
        ).map(([mission, noticeTypes]) => ({
          id: mission,
          label: mission,
          name: '',
          link:
            selectedFormat !== 'json'
              ? NoticeTypeLinks[mission]
                ? `/missions/${NoticeTypeLinks[mission]}`
                : undefined
              : JsonNoticeTypeLinks[mission],
          nodes: noticeTypes.map((noticeType) => ({
            id: noticeType,
            label: (
              <>
                {noticeType}
                <div className="padding-left-1 display-inline">
                  <small className="text-base-light">
                    {humanizedRate(
                      triggerRate[
                        selectedFormat === 'json'
                          ? noticeType
                          : `gcn.classic.${selectedFormat}.${noticeType}`
                      ] ?? 0,
                      'alert'
                    )}
                  </small>
                </div>
              </>
            ),
            name: noticeType,
            className: 'sub-option',
            defaultChecked: defaultSelected
              ? defaultSelected.indexOf(noticeType) > -1
              : false,
          })),
        }))}
        childOnCheckHandler={counterFunction}
      />
      <div className="text-bold text-ink">
        {humanizedCount(selectedCounter, 'notice type')} selected for{' '}
        {humanizedRate(alertEstimate, 'alert')}
      </div>
    </>
  )
}
