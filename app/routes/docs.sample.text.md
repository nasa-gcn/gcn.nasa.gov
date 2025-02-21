---
handle:
  breadcrumb: TEXT
---

# Plain Text Messages

GCN Classic Notices are also distributed as email messages. To extract useful information from these alerts, one can use Python's built-in [`email`](https://docs.python.org/3/library/email.html) library.

```python
import email

def parse_text_alert_to_dict(message_value):
    return dict(email.message_from_bytes(message_value))
```

This function extracts the headers and returns them as key-value pairs in a Python dictionary.
