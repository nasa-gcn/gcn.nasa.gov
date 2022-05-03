---
meta:
  title: GCN - Fermi
---

# Fermi Gamma-ray Space Telescope

<img 
  src="/_static/img/missions/Fermi_Gamma-ray_Space_Telescope_logo.png"
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

| Instruments                                                          | Energy Range         | Field of View | Localization                          |
| -------------------------------------------------------------------- | -------------------- | ------------- | ------------------------------------- |
| [Large Area Telescope (LAT)](https://glast.sites.stanford.edu)       | 20 MeV - &gt;300 GeV | 2.5 ster      | &leq; 1 deg radius (statistical, 90%) |
| [Gamma-ray Burst Monitor (GBM)](https://gammaray.msfc.nasa.gov/gbm/) | 8 keV - 30 MeV       | 8.8 ster      | few-10's of degs radius stat + sys    |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
| Type | Contents | Latency |
| - | - | - |
| Fermi-GBM Alert | Trigger info | &sim;5 s |
| Fermi-GBM Flight Position | Flight localization, classification | &sim;10 s |
| Fermi-GBM Ground Position | Updated ground localization using finer lookup tables | 20-300 s |
| Fermi-GBM Final Position | Final trigger localization | 15 min |
| Fermi-GBM Subthreshold | Ground pipeline detected signals | 0.5-6 hr |
| Fermi-LAT Position Initial | Onboard LAT detection, initial position| 2-4 s |
| Fermi-LAT Position Update | Updated onboard localization with more data | 2-32 s|
| Fermi-LAT Position Ground | Ground localization of onboard trigger| 8-12 hr |
| Fermi-LAT Offline Position | Ground-detected GRB localization | 8-12 hr|
| Fermi-LAT Transient | Unknown source transient | 1 day |
| Fermi-LAT Monitor | Known source flare | 1 day |
