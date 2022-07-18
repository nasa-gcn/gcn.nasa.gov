---
meta:
  title: GCN - SNEWS
---

# SuperNova Early Warning System (SNEWS)

<img 
  src="/_static/img/snews-logo.jpg"
  width="200"
  align="right"
  alt="SNEWS logo"
  className="grid-col-6 mobile-lg:grid-col-4 tablet:grid-col-2 desktop:grid-col-3"
/>

**Start:** 2004

**Data Archives:**
https://gcn.gsfc.nasa.gov/snews_trans.html

[SNEWS](https://snews2.org/) is a consortium of MeV neutrino facilities which work together to distribute early warning alerts for core-collapse supernovae, reporting the neutrinos released during the collapse event before the first light of the supernova escapes.

| Facility                                                             | Type                               |
| -------------------------------------------------------------------- | ---------------------------------- |
| [Super-Kamikande](https://www-sk.icrr.u-tokyo.ac.jp/sk/index-e.html) | Water Cherenkov detectors          |
| [IceCube](https://icecube.wisc.edu/)                                 | Water Cherenkov detectors          |
| [KM3Net](https://www.km3net.org/)                                    | Water Cherenkov detectors          |
| [KamLAND](http://kamland.stanford.edu/)                              | Pure liquid scintillators          |
| [SNO+](https://snoplus.phy.queensu.ca/)                              | Pure liquid scintillators          |
| [NOvA](https://novaexperiment.fnal.gov/)                             | Pure liquid scintillators          |
| [HALO](https://www.snolab.ca/halo/detailedPhysics.html)              | Lead-based detection               |
| [XENONnt](https://science.purdue.edu/xenon1t/?tag=xenonnt)           | Liquid noble dark matter detectors |
| [LZ](https://lz.lbl.gov/)                                            | Liquid noble dark matter detectors |
| [PANDAX-4T](https://pandax.sjtu.edu.cn/)                             | Liquid noble dark matter detectors |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/snews.html)

| Type    | Contents                     | Latency |
| ------- | ---------------------------- | ------- |
| `SNEWS` | REAL or TEST supernova alert | Minutes |

**Yearly Event Rates:**

| Instrument | Type                    | Rates | Localization |
| ---------- | ----------------------- | ----- | ------------ |
| SNEWS      | Core-collapse supernova | 0.03  | 5–360°       |
|            | Test alert              | 52    | 5–360°       |
