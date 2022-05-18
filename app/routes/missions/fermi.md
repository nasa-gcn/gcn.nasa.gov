---
meta:
  title: GCN - Fermi
---

# Fermi Gamma-ray Space Telescope

<img 
  src="/_static/img/Fermi_Gamma-ray_Space_Telescope_logo.svg"
  width="200"
  align="right"
  alt="Fermi Gamma-ray Space Telescope logo"
/>

**Launch Date:** June 11, 2008

**Extended Mission Lifetime:** 2024+ (Pending NASA Senior Review)

**End of Operations:** No specific requirement (no consumables, no significant degradation)

**Data Archive:**
https://fermi.gsfc.nasa.gov/ssc/data/

[Fermi](https://fermi.gsfc.nasa.gov) is a probe class mission operated by [NASA](https://www.nasa.gov/fermi/) in partnership with DOE, and agencies in Italy, France, Sweden, Japan, and Germany. It surveys the sky over a wide gamma-ray band with two instruments, the LAT and GBM. Both instruments provide alerts to GCN autonomously upon the detection of transients.

| Instruments                                                          | Energy Range       | Field of View | Localization                             |
| -------------------------------------------------------------------- | ------------------ | ------------- | ---------------------------------------- |
| [Large Area Telescope (LAT)](https://glast.sites.stanford.edu)       | 20 MeV–&gt;300 GeV | 2.5 ster      | &leq;1° radius (statistical, 90%)        |
| [Gamma-ray Burst Monitor (GBM)](https://gammaray.msfc.nasa.gov/gbm/) | 8 keV–30 MeV       | 8.8 ster      | ≳1–10° radius (statistical + systematic) |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**

| Type                  | Contents                                              | Latency  |
| --------------------- | ----------------------------------------------------- | -------- |
| `FERMI_GBM_ALERT`     | Trigger info                                          | ~5 s     |
| `FERMI_GBM_FLT_POS`   | Flight localization, classification                   | ~10 s    |
| `FERMI_GBM_GND_POS`   | Updated ground localization using finer lookup tables | 20–300 s |
| `FERMI_GBM_FIN_POS`   | Final trigger localization                            | 15 min   |
| `FERMI_GBM_SUBTHRESH` | Ground pipeline detected signals                      | 0.5–6 h  |
| `FERMI_LAT_POS_INI`   | Onboard LAT detection, initial position               | 2–4 s    |
| `FERMI_LAT_POS_UPD`   | Updated onboard localization with more data           | 2–32 s   |
| `FERMI_LAT_GND`       | Ground localization of onboard trigger                | 8–12 h   |
| `FERMI_LAT_OFFLINE`   | Ground-detected GRB localization                      | 8–12 h   |
| `FERMI_LAT_TRANS`     | Unknown source transient                              | 1 d      |
| `FERMI_LAT_MONITOR`   | Known source flare                                    | 1 d      |
