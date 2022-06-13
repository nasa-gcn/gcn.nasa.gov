---
meta:
  title: GCN - AGILE
---

# Astrorivelatore Gamma a Immagini Leggero (AGILE)

<img 
  src="/_static/img/agile-logo.png"
  width="200"
  align="right"
  alt="AGILE logo"
/>

**Launch Date:** April 23, 2007

**Extended Mission Lifetime:** 2025+ (Pending ESA Review)

**End of Operations:** No specific requirement (no consumables)

**Data Archive:**
https://agile.asdc.asi.it/

[AGILE](http://agile.rm.iasf.cnr.it/) is a gamma-ray satellite from the Italian Space Agency with participation from INFN, INAF, and CIFS. It observes the high energy sky with two instruments and a calorimeter.

| Instruments                       | Energy Range    | Field of View |
| --------------------------------- | --------------- | ------------- |
| SuperAGILE (SA)                   | 18 keV–60 keV   | &gt; 1 ster   |
| Gamma Ray Imaging Detector (GRID) | 30 MeV–50 GeV   | &gt; 2.5 ster |
| [Mini-Calorimeter (MCAL)          | 350 keV–100 MeV |               |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/agile.html)

| Type                | Contents                               | Latency        |
| ------------------- | -------------------------------------- | -------------- |
| `AGILE_GRB_WAKEUP`  | On-board processing                    | ~30 minutes    |
| `AGILE_GRB_GROUND`  | Ground processing                      | 1–2 hours      |
| `AGILE_GRB_REFINED` | Humans in the loop                     | ~2–5 hours     |
| `AGILE_MCAL_ALERT`  | Ground processing of the MCAL triggers | 40–130 minutes |

**Common GCN Circular Types:**

| Type                             | Latency | Example                                                          |
| -------------------------------- | ------- | ---------------------------------------------------------------- |
| AGILE detection of a GRB         | hours   | [GRB 220527A](https://gcn.gsfc.nasa.gov/gcn3/32129.gcn3)         |
| MCAL detection of a GRB          | hours   | [GRB 220323A](https://gcn.gsfc.nasa.gov/gcn3/31784.gcn3)         |
| MCAL observation of a GW trigger | hours   | [LIGO/Virgo S200129m](https://gcn.gsfc.nasa.gov/gcn3/26930.gcn3) |

**Yearly Trigger Rates:**

| Instrument | Type            | Rates |
| ---------- | --------------- | ----- |
| SuperAGILE | Gamma-ray burst | 20–30 |
| MCAL       | GRB or GRB-like | 10–15 |
