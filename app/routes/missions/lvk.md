---
meta:
  title: GCN - LIGO/Virgo/KAGRA
---

# Gravitational Wave Network

<img 
  src="/_static/img/ligo_logo.png"
  width="200"
  align="left"
  alt="LIGO logo"
/>
<img 
  src="/_static/img/egovirgo.jpg"
  width="200"
  align="center"
  alt="Virgo logo"
/>
<img 
  src="/_static/img/KAGRA-logo.svg"
  width="200"
  align="right"
  alt="KAGRA logo"
/>

| Interferometers                                                                        | Location                                       | Size | Joined GW Network | BNS Range (O4) |
| -------------------------------------------------------------------------------------- | ---------------------------------------------- | ---- | ----------------- | -------------- |
| [Laser Interferometer Gravitational-Wave Observatory (LIGO)](https://www.ligo.org)     | Hanford, WA, USA Livingston, LA, USA           | 5 km | 2015              | 160-190 Mpc    |
| [Virgo Gravitational Wave Interferometer (Virgo)](https://www.virgo-gw.eu)             | Pisa, Italy                                    | 3 km | 2017              | 90-120 Mpc     |
| [Kamioka Gravitational Wave Detector (KAGRA)](https://gwcenter.icrr.u-tokyo.ac.jp/en/) | Kamioka-cho, Hida-city, Gifu-prefecture, Japan | 3 km | 2020              | 25-230 Mpc     |

O4 predictions from [Abbott et al. 2020, LRR](https://link.springer.com/article/10.1007/s41114-020-00026-9)

<img
  src="https://observing.docs.ligo.org/plan/_images/ObsScen_timeline.png"
  width="400"
  aligh="center"
  alt="LVK Observing Timeline"
/>

**Planned Lifetime:** 2028+

**End of Operations:** No specific requirement

**Data Archive:**
https://www.gw-openscience.org

LIGO, Virgo, and KAGRA comprise the advanced gravitational wave detector network. LIGO is operated by the National Science Foundation, Virgo by the European Gravitational Wave Observatory, and KAGRA by the ministry of Education, Culture, Sports, Science and Technology-Japan (MEXT). Together they detect, localize, and characterize the coalescence of compact binary mergers, continuous gravitational waves, and burst gravitational waves.

**GCN Notice Types in GCN Classic and GCN Classic Over Kafka:**
[Detailed Descriptions and Examples](https://gcn.gsfc.nasa.gov/lvc.html)

| Type              | Contents                                                                                      | Latency    |
| ----------------- | --------------------------------------------------------------------------------------------- | ---------- |
| `LVC_PRELIMINARY` | 1st Notice, Timestamp Alert, location probability skymap; all automated processing.           | 1-10 min   |
| `LVC_INITIAL`     | Improved SkyMap now available (human-involved procesing).                                     | 4-24 hr    |
| `LVC_UPDATE`      | Ultimate refined skymap (more detailed off-line processing).                                  | ~1-7 days  |
| `LVC_RETRACTION`  | After human analysis/evaluation, a retraction will be issued if trigger is not astrophysical. | 1hr - 1day |
