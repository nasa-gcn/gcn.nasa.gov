/*!
 * Copyright © 2023 United States Government as represented by the
 * Administrator of the National Aeronautics and Space Administration.
 * All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */
import type { AddressObject } from 'mailparser'
import addressparser from 'nodemailer/lib/addressparser'

import { getFromAddress, parseEmailContentFromSource } from '../parse'

function parseFrom(from: string): AddressObject {
  return {
    value: addressparser(from, { flatten: true }),
    html: 'example',
    text: 'example',
  }
}

describe('getFromAddress', () => {
  test('raises if the address object is undefined', () => {
    expect(() => getFromAddress(undefined)).toThrow('From address is missing')
  })

  test('raises if there are zero addresses', () => {
    expect(() =>
      getFromAddress({ value: [], html: 'example', text: 'example' })
    ).toThrow('From address is missing')
  })

  test('raises if the address is undefined', () => {
    expect(() =>
      getFromAddress({
        value: [{ name: 'example' }],
        html: 'example',
        text: 'example',
      })
    ).toThrow('From address is missing')
  })

  test('returns the address verbatim for a normal email address', () => {
    expect(getFromAddress(parseFrom('example@example.com'))).toEqual(
      'example@example.com'
    )
  })
})

const testEmailContentString = `Return-Path: <example@example.com>
From: "Person, Example"
	<example@example.com>
To: "circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>
Subject: Test email
Thread-Topic: Test email
Thread-Index: Adlso81V+NT53HOySD+pZNzbQDIhog==
Date: Tue, 11 Apr 2023 18:33:15 +0000
Accept-Language: en-US
Content-Language: en-US
X-MS-Has-Attach:
X-MS-TNEF-Correlator:
Content-Type: multipart/alternative;
	boundary="_000_PH0PR09MB7884B509F11EE2C96FE72036A19A9PH0PR09MB7884namp_"
MIME-Version: 1.0

--_000_PH0PR09MB7884B509F11EE2C96FE72036A19A9PH0PR09MB7884namp_
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable

I'm going to try something with formatting here. Like some bold words?
I can try highlighting and maybe event changing the word color?

--_000_PH0PR09MB7884B509F11EE2C96FE72036A19A9PH0PR09MB7884namp_
Content-Type: text/html; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable

<html xmlns:v=3D"urn:schemas-microsoft-com:vml" xmlns:o=3D"urn:schemas-micr=
osoft-com:office:office" xmlns:w=3D"urn:schemas-microsoft-com:office:word" =
xmlns:m=3D"http://schemas.microsoft.com/office/2004/12/omml" xmlns=3D"http:=
//www.w3.org/TR/REC-html40">
<head>
<meta http-equiv=3D"Content-Type" content=3D"text/html; charset=3Dus-ascii"=
>
<meta name=3D"Generator" content=3D"Microsoft Word 15 (filtered medium)">
<style><!--
/* Font Definitions */
@font-face
	{font-family:"Cambria Math";
	panose-1:2 4 5 3 5 4 6 3 2 4;}
@font-face
	{font-family:Calibri;
	panose-1:2 15 5 2 2 2 4 3 2 4;}
/* Style Definitions */
p.MsoNormal, li.MsoNormal, div.MsoNormal
	{margin:0in;
	font-size:11.0pt;
	font-family:"Calibri",sans-serif;
	mso-ligatures:standardcontextual;}
span.EmailStyle17
	{mso-style-type:personal-compose;
	font-family:"Calibri",sans-serif;
	color:windowtext;}
.MsoChpDefault
	{mso-style-type:export-only;
	font-family:"Calibri",sans-serif;
	mso-ligatures:standardcontextual;}
@page WordSection1
	{size:8.5in 11.0in;
	margin:1.0in 1.0in 1.0in 1.0in;}
div.WordSection1
	{page:WordSection1;}
--></style><!--[if gte mso 9]><xml>
<o:shapedefaults v:ext=3D"edit" spidmax=3D"1026" />
</xml><![endif]--><!--[if gte mso 9]><xml>
<o:shapelayout v:ext=3D"edit">
<o:idmap v:ext=3D"edit" data=3D"1" />
</o:shapelayout></xml><![endif]-->
</head>
<body lang=3D"EN-US" link=3D"#0563C1" vlink=3D"#954F72" style=3D"word-wrap:=
break-word">
<div class=3D"WordSection1">
<p class=3D"MsoNormal"><span style=3D"font-size:14.0pt">I&#8217;m going to =
try something with formatting here.
<b>Like some bold words?</b> <o:p></o:p></span></p>
<p class=3D"MsoNormal"><span style=3D"font-size:14.0pt">I can try <span sty=
le=3D"background:yellow;mso-highlight:yellow">
highlighting</span> and maybe event changing the word <span style=3D"color:=
red">color</span>?
<o:p></o:p></span></p>
</div>
</body>
</html>

--_000_PH0PR09MB7884B509F11EE2C96FE72036A19A9PH0PR09MB7884namp_--
`

