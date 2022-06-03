---
meta:
  title: GCN - CALET
---

# CALET

<div className="width-card-lg float-right">
  <img 
    src="/_static/img/calet-logo.png"
    alt="CALET logo"
  />
</div>

**Launch Date:** August 19, 2015

**Extended Mission Lifetime:** 2025+ (Pending NASA Review)

**End of Operations:** No specific requirement (no consumables, no significant degradation)

**Data Archive:**
https://heasarc.gsfc.nasa.gov/cgi-bin/W3Browse/w3table.pl?MissionHelp=calet

The CALorimetric Electron Telescope ([CALET](http://www.yoshida-agu.net/research/calet) is ISS mission studying cosmic rays, signatures for dark matter, and gamma-ray bursts. CALET was developed by JAXA with contributions from the Italian Space Agency and [NASA](https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=1027).

| Instruments                  | Energy Range   | Field of View |
| ---------------------------- | -------------- | ------------- |
| Hard X-ray Monitor (HXM)     | 40 keV–20 MeV  | ~8 ster       |
| Soft Gamma-ray Monitor (SGM) | 7 keV–1000 keV | ~3 ster       |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/calet.html)

| Type               | Contents                             | Latency |
| ------------------ | ------------------------------------ | ------- |
| `CALET_GBM_FLT_LC` | Signifcance and CALET-GBM Lightcurve | Minutes |

**CALET-GBM Yearly Trigger Rates:**

| Instrument | Type                                                   | Rates   |
| ---------- | ------------------------------------------------------ | ------- |
| CALET      | GRBs, other transients, and non-astrophysical triggers | 140-150 |

Approximately half of CALET triggers will be of non-astrophysical origin.
