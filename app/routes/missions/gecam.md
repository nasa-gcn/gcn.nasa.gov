---
meta:
  title: GCN - GECAM
---

# Gravitational Wave High-energy Electromagnetic Counterpart All-sky Monitor

image here?

**Launch Date:** December 9, 2020

**End of Operations:** No specific requirement

**Data Archives:** http://gcn.gsfc.nasa.gov/gecam_events.html
http://gcn.gsfc.nasa.gov/gcn/sock_pkt_def_doc.html

| Instruments | Energy Range | Field of View |
| ----------- | ------------ | ------------- |
| GECAM-A     | ??           | ??            |
| GECAM-B     | 15 keV–5 MeV | ??            |

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

REAL notices will have Trigger_Number values starting with "1", TEST notices will have Trigger_Number values starting with 100000000.
