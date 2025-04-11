---
handle:
  breadcrumb: XML
---

# XML Data

Here is a collection of functions and example code that may be useful when working with XML Notices.
This guide provides essential functions to parse XML alerts into dictionaries and structured data formats using Python.

Within your consumer loop, use the following functions to convert the
content of `message.value()` into other data types.

The `xmltodict` package is not part of the Python standard library. You must install it by running:
pip:

```sh
pip install xmltodict
```

```python
import email
import xml.etree.ElementTree as ET
import xmltodict

def parse_text_alert_to_dict(message_value):
    return dict(email.message_from_bytes(message_value))

def parse_voevent_alert_to_xml_root(message_value):
    return ET.fromstring(message_value)

def parse_voevent_alert_to_dict(message_value):
    return xmltodict.parse(message_value)
```

## Saving

Use the following to save the data to a local file:

```python
def save_alert(message):
    with open('path/to/your/file', 'wb') as file:
        file.write(message.value())

```
