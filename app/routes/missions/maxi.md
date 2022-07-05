---
meta:
  title: GCN - MAXI
---

# Monitor of All-sky X-ray Image (MAXI)

<img 
  src="/_static/img/maxi-logo.png"
  width="200"
  align="right"
  alt="MAXI logo"
/>

**Launch Date:** June 11, 2008

**Extended Mission Lifetime:** 2024+ (Pending JAXA Review)

**End of Operations:** Limited by ISS lifetime, currently 2030

**Data Archive:**
https://www.darts.isas.jaxa.jp/astro/maxi/

[MAXI](http://maxi.riken.jp/top/) is a wide-field X-ray telescope designed to perform an all-sky survey. MAXI was developed by JAXA; data processing and operations are conducted by JAXA, Riken, Osaka University, Tokyo Institute of Technology, Aoyama Gakuin University, Nihon University, Kyoto Unviersity, Miyazaki University, and Chuo University.

| Instruments                                                              | Energy Range   | Field of View | Localization                            |
| ------------------------------------------------------------------------ | -------------- | ------------- | --------------------------------------- |
| [Solid-state Slit Camera (SSC)](https://iss.jaxa.jp/en/kiboexp/ef/maxi/) | 0.5 keV–10 keV | 90°x1.5°      | &leq;1° (statistical + systematic, 90%) |
| [Gas Slit Camera (GSC)](https://iss.jaxa.jp/en/kiboexp/ef/maxi/)         | 2 keV–30 keV   | 160°x1.5°     | &leq;1° (statistical + systematic, 90%) |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/maxi.html)

| Type           | Contents                             | Latency     |
| -------------- | ------------------------------------ | ----------- |
| `MAXI_UNKNOWN` | Signal with no catalogued source     | 200 minutes |
| `MAXI_KNOWN`   | Signal with a matched catalog source | 200 minutes |
| `MAXI_TEST`    | Test notices                         | n/a         |

**Common GCN Circular Types:**

| Type                        | Latency | Example                                                           |
| --------------------------- | ------- | ----------------------------------------------------------------- |
| Detection of a GRB          | hours   | [GRB 210320A](https://gcn.gsfc.nasa.gov/gcn3/29676.gcn3)          |
| Observation of a GW trigger | hours   | [LIGO/Virgo S191110af](https://gcn.gsfc.nasa.gov/gcn3/26223.gcn3) |
| Obersation of a NuEM        | days    | [NuEm-210111A](https://gcn.gsfc.nasa.gov/gcn3/29298.gcn3)         |

**MAXI Yearly Trigger Rates:**

| Instrument | Type                           | Rates |
| ---------- | ------------------------------ | ----- |
| GSC        | GRB or unknown X-ray transient | 60-70 |
|            | Known source                   | 20-25 |
