---
handle:
  breadcrumb: VOEvent XML
---

# VOEvent XML

Here is a collection of functions and example code that may be useful when working with [VOEvent XML](https://wiki.ivoa.net/internal/IVOA/IvoaVOEvent/voevent_v2.html).
This guide provides essential functions to parse XML alerts into dictionaries and structured data formats using Python.

Within your consumer loop, use the following functions to convert the
content of `message.value()` into other data types.

The `xmltodict` package is not part of the Python standard library. You must install it by running:
pip:

```sh
pip install xmltodict
```

```python
import xml.etree.ElementTree as ET
import xmltodict

# Convert a raw XML string into an ElementTree XML object
def parse_voevent_alert_to_xml_root(message_value):
    return ET.fromstring(message_value)

# Convert XML string into a Python dictionary
def parse_voevent_alert_to_dict(message_value):
    return xmltodict.parse(message_value)
```
