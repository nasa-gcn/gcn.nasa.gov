---
meta:
  title: GCN - INTEGRAL
---

# INTErnational Gamma-Ray Astrophysics Laboratory (INTEGRAL)

<img 
  src="/_static/img/integral-logo.jpg"
  width="200"
  align="right"
  alt="INTEGRAL logo"
  className="grid-col-6 mobile-lg:grid-col-4 tablet:grid-col-2 desktop:grid-col-3"
/>

**Launch Date:** July 15, 2009

**Extended Mission Lifetime:** 2023+ (Pending NASA Senior Review)

**End of Operations:** Reentry in 2029

**Data Archive:**
https://www.cosmos.esa.int/web/integral/integral-data-archives

[INTEGRAL](https://www.cosmos.esa.int/web/integral) performs spectroscopy and imaging of gamma-ray sources. It is an ESA medium-sized mission with additional contributions from Italy, France, Germany, and Spain, and with Roscosmos and NASA as external partners. Gamma-ray bursts are distributed through the [Integral Burst Alert System (IBAS)](https://www.isdc.unige.ch/integral/science/grb).

| Instruments                                                                                                     | Energy Range  | Field of View | Localization                       |
| --------------------------------------------------------------------------------------------------------------- | ------------- | ------------- | ---------------------------------- |
| [Imager on Board the INTEGRAL Satellite (IBIS)](https://www.cosmos.esa.int/web/integral/instruments-ibis)       | 15 keV–10 MeV | 0.25 ster     | &leq; 4′ radius (statistical, 90%) |
| [SPectrometer on INTEGRAL AntiCoincidence Shield (SPI-ACS)](https://www.isdc.unige.ch/integral/science/grb#ACS) | &gt;75 keV    | 4π ster       |                                    |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/integral.html)

| Type               | Contents                                | Latency     |
| ------------------ | --------------------------------------- | ----------- |
| `INTEGRAL_WEAK`    | Low-significance events                 | ~1 minutes  |
| `INTEGRAL_WAKEUP`  | First Notice with a position            | ~1 minutes  |
| `INTEGRAL_REFINED` | Uses more data (if a long burst)        | 1-2 minutes |
| `INTEGRAL_OFFLINE` | Human-involved post-processing          | 1–3 hours   |
| `INTEGRAL_SPIACS`  | Timestamp only; no position information | ~1 minutes  |

**Common GCN Circular Types:**

| Type                      | Latency | Example                                                          |
| ------------------------- | ------- | ---------------------------------------------------------------- |
| Identification of a GRB   | hours   | [GRB 220514A](https://gcn.gsfc.nasa.gov/gcn3/32041.gcn3)         |
| Follow-up of a GW trigger | 1 hour  | [LIGO/Virgo S191213g](https://gcn.gsfc.nasa.gov/gcn3/26401.gcn3) |

**Yearly Trigger Rates:**

| Instrument | Type            | Rates   |
| ---------- | --------------- | ------- |
| IBIS       | Gamma-ray burst | 5-10    |
| SPI-ACS    | Gamma-ray burst | 100-120 |
