---
meta:
  title: GCN - Kafka Client Code Samples
---

# Code Samples

## Parsing

Parsing the messages is fairly straight-forward. With text alerts, Python's [email](https://docs.python.org/3/library/email.html#module-email) package can parse these directly. Once parsed, the coordinates

```python
import email


def parse_text_alert_to_dict(message):
    return dict(email.message_from_bytes(message.value()))


def get_coordinates_from_text_alert(message):
    alert_dict = parse_text_alert_to_dict(message)
    raw_ra = alert_dict['GRB_RA'].split(",")[0]
    raw_dec = alert_dict['GRB_DEC'].split(",")[0]
    return {
        'ra': float(raw_ra[0:raw_ra.index('d')]),
        'dec' : float(raw_dec[0:raw_dec.index('d')]),
        'radius' : alert_dict['GRB_ERROR']
    }

```

Since voevent messages are essentially xml, the [xml.etree.ElementTree](https://docs.python.org/3/library/xml.etree.elementtree.html) module should be used.

```python
import xml.etree.ElementTree as ET


def parse_voevent_alert_to_xml_root(message):
    return ET.fromstring(message.value())


def get_coordinates_from_parsed_voevent_alert(message):
    parsed_message = parse_voevent_alert_to_xml_root(message)
    pos2d = parsed_message.find('.//{*}Position2D')
    ra = float(pos2d.find('.//{*}C1').text)
    dec = float(pos2d.find('.//{*}C2').text)
    radius = float(pos2d.find('.//{*}Error2Radius').text)
    print('ra = {:g}, dec={:g}, radius={:g}'.format(ra, dec, radius))
    return {
        'ra':ra,
        'dec':dec,
        'radius':radius
    }
```
