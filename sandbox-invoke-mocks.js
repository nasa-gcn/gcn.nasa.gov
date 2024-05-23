const testString = `From: "LastName, FirstName"
    <example.user@example.com>
To: "circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>
Subject: GRB 230207B: Detection by GRBAlpha
Thread-Topic: GRB 230207B: Detection by GRBAlpha
Thread-Index: Adk9dI5aYPr6M3WhQFmrIV1eoz5z1A==
Date: Fri, 10 Feb 2023 17:24:40 +0000
Accept-Language: en-US
Content-Language: en-US
Content-Type: multipart/alternative;
    boundary="_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_"
MIME-Version: 1.0

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable


There is no strife, no prejudice, no national conflict in outer space as yet. Its hazards are hostile to us all. Its conquest deserves the best of all mankind, and its opportunity for peaceful cooperation many never come again. But why, some say, the moon? Why choose this as our goal? And they may well ask why climb the highest mountain? Why, 35 years ago, fly the Atlantic? Why does Rice play Texas?

We choose to go to the moon. We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills, because that challenge is one that we are willing to accept, one we are unwilling to postpone, and one which we intend to win, and the others, too.

It is for these reasons that I regard the decision last year to shift our efforts in space from low to high gear as among the most important decisions that will be made during my incumbency in the office of the Presidency.

In the last 24 hours we have seen facilities now being created for the greatest and most complex exploration in man's history. We have felt the ground shake and the air shattered by the testing of a Saturn C-1 booster rocket, many times as powerful as the Atlas which launched John Glenn, generating power equivalent to 10,000 automobiles with their accelerators on the floor. We have seen the site where the F-1 rocket engines, each one as powerful as all eight engines of the Saturn combined, will be clustered together to make the advanced Saturn missile, assembled in a new building to be built at Cape Canaveral as tall as a 48 story structure, as wide as a city block, and as long as two lengths of this field.

There is no strife, no prejudice, no national conflict in outer space as yet. Its hazards are hostile to us all. Its conquest deserves the best of all mankind, and its opportunity for peaceful cooperation many never come again. But why, some say, the moon? Why choose this as 
our goal? And they may well ask why climb the highest mountain? Why, 35 years ago, fly the Atlantic? Why does Rice play Texas?

We choose to go to the moon. We choose to go to the moon in this decade and do the other things, not because they are easy, but because they are hard, because that goal will serve to organize and measure the best of our energies and skills, because that challenge is one that 
we are willing to accept, one we are unwilling to postpone, and one which we intend to win, and the others, too.

It is for these reasons that I regard the decision last year to shift our efforts in space from low to high gear as among the most important decisions that will be made during my incumbency in the office of the Presidency.

In the last 24 hours we have seen facilities now being created for the greatest and most complex exploration in man's history. We have felt the ground shake and the air shattered by the testing of a Saturn C-1 booster rocket, many times as powerful as the Atlas which launched John Glenn, generating power equivalent to 10,000 automobiles with their accelerators on the floor. We have seen the site where the F-1 rocket engines, each one as powerful as all eight engines of the Saturn combined, will be clustered together to make the advanced Saturn missile, assembled in a new building to be built at Cape Canaveral as tall as a 48 story structure, as wide as a city block, and as long as 
two lengths of this field.

¢ £ ¤ ¥ ¦ § ¨ © ª « ¶ µ À Á Â Ã

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
`

const invalidUserTestString = `From: "LastName, FirstName"
    <invalid.example@example.com>
To: "circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>
Subject: GRB 230207B: Detection by GRBAlpha
Thread-Topic: GRB 230207B: Detection by GRBAlpha
Thread-Index: Adk9dI5aYPr6M3WhQFmrIV1eoz5z1A==
Date: Fri, 10 Feb 2023 17:24:40 +0000
Accept-Language: en-US
Content-Language: en-US
Content-Type: multipart/alternative;
    boundary="_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_"
MIME-Version: 1.0

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable


This is a test

¢ £ ¤ ¥ ¦ § ¨ © ª « ¶ µ À Á Â Ã

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
`

