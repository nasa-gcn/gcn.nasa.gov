---
meta:
  title: GCN - Swift
---

# Neil Gehrels Swift Observatory

<img 
  src="/_static/img/logo_swift.gif"
  align="right"
  alt="Swift Observatory logo"
  className="grid-col-6 mobile-lg:grid-col-4 tablet:grid-col-2 desktop:grid-col-3"
/>

**Launch Date:** November 20, 2004

**Extended Mission Lifetime:** 2025+ (Pending NASA Senior Review)

**End of Operations:** No specific requirement (no consumables, no significant degradation)

**Data Archive:**
https://swift.gsfc.nasa.gov/archive/

[Swift](https://swift.gsfc.nasa.gov) is a MidEx class mission operated by [NASA](https://www.nasa.gov/fermi/) in partnership with agencies in Italy and the United Kingdom. BAT autonomously detects gamma-ray transients, and Swift autonomously begins a sequence of follow-up observations with XRT and UVOT. All three instruments provide alerts to GCN autonomously upon the detection of transients.

<div className="overflow-table">

| Instruments                                                                          | Energy Range | Field of View | Localization                         |
| ------------------------------------------------------------------------------------ | ------------ | ------------- | ------------------------------------ |
| [Burst Alert Telescope (BAT)](https://swift.gsfc.nasa.gov/about_swift/bat_desc.html) | 15-350 keV   | 2 ster        | &leq; 1–3′ radius (statistical, 90%) |
| [X-ray Telescope (XRT)](https://www.swift.psu.edu/xrt/)                              | 0.3–10 keV   | 23.6′×23.6′   | 1–3″                                 |
| [Ultraviolet/Optical Telescope UVOT](https://www.swift.psu.edu/uvot/)                | 170–650 nm   | 17′×17′       | &lt;1″                               |

</div>

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/swift.html)

<div className="overflow-table">
  <table className="usa-table">
    <thead>
      <tr>
        <th>Type</th>
        <th>Typical Latency Since Burst</th>
        <th>Location Precision</th>
        <th>Description</th>
      </tr>
    </thead>
    <tbody>
      <tr><td colSpan="4"><strong>Flight Generated:</strong></td></tr>
      <tr><td><code>SWIFT_BAT_GRB_ALERT</code></td><td>~7 seconds</td><td>N/A</td><td>First Notice, Timestamp Alert</td></tr>
      <tr><td><code>SWIFT_BAT_QL_POS</code></td><td>13–30 seconds</td><td>1–3′</td><td>QuickLook Position Notice (subset of BAT_POS info)</td></tr>
      <tr><td><code>SWIFT_BAT_GRB_POS_ACK</code></td><td>13–30 seconds</td><td>1–3′</td><td>First Position Notice, the BAT Position</td></tr>
      <tr><td><code>SWIFT_BAT_GRB_POS_NACK</code></td><td>30–60 seconds</td><td>N/A</td><td>Only if no position was found</td></tr>
      <tr><td><code>SWIFT_BAT_SUB_THRESHOLD</code></td><td>13–30 seconds</td><td>1–4′</td><td>Sub-threshold triggers (Position)</td></tr>
      <tr><td><code>SWIFT_BAT_GRB_LC</code></td><td>~220 seconds</td><td>1–3′</td><td>Lightcurve (also has the position)</td></tr>
      <tr><td><code>SWIFT_FOM_OBS</code></td><td>14–41 seconds</td><td>1–3′</td><td>FOM decision: Observe or Not</td></tr>
      <tr><td><code>SWIFT_SC_SLEW</code></td><td>14–41 seconds</td><td>1–3′</td><td>Spacecraft decision: Slew or Not</td></tr>
      <tr><td><code>SWIFT_XRT_POSITION</code></td><td>30–80 seconds</td><td>&lt;7″</td><td>XRT afterglow location</td></tr>
      <tr><td><code>SWIFT_XRT_CENTROID</code></td><td>30–80 seconds</td><td>N/A</td><td>Could not find an XRT afterglow location</td></tr>
      <tr><td><code>SWIFT_XRT_IMAGE</code></td><td>31–81 seconds</td><td>&lt;7″</td><td>2′×2′ FOV (5-30 s integration)</td></tr>
      <tr><td><code>SWIFT_XRT_SPECTRUM</code></td><td>40–81 seconds</td><td>N/A</td><td>Spectrum (few-to-100 s integration)</td></tr>
      <tr><td><code>SWIFT_XRT_LC</code></td><td>141–910 seconds</td><td>N/A</td><td>The x-ray lightcurve (106–826 s)</td></tr>
      <tr><td><code>SWIFT_UVOT_FCHART</code></td><td>~260 seconds</td><td>N/A</td><td>Thresholded pixel clusters</td></tr>
      <tr><td><code>SWIFT_UVOT_DBURST</code></td><td>~320 seconds</td><td>N/A</td><td>All pixels from an 80×80 pixel subarray</td></tr>
      <tr><td><code>SWIFT_UVOT_POS</code></td><td>1–3 hours</td><td>&lt;2″</td><td>UVOT afterglow location (Gnd-generated only)</td></tr>
      <tr><td><code>SWIFT_UVOT_POS_NACK</code></td><td>1–3 hours</td><td>N/A</td><td>Could not find an UVOT afterglow location</td></tr>
      <tr><td colSpan="4"><strong>Ground Processed:</strong></td></tr>
      <tr><td><code>SWIFT_BAT_GRB_LC_PROC</code></td><td>~225 seconds</td><td>1–3′</td><td>Lightcurve (also has the position)</td></tr>
      <tr><td><code>SWIFT_XRT_IMAGE_PROC</code></td><td>40–70 seconds</td><td>&lt;6″</td><td>2′×2′ FOV (~10 s integration)</td></tr>
      <tr><td><code>SWIFT_XRT_SPECTRUM_PROC</code></td><td>50–90 seconds</td><td>N/A</td><td>The spectrum from that integration (~10 s)</td></tr>
      <tr><td><code>SWIFT_UVOT_FCHART_PROC</code></td><td>~280 seconds</td><td>N/A</td><td>Thresholded pixel clusters</td></tr>
      <tr><td><code>SWIFT_UVOT_DBURST_PROC</code></td><td>~340 seconds</td><td>N/A</td><td>All pixels from an 80×80 pixel subarray</td></tr>
      <tr><td colSpan="4"><strong>Special:</strong></td></tr>
      <tr><td><code>SWIFT_BAT_SLEW_POS</code></td><td>1–6 hours</td><td>1–7′</td><td>Bursts &amp; Transient found in the slew data (BATSS)</td></tr>
      <tr><td><code>SWIFT_BAT_MONITOR</code></td><td>1–12 hours</td><td>1–7′</td><td>Flares from known sources</td></tr>
      <tr><td><code>SWIFT_BAT_SUBSUB</code></td><td>1–12 hours</td><td>1–7′</td><td>Sub-Sub-Threshold blips in all image produced on-board</td></tr>
      <tr><td><code>SWIFT_BAT_KNOWN_SRC</code></td><td>1–12 hours</td><td>1–7′</td><td>Peaks of known-sources found in all image produced on-board</td></tr>
    </tbody>
  </table>
</div>

**Common GCN Circular Types:**

<div className="overflow-table">

| Type                                   | Latency    | Example                                                          |
| -------------------------------------- | ---------- | ---------------------------------------------------------------- |
| Swift identification of a GRB          | 30 minutes | [GRB 210517A](https://gcn.gsfc.nasa.gov/gcn3/30032.gcn3)         |
| XRT enhanced GRB position              | hours      | [GRB 210517A](https://gcn.gsfc.nasa.gov/gcn3/30034.gcn3)         |
| UVOT follow-up of a GRB                | hours      | [GRB 210517A](https://gcn.gsfc.nasa.gov/gcn3/30040.gcn3)         |
| BAT refined analysis of a GRB          | 12 hours   | [GRB 210517A](https://gcn.gsfc.nasa.gov/gcn3/30043.gcn3)         |
| XRT refined analysis of a GRB          | 12 hours   | [GRB 210517A](https://gcn.gsfc.nasa.gov/gcn3/30042.gcn3)         |
| BAT GUANO localization of a GRB        | 6 hours    | [GRB 210827A](https://gcn.gsfc.nasa.gov/gcn3/30732.gcn3)         |
| BAT GUANO recovery of a GRB            | 6 hours    | [GRB 211105A](https://gcn.gsfc.nasa.gov/gcn3/31047.gcn3)         |
| Swift ToO observations                 | 12 hours   | [GRB 210704A](https://gcn.gsfc.nasa.gov/gcn3/30374.gcn3)         |
| Swift BAT observations of a GW trigger | 12 hours   | [LIGO/Virgo S200114f](https://gcn.gsfc.nasa.gov/gcn3/26748.gcn3) |
| Swift tiling of a GW trigger           | 1 day      | [LIGO/Virgo S200114f](https://gcn.gsfc.nasa.gov/gcn3/26787.gcn3) |

</div>

**Annual Trigger Rates:**

<div className="overflow-table">

| Instrument | Long GRBs | Short GRBs | Description                   |
| ---------- | --------- | ---------- | ----------------------------- |
| BAT        | 70–80     | 7–9        | On-board trigger rate         |
| XRT        | 60–65     | 40–50      | XRT follow-up detections      |
| UVOT       | 20–25     | 0–1        | UVOT follow-up detections     |
| BAT        | 8–10      | 2–4        | GUANO arcminute recovery rate |

</div>

Trigger Rates determined from cataloged information including the [Swift-BAT Third GRB Catalog](https://swift.gsfc.nasa.gov/results/batgrbcat/index.html) and the [Swift GRB Lookup Table](https://swift.gsfc.nasa.gov/archive/grb_table/). GUANO results are from the [online summary table](https://www.swift.psu.edu/guano/).
