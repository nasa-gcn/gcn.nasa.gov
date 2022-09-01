/*!
 * Copyright © 2022 United States Government as represented by the Administrator
 * of the National Aeronautics and Space Administration. No copyright is claimed
 * in the United States under Title 17, U.S. Code. All Other Rights Reserved.
 *
 * SPDX-License-Identifier: NASA-1.3
 */

import { useState } from 'react'
import { triggerRate } from '~/lib/prometheus'
import { NestedCheckboxes } from './NestedCheckboxes'

const NoticeTypes = {
  Agile: [
    'AGILE_GRB_GROUND',
    'AGILE_GRB_POS_TEST',
    'AGILE_GRB_REFINED',
    'AGILE_GRB_WAKEUP',
    'AGILE_MCAL_ALERT',
    'AGILE_POINTDIR',
    'AGILE_TRANS',
  ],
  AMON: [
    'AMON_ICECUBE_COINC',
    'AMON_ICECUBE_EHE',
    'AMON_ICECUBE_HESE',
    'AMON_NU_EM_COINC',
  ],
  Calet: ['CALET_GBM_FLT_LC', 'CALET_GBM_GND_LC'],
  Fermi: [
    'FERMI_GBM_ALERT',
    'FERMI_GBM_FIN_POS',
    'FERMI_GBM_FLT_POS',
    'FERMI_GBM_GND_POS',
    'FERMI_GBM_LC',
    'FERMI_GBM_POS_TEST',
    'FERMI_GBM_SUBTHRESH',
    'FERMI_GBM_TRANS',
    'FERMI_LAT_GND',
    'FERMI_LAT_MONITOR',
    'FERMI_LAT_OFFLINE',
    'FERMI_LAT_POS_DIAG',
    'FERMI_LAT_POS_INI',
    'FERMI_LAT_POS_TEST',
    'FERMI_LAT_POS_UPD',
    'FERMI_LAT_TRANS',
    'FERMI_POINTDIR',
    'FERMI_SC_SLEW',
  ],
  IceCube: [
    'ICECUBE_ASTROTRACK_BRONZE',
    'ICECUBE_ASTROTRACK_GOLD',
    'ICECUBE_CASCADE',
  ],
  INTEGRAL: [
    'INTEGRAL_OFFLINE',
    'INTEGRAL_POINTDIR',
    'INTEGRAL_REFINED',
    'INTEGRAL_SPIACS',
    'INTEGRAL_WAKEUP',
    'INTEGRAL_WEAK',
  ],
  IPN: ['IPN_POS', 'IPN_RAW', 'IPN_SEG'],
  LVC: [
    'LVC_COUNTERPART',
    'LVC_EARLY_WARNING',
    'LVC_INITIAL',
    'LVC_PRELIMINARY',
    'LVC_RETRACTION',
    'LVC_TEST',
    'LVC_UPDATE',
  ],
  MAXI: ['MAXI_KNOWN', 'MAXI_TEST', 'MAXI_UNKNOWN'],
  Swift: [
    'SWIFT_ACTUAL_POINTDIR',
    'SWIFT_BAT_ALARM_LONG',
    'SWIFT_BAT_ALARM_SHORT',
    'SWIFT_BAT_GRB_ALERT',
    'SWIFT_BAT_GRB_LC',
    'SWIFT_BAT_GRB_LC_PROC',
    'SWIFT_BAT_GRB_POS_ACK',
    'SWIFT_BAT_GRB_POS_NACK',
    'SWIFT_BAT_GRB_POS_TEST',
    'SWIFT_BAT_KNOWN_SRC',
    'SWIFT_BAT_MONITOR',
    'SWIFT_BAT_QL_POS',
    'SWIFT_BAT_SCALEDMAP',
    'SWIFT_BAT_SLEW_POS',
    'SWIFT_BAT_SUB_THRESHOLD',
    'SWIFT_BAT_SUBSUB',
    'SWIFT_BAT_TRANS',
    'SWIFT_FOM_OBS',
    'SWIFT_FOM_PPT_ARG_ERR',
    'SWIFT_FOM_SAFE_POINT',
    'SWIFT_FOM_SLEW_ABORT',
    'SWIFT_POINTDIR',
    'SWIFT_SC_SLEW',
    'SWIFT_TOO_FOM',
    'SWIFT_TOO_SC_SLEW',
    'SWIFT_UVOT_DBURST',
    'SWIFT_UVOT_DBURST_PROC',
    'SWIFT_UVOT_EMERGENCY',
    'SWIFT_UVOT_FCHART',
    'SWIFT_UVOT_FCHART_PROC',
    'SWIFT_UVOT_POS',
    'SWIFT_UVOT_POS_NACK',
    'SWIFT_XRT_CENTROID',
    'SWIFT_XRT_EMERGENCY',
    'SWIFT_XRT_IMAGE',
    'SWIFT_XRT_IMAGE_PROC',
    'SWIFT_XRT_LC',
    'SWIFT_XRT_POSITION',
    'SWIFT_XRT_SPECTRUM',
    'SWIFT_XRT_SPECTRUM_PROC',
    'SWIFT_XRT_SPER',
    'SWIFT_XRT_SPER_PROC',
    'SWIFT_XRT_THRESHPIX',
    'SWIFT_XRT_THRESHPIX_PROC',
  ],
  Other: [
    'AAVSO',
    'ALEXIS_SRC',
    'BRAD_COORDS',
    'CBAT',
    'COINCIDENCE',
    'COMPTEL_SRC',
    'DOW_TOD',
    'GRB_CNTRPART',
    'GRB_COORDS',
    'GRB_FINAL',
    'GWHEN_COINC',
    'HAWC_BURST_MONITOR',
    'HUNTS_SRC',
    'KONUS_LC',
    'MAXBC',
    'MILAGRO_POS',
    'MOA',
    'OGLE',
    'SIMBADNED',
    'SK_SN',
    'SNEWS',
    'SUZAKU_LC',
    'TEST_COORDS',
  ],
}
const NoticeTypeLinks: { [key: string]: string | undefined } = {
  Agile: 'agile',
  AMON: 'icecube',
  Calet: 'calet',
  Fermi: 'fermi',
  IceCube: 'icecube',
  INTEGRAL: 'integral',
  IPN: '',
  LVC: 'lvk',
  MAXI: 'maxi',
  Swift: 'swift',
  Other: undefined,
}

