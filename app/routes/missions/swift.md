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

| Instruments                                                                          | Energy Range | Field of View      | Localization                               |
| ------------------------------------------------------------------------------------ | ------------ | ------------------ | ------------------------------------------ |
| [Burst Alert Telescope (BAT)](https://swift.gsfc.nasa.gov/about_swift/bat_desc.html) | 15 - 150 keV | 2 ster             | &leq; 1-3 arcmin radius (statistical, 90%) |
| [X-ray Telescope (XRT)](https://www.swift.psu.edu/xrt/)                              | 0.3 - 10 keV | 23.6 x 23.6 arcmin | 1-3 arcsec                                 |
| [Ultraviolet/Optical Telescope UVOT](https://www.swift.psu.edu/uvot/)                | 170-650 nm   | 17 x 17 arcmin     | &lt;1 arcsec                               |

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
| Type | Typical Latency Since Burst | Location Precision | Description |
| - | - | - | - |
|**Flight Generated:** | | | |
|BAT_Alert |&sim;7sec | n/a | First Notice, Timestamp Alert|
|BAT_QL_Pos |13-30sec | 1-3' | QuickLook Position Notice (subset of BAT_POS info)|
|BAT_Pos |13-30sec | 1-3' | First Position Notice, the BAT Position|
|BAT_PosNack |30-60sec | n/a | Only if no position was found|
|BAT_SubThresh |13-30sec | 1-4' | Sub-threshold triggers (Position)|
|BAT_LC |&sim;220sec | 1-3' | Lightcurve (also has the position)|
|FOM_Obs |14-41sec | 1-3' | FOM decision: Observe or Not|
|SC_Slew |14-41sec | 1-3' | Spacecraft decision: Slew or Not|
|XRT_Pos |30-80sec | &lt;7" | XRT afterglow location|
|XRT_PosNack |30-80sec | n/a | Could not find an XRT afterglow location|
|XRT_Image |31-81sec | &lt;7" | 2x2 arcmin FOV (5-30sec integration)|
|XRT_Spectrum |40-81sec | n/a | Spectrum (few-to-100 sec integration)|
|XRT_Lightcurve |141-910sec | n/a | The x-ray lightcurve (106 to 826 sec)|
|UVOT_SrcList |&sim;260sec | n/a | Thresholded pixel clusters|
|UVOT_Image |&sim;320sec | n/a | All pixels from an 80x80 pixel subarray|
|UVOT_Pos |1-3 hrs | &lt;2" | UVOT afterglow location (Gnd-generated only)|
|UVOT_PosNack |1-3 hrs | n/a | Could not find an UVOT afterglow location|
|**Ground Processed:**| | | |
|BAT_LC |&sim;225sec | 1-3' | Lightcurve (also has the position)|
|XRT_Image |40-70sec | &lt;6" | 2x2 arcmin FOV (~10sec integration)|
|XRT_Spectrum |50-90sec | n/a | The spectrum from that integration (~10 sec)|
|UVOT_SrcList |&sim;280sec | n/a | Thresholded pixel clusters|
|UVOT_Image |&sim;340sec | n/a | All pixels from an 80x80 pixel subarray|
|**Special:**| | | |
|BAT_Slew_Pos |1-6 hrs | 1-7' | Bursts & Transient found in the slew data (BATSS)|
|BAT_Monitor |1-12 hrs | 1-7' | Flares from known sources|
|BAT_SUB_SUB |1-12 hrs | 1-7' | Sub-Sub-Threshold blips in all image produced on-board|
|BAT_KNOWN |1-12 hrs | 1-7' | Peaks of known-sources found in all image produced on-board|
