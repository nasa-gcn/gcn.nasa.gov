---
meta:
  title: GCN - Swift
---

# Neil Gehrels Swift Observatory

<img 
  src="/_static/img/logo_swift.gif"
  width="200"
  align="right"
  alt="Swift Observatory logo"
/>

**Launch Date:** November 20, 2004

**Extended Mission Lifetime:** 2024+ (Pending NASA Senior Review)

**End of Operations:** No specific requirement (no consumables, no significant degradation)

**Data Archive:**
https://swift.gsfc.nasa.gov/archive/

[Swift](https://swift.gsfc.nasa.gov) is a MidEx class mission operated by [NASA](https://www.nasa.gov/fermi/) in partnership with agencies in Italy and the United Kingdom. BAT autonomously detects gamma-ray transients, and Swift autonomously begins a sequence of follow-up observations with XRT and UVOT. All three instruments provide alerts to GCN autonomously upon the detection of transients.

| Instruments                                                                          | Energy Range | Field of View | Localization                         |
| ------------------------------------------------------------------------------------ | ------------ | ------------- | ------------------------------------ |
| [Burst Alert Telescope (BAT)](https://swift.gsfc.nasa.gov/about_swift/bat_desc.html) | 15-150 keV   | 2 ster        | &leq; 1–3′ radius (statistical, 90%) |
| [X-ray Telescope (XRT)](https://www.swift.psu.edu/xrt/)                              | 0.3–10 keV   | 23.6′×23.6′   | 1–3″                                 |
| [Ultraviolet/Optical Telescope UVOT](https://www.swift.psu.edu/uvot/)                | 170–650 nm   | 17′×17′       | &lt;1″                               |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
| Type | Typical Latency Since Burst | Location Precision | Description |
| - | - | - | - |
|**Flight Generated:** | | | |
|BAT_Alert |~7 s | N/A | First Notice, Timestamp Alert|
|BAT_QL_Pos |13–30 s | 1–3′ | QuickLook Position Notice (subset of BAT_POS info)|
|BAT_Pos |13–30 s | 1–3′ | First Position Notice, the BAT Position|
|BAT_PosNack |30–60 s | N/A | Only if no position was found|
|BAT_SubThresh |13–30 s | 1–4′ | Sub-threshold triggers (Position)|
|BAT_LC |~220 s | 1–3′ | Lightcurve (also has the position)|
|FOM_Obs |14–41 s | 1–3′ | FOM decision: Observe or Not|
|SC_Slew |14–41 s | 1–3′ | Spacecraft decision: Slew or Not|
|XRT_Pos |30–80 s | &lt;7″ | XRT afterglow location|
|XRT_PosNack |30–80 s | N/A | Could not find an XRT afterglow location|
|XRT_Image |31–81 s | &lt;7″ | 2′×2′ FOV (5-30 s integration)|
|XRT_Spectrum |40–81 s | N/A | Spectrum (few-to-100 s integration)|
|XRT_Lightcurve |141–910 s | N/A | The x-ray lightcurve (106–826 s)|
|UVOT_SrcList |~260 s | N/A | Thresholded pixel clusters|
|UVOT_Image |~320 s | N/A | All pixels from an 80×80 pixel subarray|
|UVOT_Pos |1–3 h | &lt;2″ | UVOT afterglow location (Gnd-generated only)|
|UVOT_PosNack |1–3 h | N/A | Could not find an UVOT afterglow location|
|**Ground Processed:**| | | |
|BAT_LC |~225 s | 1–3′ | Lightcurve (also has the position)|
|XRT_Image |40–70 s | &lt;6″ | 2′×2′ FOV (~10 s integration)|
|XRT_Spectrum |50–90 s | N/A | The spectrum from that integration (~10 s)|
|UVOT_SrcList |~280 s | N/A | Thresholded pixel clusters|
|UVOT_Image |~340 s | N/A | All pixels from an 80×80 pixel subarray|
|**Special:**| | | |
|BAT_Slew_Pos |1–6 h | 1–7′ | Bursts & Transient found in the slew data (BATSS)|
|BAT_Monitor |1–12 h | 1–7′ | Flares from known sources|
|BAT_SUB_SUB |1–12 h | 1–7′ | Sub-Sub-Threshold blips in all image produced on-board|
|BAT_KNOWN |1–12 h | 1–7′ | Peaks of known-sources found in all image produced on-board|