type DataRow = {
  topic: string
  latestRate: number
}

type FormattedData = {
  text: DataRow[]
  binary: DataRow[]
  voevent: DataRow[]
}

interface NoticeTypeCheckboxProps {
  defaultSelected?: string[]
  selectedFormat?: 'binary' | 'text' | 'voevent'
  validationFunction?: (arg: any) => void
}

export function NoticeTypeCheckboxes({
  defaultSelected,
  selectedFormat = 'text',
  validationFunction,
}: NoticeTypeCheckboxProps) {
  const [userSelected, setUserSelected] = useState<{ [key: string]: boolean }>(
    {}
  )
  const [selectedCounter, setSelectedCounter] = useState(0)
  const [alertEstimate, setAlertEstimate] = useState(0)

  const metrics: FormattedData = {
    text: getMetricsByFormat('.text.'),
    binary: getMetricsByFormat('.binary.'),
    voevent: getMetricsByFormat('.voevent.'),
  }

  const counterfunction = (childRef: HTMLInputElement) => {
    userSelected[childRef.name] = childRef.checked
    setUserSelected(userSelected)

    let selectedTotal = 0
    for (const key of Object.keys(userSelected)) {
      if (userSelected[key]) {
        selectedTotal++
      }
    }
    setSelectedCounter(selectedTotal)

    if (metrics) {
      setAlertEstimate(getSum(metrics))
    }

    if (validationFunction) {
      validationFunction(selectedCounter)
    }
  }

  function getSum(metrics: FormattedData) {
    return metrics[selectedFormat]
      .filter((item) => userSelected[item.topic])
      .map((item) => item.latestRate)
      .reduce((partialSum, a) => partialSum + a, 0)
  }

  return (
    <>
      <NestedCheckboxes
        nodes={Object.entries(NoticeTypes).map(([mission, noticeTypes]) => ({
          id: mission,
          label: mission,
          name: '',
          link: NoticeTypeLinks[mission]
            ? '/missions/' + NoticeTypeLinks[mission]
            : undefined,
          nodes: noticeTypes.map((noticeType) => ({
            id: noticeType,
            label: (
              <>
                {noticeType}
                {metrics ? (
                  <div className="padding-left-1 display-inline">
                    <small className="text-base-light">
                      ~{' '}
                      {metrics[selectedFormat].find(
                        (item) => item.topic == noticeType
                      )?.latestRate ?? 0}{' '}
                      alerts / day
                    </small>
                  </div>
                ) : null}
              </>
            ),
            name: noticeType,
            className: 'sub-option',
            defaultChecked: defaultSelected
              ? defaultSelected.indexOf(noticeType) > -1
              : false,
          })),
        }))}
        childoncheckhandler={counterfunction}
      />
      <div className="text-bold text-ink">
        {selectedCounter} selected alert{selectedCounter == 1 ? '' : 's'} for an
        estimated total of {alertEstimate} alert
        {alertEstimate == 1 ? '' : 's'} per day
      </div>
    </>
  )
}
function getMetricsByFormat(format: string): DataRow[] {
  return triggerRate.result
    .filter(
      (item: { metric: { topic: string } }) =>
        item.metric.topic.indexOf(format) != -1
    )
    .map((item: { metric: { topic: any }; values: string | any[] }) => ({
      topic: item.metric.topic.split('.')[3],
      latestRate: Math.ceil(item.values[item.values.length - 1][1]),
    }))
}