const validLegacyUserTestString = `From: "LastName, FirstName"
    <example.user@example.com>
To: "circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>
Subject: GRB 230207B: Detection by GRBAlpha
Thread-Topic: GRB 230207B: Detection by GRBAlpha
Thread-Index: Adk9dI5aYPr6M3WhQFmrIV1eoz5z1A==
Date: Fri, 10 Feb 2023 17:24:40 +0000
Accept-Language: en-US
Content-Language: en-US
Content-Type: multipart/alternative;
    boundary="_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_"
MIME-Version: 1.0

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable


This is a test for legacy user stuff

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
`
const emailSpamAndVirusScan = `From: "LastName, FirstName"
    <example.user@example.com>
To: "circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>
Subject: GRB 230207B: Detection by GRBAlpha
Thread-Topic: GRB 230207B: Detection by GRBAlpha
Thread-Index: Adk9dI5aYPr6M3WhQFmrIV1eoz5z1A==
Date: Fri, 10 Feb 2023 17:24:40 +0000
Accept-Language: en-US
Content-Language: en-US
Content-Type: multipart/alternative;
    boundary="_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_"
MIME-Version: 1.0

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
Content-Type: text/plain; charset="us-ascii"
Content-Transfer-Encoding: quoted-printable


This is a test for Spam/Virus

--_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_
`

export default {
  events: {
    'email-incoming': {
      main: {
        content: Buffer.from(testString).toString('base64'),
        receipt: {
          timestamp: '2023-03-01T19:59:12.905Z',
          processingTimeMillis: 1052,
          recipients: ['circulars@dev.gcn.nasa.gov'],
          spamVerdict: { status: 'PASS' },
          virusVerdict: { status: 'PASS' },
          spfVerdict: { status: 'PASS' },
          dkimVerdict: { status: 'PASS' },
          dmarcVerdict: { status: 'PASS' },
          action: {
            type: 'SNS',
            topicArn: 'fake-string-here',
            encoding: 'BASE64',
          },
        },
      },
      legacy_user_fail: {
        content: Buffer.from(invalidUserTestString).toString('base64'),
        receipt: {
          timestamp: '2023-03-01T19:59:12.905Z',
          processingTimeMillis: 1052,
          recipients: ['circulars@dev.gcn.nasa.gov'],
          spamVerdict: { status: 'PASS' },
          virusVerdict: { status: 'PASS' },
          spfVerdict: { status: 'PASS' },
          dkimVerdict: { status: 'PASS' },
          dmarcVerdict: { status: 'PASS' },
          action: {
            type: 'SNS',
            topicArn: 'fake-string-here',
            encoding: 'BASE64',
          },
        },
      },
      legacy_user_success: {
        content: Buffer.from(validLegacyUserTestString).toString('base64'),
        receipt: {
          timestamp: '2023-03-01T19:59:12.905Z',
          processingTimeMillis: 1052,
          recipients: ['circulars@dev.gcn.nasa.gov'],
          spamVerdict: { status: 'PASS' },
          virusVerdict: { status: 'PASS' },
          spfVerdict: { status: 'PASS' },
          dkimVerdict: { status: 'PASS' },
          dmarcVerdict: { status: 'PASS' },
          action: {
            type: 'SNS',
            topicArn: 'fake-string-here',
            encoding: 'BASE64',
          },
        },
      },
      spam_pass_virus_fail: {
        content: Buffer.from(emailSpamAndVirusScan).toString('base64'),
        receipt: {
          timestamp: '2023-03-01T19:59:12.905Z',
          processingTimeMillis: 1052,
          recipients: ['circulars@dev.gcn.nasa.gov'],
          spamVerdict: { status: 'PASS' },
          virusVerdict: { status: 'FAIL' },
          spfVerdict: { status: 'PASS' },
          dkimVerdict: { status: 'PASS' },
          dmarcVerdict: { status: 'PASS' },
          action: {
            type: 'SNS',
            topicArn: 'fake-string-here',
            encoding: 'BASE64',
          },
        },
      },
      spam_fail_virus_pass: {
        content: Buffer.from(emailSpamAndVirusScan).toString('base64'),
        receipt: {
          timestamp: '2023-03-01T19:59:12.905Z',
          processingTimeMillis: 1052,
          recipients: ['circulars@dev.gcn.nasa.gov'],
          spamVerdict: { status: 'FAIL' },
          virusVerdict: { status: 'PASS' },
          spfVerdict: { status: 'PASS' },
          dkimVerdict: { status: 'PASS' },
          dmarcVerdict: { status: 'PASS' },
          action: {
            type: 'SNS',
            topicArn: 'fake-string-here',
            encoding: 'BASE64',
          },
        },
      },
    },
  },
  scheduled: {},
  'tables-streams': {
    circulars: {
      INSERT: {
        circularId: 40000,
        createdOn: 1677530723000,
        submitter: 'Example User at Example <user@example.com>',
        email: 'user@example.com',
        subject: 'GRB 230000A: Global MASTER-Net observations',
        body: 'This is a test',
      },
    },
    'circulars-kafka-distribution': {
      INSERT: {
        circularId: 40000,
        createdOn: 1677530723000,
        submitter: 'Example User at Example <user@example.com>',
        email: 'user@example.com',
        subject: 'GRB 230000A: Global MASTER-Net observations',
        body: 'This is a test',
      },
    },
  },
}
