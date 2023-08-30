import { Link } from '@trussworks/react-uswds'
import dedent from 'ts-dedent'

import { Highlight } from '~/components/Highlight'

export default function Samples() {
  return (
    <>
      <h1>Code Samples</h1>
      <div>
        <p>
          We have collected a short list of functions that may be useful when
          working with GCN Notices in your code. These functions include
          conversions from text/VOEvent alert formats to json and xml {'('}for
          VOEvent alerts{')'} and examples for how to save alerts in these
          formats.
        </p>
        <p>
          <code>xmltodict</code> is not a standard python package, it must be
          installed with pip:
        </p>
        <Highlight language="sh" code="pip install xmltodict" />

        <p>
          For more examples, or to contribute your own ideas, see our{' '}
          <Link href="https://github.com/nasa-gcn/utility-samples">
            Utility Sample repo
          </Link>
        </p>

        <Highlight
          code={dedent`
      import email
      import xml.etree.ElementTree as ET
      import json
      import xmltodict
      
      
      def parse_text_alert_to_dict(message_value):
          return dict(email.message_from_bytes(message_value))
      
      
      def parse_voevent_alert_to_xml_root(message_value):
          return ET.fromstring(message_value)
      
              
      def parse_voevent_alert_to_dict(message_value):
          return xmltodict.parse(message_value)
      
      
      def save_text_alert(message_value):
          # Save incoming event message as text file:
          with open('path/to/your/file.txt', 'w') as file:
              file.write(message_value.decode())
          
          # Save incoming event message as json file:
          alert_data = parse_text_alert_to_dict(message_value)
          with open("path/to/your/file.json", "wb") as file:
              file.write(json.dumps(alert_data))
              
      
      def save_voevent_alert(message_value):
         # Save incoming vo event as a json file
          dataDict = parse_voevent_alert_to_dict(message_value)
          with open('path/to/your/file.json', "w") as file:
              file.write(json.dumps(dataDict))
          
          # Or save incoming vo event as xml
          with open('path/to/your/file.xml', "w") as file:
              file.write(message_value.decode())
      
      `}
          language="py"
        />
      </div>
    </>
  )
}
