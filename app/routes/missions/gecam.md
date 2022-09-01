---
meta:
  title: GCN - GECAM
---

# Gravitational Wave High-energy Electromagnetic Counterpart All-sky Monitor

<img 
  src="/_static/img/gecam.png"
  align="right"
  alt="GECAM logo"
  className="grid-col-6 mobile-lg:grid-col-4 tablet:grid-col-2 desktop:grid-col-3"
/>

**Launch Date:** December 9, 2020

**End of Operations:** No specific requirement

**Data Archives:** http://gcn.gsfc.nasa.gov/gecam_events.html
GECAM is a constellation of two small X-ray and gamma-ray all-sky observatories. These two microsatellites, denoted as GECAM-A and GECAM-B, are designed to operate on opposite sides of the Earth. Each GECAM satellite features a dome-shaped array of 25 Gamma-ray detectors (GRD) and 8 Charged particle detectors (CPD). Each satellite can monitor the all-sky un-occulted by the Earth, thus two satellites together could watch the entire sky. Due to unexpected anomalies in power supply system, GECAM-A has not been able to observe yet, and GECAM-B can observe about 10 hours per day since January 14, 2021, and about 21 hours per day since May 30, 2022.

<div className="overflow-table">

| Instruments | Energy Range | Field of View | Localization                              |
| ----------- | ------------ | ------------- | ----------------------------------------- |
| GECAM-B     | 15 keV–5 MeV | 7.5 ster      | ~1-10 deg (radius, stat, 68% containment) |

</div>

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](http://www.nssc.cas.cn/gecam_en/)

<div className="overflow-table">

| Type        | Contents | Latency |
| ----------- | -------- | ------- |
| `GECAM_FLT` | Flight   | Minutes |
| `GECAM_GND` | Ground   | Minutes |

</div>

**Yearly Trigger Rates:**

<div className="overflow-table">

| Instrument | Type                                                   | Rates |
| ---------- | ------------------------------------------------------ | ----- |
| GECAM      | GRBs, other transients, and non-astrophysical triggers | ~500  |

</div>

Real notices will have Trigger_Number values between 1 and 99999999. Test notices will have Trigger_Number values greater than or equal to 100000000.