const testWithRewrite = `Return-Path: <example-to@example.com>
MIME-Version: 1.0
From: "Example Person <example@example.com> via gcncirc" <mailnull@capella2.gsfc.nasa.gov>
Reply-to: Example Person <example@example.com>
Date: Wed, 12 Apr 2023 08:43:58 -0400
Message-ID: <CA+if_cXum5DWfs728_BhK-hiz1efcL6QpNvxDOSXOP=QmYsrSg@mail.gmail.com>
Subject: Test: External email, test_rewrite
To: example-to@example.com
Content-Type: multipart/alternative; boundary="000000000000ce53c605f922f684"

--000000000000ce53c605f922f684
Content-Type: text/plain; charset="UTF-8"

This is an external email (gmail) test with the test_rewrite flag

--000000000000ce53c605f922f684
Content-Type: text/html; charset="UTF-8"

<div dir="ltr">This is an external email (gmail) test with the test_rewrite flag</div>

--000000000000ce53c605f922f684--
`

const testEmailWithAttachment = `Return-Path: <example@example.com>
MIME-Version: 1.0
References: <CA+if_cUjb6qsf-+mWLcP8g_q6it97aice9gFMaW=kdhQq1jA6w@mail.gmail.com>
In-Reply-To: <CA+if_cUjb6qsf-+mWLcP8g_q6it97aice9gFMaW=kdhQq1jA6w@mail.gmail.com>
From: Example Person <example@example.com>
Date: Wed, 12 Apr 2023 15:46:51 -0400
Message-ID: <CA+if_cVUE1TTHfETrAYRjUYsA5MPRqx8f=NA4twjHr7=TH7gVw@mail.gmail.com>
Subject: Fwd: This is a test with an attachment
To: circulars@dev.gcn.nasa.gov
Content-Type: multipart/mixed; boundary="000.000.000.0006c8d05f928dfcd"

--000.000.000.0006c8d05f928dfcd
Content-Type: multipart/alternative; boundary="000.000.000.0006c8c05f928dfcb"

--000.000.000.0006c8c05f928dfcb
Content-Type: text/plain; charset="UTF-8"

There will be an attachment on this

--000.000.000.0006c8c05f928dfcb
Content-Type: text/html; charset="UTF-8"

<div dir="ltr"><div class="gmail_quote"><div dir="ltr" class="gmail_attr">There will be an attachment on this<br></div>
</div></div>

--000.000.000.0006c8c05f928dfcb--
--000.000.000.0006c8d05f928dfcd
Content-Type: text/plain; charset="US-ASCII"; name="attach_me.txt"
Content-Disposition: attachment; filename="attach_me.txt"
Content-Transfer-Encoding: base64
Content-ID: <f_lgduknnj0>
X-Attachment-Id: f_lgduknnj0

anVzdCBhIGJsYW5rIGZpbGUsIG5vdGhpbmcgdG8gc2VlIGhlcmU=
--000.000.000.0006c8d05f928dfcd--`

const testWithOtherCharacters = `Return-Path: <example-to@example.com>
MIME-Version: 1.0
From: "Example Person <example@example.com> via gcncirc" <mailnull@capella2.gsfc.nasa.gov>
Reply-to: Example Person <example@example.com>
Date: Wed, 12 Apr 2023 08:43:58 -0400
Message-ID: <CA+if_cXum5DWfs728_BhK-hiz1efcL6QpNvxDOSXOP=QmYsrSg@mail.gmail.com>
Subject: Test: External email, test_rewrite
To: example-to@example.com
Content-Type: multipart/alternative; boundary="000000000000ce53c605f922f684"

--000000000000ce53c605f922f684
Content-Type: text/plain; charset="UTF-8"

This is an external email (gmail) тест with the тест_rewrite 施

--000000000000ce53c605f922f684
Content-Type: text/html; charset="UTF-8"

<div dir="ltr">This is an external email (gmail) test with the test_rewrite flag</div>

--000000000000ce53c605f922f684--
`

describe('parseEmailContentFromSource', () => {
  it('should parse the text out', async () => {
    const parsedMail = await parseEmailContentFromSource(testWithRewrite)
    expect(parsedMail.text).toBe(
      `This is an external email (gmail) test with the test_rewrite flag
`
    )
  })

  it('should parse plain text when the source is formatted', async () => {
    const parsedMail = await parseEmailContentFromSource(testEmailContentString)
    expect(parsedMail.text)
      .toBe(`I'm going to try something with formatting here. Like some bold words?
I can try highlighting and maybe event changing the word color?
`)
  })

  it('should still have the formatted text, albeit useless', async () => {
    const parsedMail = await parseEmailContentFromSource(testEmailContentString)
    expect(parsedMail).not.toBeNull()
  })

  it('should ignore any attachments', async () => {
    const parsedMail = await parseEmailContentFromSource(
      testEmailWithAttachment
    )
    expect(parsedMail.attachments.length).toBe(0)
  })

  it('should return special characters from text as presented', async () => {
    const parsedMail = await parseEmailContentFromSource(
      testWithOtherCharacters
    )

    expect(parsedMail.text).toBe(
      `This is an external email (gmail) тест with the тест_rewrite 施
`
    )
  })
})
