module.exports = {
  events: {
    'email-incoming': {
      main: {
        notificationType: 'Received',
        mail: {
          timestamp: '2023-02-10T17:25:54.529Z',
          source: 'dakota.c.dutko@nasa.gov',
          messageId: 'cqgqvvu3mlgnuvb1is02dpvam58ekmeed365so01',
          destination: ['circulars@dev.gcn.nasa.gov'],
          headersTruncated: true,
          headers: [
            {
              name: 'Return-Path',
              value: '<dakota.c.dutko@nasa.gov>',
            },
            {
              name: 'Received',
              value:
                'from ndjsvnpf102.ndc.nasa.gov (ndjsvnpf102.ndc.nasa.gov [198.117.1.152]) by inbound-smtp.us-east-1.amazonaws.com with SMTP id cqgqvvu3mlgnuvb1is02dpvam58ekmeed365so01 for circulars@dev.gcn.nasa.gov; Fri, 10 Feb 2023 17:25:54 +0000 (UTC)',
            },
            {
              name: 'X-SES-Spam-Verdict',
              value: 'PASS',
            },
            { name: 'X-SES-Virus-Verdict', value: 'PASS' },
            {
              name: 'Received-SPF',
              value:
                'pass (spfCheck: domain of nasa.gov designates 198.117.1.152 as permitted sender) client-ip=198.117.1.152; envelope-from=dakota.c.dutko@nasa.gov; helo=ndjsvnpf102.ndc.nasa.gov;',
            },
            {
              name: 'Authentication-Results',
              value:
                'amazonses.com; spf=pass (spfCheck: domain of nasa.gov designates 198.117.1.152 as permitted sender) client-ip=198.117.1.152; envelope-from=dakota.c.dutko@nasa.gov; helo=ndjsvnpf102.ndc.nasa.gov; dkim=fail header.i=@nasa.gov; dmarc=pass header.from=nasa.gov;',
            },
            {
              name: 'X-SES-RECEIPT',
              value:
                'AEFBQUFBQUFBQUFGMW1yeDd2RUJQMlZjUzRMR1FwaVBtdHlsVm0yY0pqTWFIdmxWUVp3UmMzcXVtYkVJbHVwK3AyVi90dDByeXVNVUZVbUVCU3haRzB5aHBab1pXMmFGVHpRQ2lQS0lYMG9MMGNMRTFpU01iRjk0S0JRdFRaTDNENnM0SmNoeHVsNUdJZ0gwaWM4NWNTNVlMUnI3V3ZQdWtXbkcwWmF6VWk1VTg0aEVWWkRsTDNFUlNJT2h4bHBaYkYzTmN3NDJJMUYyQTRGSlloalpCampTTlIwelhUamxhdWFCeHdhazNTOTVtYmplZm13QmxKaHNhSU5qUG5GQk45LzlNdGRjb2ZsSlZWV3VZRXRmTTFLZnczblNWekNDZ0RiZCthcDR1V1RXdFg1WjAzY1FrNHc9PQ==',
            },
            {
              name: 'X-SES-DKIM-SIGNATURE',
              value:
                'a=rsa-sha256; q=dns/txt; b=kIdi54J34caY89xxrZL3I6tDT1/I0gnNki8GWps5OFUb6INoPc8OCtZ3iuWpz8mA6XEOTqF6ttQR0Yoj9KW48WzCUSMhr68JYc8Dx0Xb/8JceOdywQOlHqf/Gznu2927a6XporTi+xwxbxP4FZGqew3vifV8eJw5KKu80riQ8bI=; c=relaxed/simple; s=6gbrjpgwjskckoa6a5zn6fwqkn67xbtw; d=amazonses.com; t=1676049955; v=1; bh=YiD9qguBo+gUABhv3g5wClNA6CZasRCWh2wyi+ftmO0=; h=From:To:Cc:Bcc:Subject:Date:Message-ID:MIME-Version:Content-Type:X-SES-RECEIPT;',
            },
            {
              name: 'Received',
              value:
                'from NAM10-DM6-obe.outbound.protection.outlook.com (mail-dm6nam10lp2106.outbound.protection.outlook.com [104.47.58.106]) (using TLSv1.2 with cipher ECDHE-RSA-AES256-GCM-SHA384 (256/256 bits)) (No client certificate requested) by ndjsvnpf102.ndc.nasa.gov (Postfix) with ESMTPS id 1AEE5400E09C for <circulars@dev.gcn.nasa.gov>; Fri, 10 Feb 2023 11:25:53 -0600 (CST)',
            },
            {
              name: 'DKIM-Filter',
              value:
                'OpenDKIM Filter v2.11.0 ndjsvnpf102.ndc.nasa.gov 1AEE5400E09C',
            },
            {
              name: 'Authentication-Results',
              value:
                'ndjsvnpf102.ndc.nasa.gov; dkim=fail reason="signature verification failed" (1024-bit key) header.d=nasa.gov header.i=@nasa.gov header.b="YJftdgRP"',
            },
            {
              name: 'Received',
              value:
                'from BN6PR09CA0077.namprd09.prod.outlook.com (2603:10b6:404:dc::15) by SJ0PR09MB9400.namprd09.prod.outlook.com (2603:10b6:a03:460::21) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.6086.21; Fri, 10 Feb 2023 17:24:43 +0000',
            },
            {
              name: 'Received',
              value:
                'from BL0GCC02FT048.eop-gcc02.prod.protection.outlook.com (2a01:111:f400:7d05::206) by BN6PR09CA0077.outlook.office365.com (2603:10b6:404:dc::15) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.6086.21 via Frontend Transport; Fri, 10 Feb 2023 17:24:43 +0000',
            },
            {
              name: 'Authentication-Results',
              value:
                'spf=pass (sender IP is 198.117.1.215) smtp.mailfrom=nasa.gov; dkim=pass (signature was verified) header.d=nasa.gov;dmarc=pass action=none header.from=nasa.gov;',
            },
            {
              name: 'Received-SPF',
              value:
                'Pass (protection.outlook.com: domain of nasa.gov designates 198.117.1.215 as permitted sender) receiver=protection.outlook.com; client-ip=198.117.1.215; helo=autodiscover.nasa.gov; pr=C',
            },
            {
              name: 'Received',
              value:
                'from autodiscover.nasa.gov (198.117.1.215) by BL0GCC02FT048.mail.protection.outlook.com (10.97.10.86) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.6086.21 via Frontend Transport; Fri, 10 Feb 2023 17:24:43 +0000',
            },
            {
              name: 'Received',
              value:
                'from NDJSLNSCAS2.ndc.nasa.gov (198.117.5.112) by NDJSLNSCAS2.ndc.nasa.gov (198.117.5.112) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.1.2507.6; Fri, 10 Feb 2023 11:24:42 -0600',
            },
            {
              name: 'Received',
              value:
                'from NAM10-DM6-obe.outbound.protection.outlook.com (104.47.58.103) by NDJSLNSCAS2.ndc.nasa.gov (198.117.1.215) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.1.2507.6 via Frontend Transport; Fri, 10 Feb 2023 11:24:42 -0600',
            },
            {
              name: 'ARC-Seal',
              value:
                'i=1; a=rsa-sha256; s=arcselector9901; d=microsoft.com; cv=none; b=bv3OXHhEuXgXw6Wp4i/d6hgN9moZy3ile2cUD7NOb12a++hhg4LxKhKswXPD9Sp4ay4dheDJWQ83HmHL7FTibE6y160yEHJt+FvsiRtzD0l5mdCU2pWsxMEm+9qSDrA8M2hMERub5VTVH8IU2qhIzED82+uh2v/dLn8YhSc/bzLh5P+Op1XZdHylfgE6XqtnxBQ0PF7bwEOxH0XnyQ0OpMHnZAqKfzdH+aEaarcV08XrPHQnxJF6Sj+MZko/TAuJcm2fjT6UJdQFrCwfojGVaBHG/aTU+pDyNe6aHquLQFyHd4+4KloaKS4csZOopj1FeTz6XXDOSwOkKtXI5FWiRw==',
            },
            {
              name: 'ARC-Message-Signature',
              value:
                'i=1; a=rsa-sha256; c=relaxed/relaxed; d=microsoft.com; s=arcselector9901; h=From:Date:Subject:Message-ID:Content-Type:MIME-Version:X-MS-Exchange-AntiSpam-MessageData-ChunkCount:X-MS-Exchange-AntiSpam-MessageData-0:X-MS-Exchange-AntiSpam-MessageData-1; bh=WB1svmR3KxxeEh4CM7YXWGtZbpXpnuC+EutIpmm+FoM=; b=Y0ZqyVw6xEnUCfPPdhiBRe5KI/kRi5hFgQH1mRvaGEvm+TdbcelLsMql1FYig9+1+UaBLDBwjQOiNPdiJZh1ZO9GxCZZ2879LFNxkW60rUuEUUtTvdvFtyVzBJkA6/x26zPo0VCCLuQdED1YKuUFtjLLLO1IIZAcoi5ljNRdh/Neha+1uQ/NpaUknI9u6JnucwxcFz1TDy/EpIdVcaHGFNSqxGb4V7ilBHNrY+knXXZkBVQOuiJvT9fZ89MnKXYqlUXkfcvFt17ucohO1yveoFN913F9ThozyzYTlzniXKLxbqpCtbiaLAZVNKRjzGXoxIa4l6p/kxegrCBBDOgZ2Q==',
            },
            {
              name: 'ARC-Authentication-Results',
              value:
                'i=1; mx.microsoft.com 1; spf=pass smtp.mailfrom=nasa.gov; dmarc=pass action=none header.from=nasa.gov; dkim=pass header.d=nasa.gov; arc=none',
            },
            {
              name: 'DKIM-Signature',
              value:
                'v=1; a=rsa-sha256; c=relaxed/relaxed; d=nasa.gov; s=selector1; h=From:Date:Subject:Message-ID:Content-Type:MIME-Version:X-MS-Exchange-SenderADCheck; bh=WB1svmR3KxxeEh4CM7YXWGtZbpXpnuC+EutIpmm+FoM=; b=YJftdgRPD0Z9E22Ld9l8XIONmEVpVSn6V2/DOdHmQXlxSRkVpa9jDGTVnn3wH3etmBwVpzVveUmGLtm+2OEFROmU6TtD223y2JNYTuf/RxnaNHMnuWuy6rxqTtDWpUM7O0h0gNlo8DFw2RPoFpalEnp8un1AR3R8qQCk0aRnGZA=',
            },
            {
              name: 'Received',
              value:
                'from PH0PR09MB7884.namprd09.prod.outlook.com (2603:10b6:510:67::21) by BY5PR09MB5921.namprd09.prod.outlook.com (2603:10b6:a03:24b::8) with Microsoft SMTP Server (version=TLS1_2, cipher=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384) id 15.20.6086.21; Fri, 10 Feb 2023 17:24:41 +0000',
            },
            {
              name: 'Received',
              value:
                'from PH0PR09MB7884.namprd09.prod.outlook.com ([fe80::fe59:ec92:b050:79d4]) by PH0PR09MB7884.namprd09.prod.outlook.com ([fe80::fe59:ec92:b050:79d4%8]) with mapi id 15.20.6086.021; Fri, 10 Feb 2023 17:24:41 +0000',
            },
            {
              name: 'From',
              value:
                '"Dutko, Dakota C. (GSFC-660.0)[ADNET SYSTEMS INC]" <dakota.c.dutko@nasa.gov>',
            },
            {
              name: 'To',
              value:
                '"circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>',
            },
            { name: 'Subject', value: 'GRB 230207B: Detection by GRBAlpha' },
            {
              name: 'Thread-Topic',
              value: 'GRB 230207B: Detection by GRBAlpha',
            },
            { name: 'Thread-Index', value: 'Adk9dI5aYPr6M3WhQFmrIV1eoz5z1A==' },
            { name: 'Date', value: 'Fri, 10 Feb 2023 17:24:40 +0000' },
            {
              name: 'Message-ID',
              value:
                '<PH0PR09MB78840D967BF3AA3F19E64A96A1DE9@PH0PR09MB7884.namprd09.prod.outlook.com>',
            },
            { name: 'Accept-Language', value: 'en-US' },
            { name: 'Content-Language', value: 'en-US' },
            { name: 'X-MS-Has-Attach', value: '' },
            { name: 'X-MS-TNEF-Correlator', value: '' },
            {
              name: 'Authentication-Results-Original',
              value:
                'dkim=none (message not signed) header.d=none;dmarc=none action=none header.from=nasa.gov;',
            },
            {
              name: 'x-ms-traffictypediagnostic',
              value:
                'PH0PR09MB7884:EE_|BY5PR09MB5921:EE_|BL0GCC02FT048:EE_|SJ0PR09MB9400:EE_',
            },
            {
              name: 'X-MS-Office365-Filtering-Correlation-Id',
              value: '3fe277a6-38ff-4981-f1cb-08db0b8bb301',
            },
            { name: 'X-MS-Exchange-AtpMessageProperties', value: 'SA|SL' },
            { name: 'X-Microsoft-Antispam-Untrusted', value: 'BCL:0;' },
            {
              name: 'X-Microsoft-Antispam-Message-Info-Original',
              value:
                'mMi8zN3lAnYC50hT86UilUlToPd5fo9HRPTMNLiPBbOrNykVzb4jklBh1MqWcbotzzKzlJ330+OnR3LWfBDdbKtP/dCCjkH28NB+f1jeVNKzb94TM4BThcFwK0AzHdfDOJBfg4hwKBy+nedSagALGSPh0uLJki2tvl4yIq6iwCqsWfT2V9yat9N9Y6HHTp1iMmn6lWhjM3bBcho9wPT1uHk/21Cb+0Nc+wzMkcHqCJB9Pk56Iq+rnMkIvEyTDOKMMJEbU234SkZVIZuyqArvA3RWFekh2eRY5oHPImViWVZo/mpPNyA3CT6G97h+j8smfoAP9+Gcy2xP7fo2CUM2/xSrbaMQsLEMFxDAEVb1cKpsAl7YsB0O5bzA+stJz8JnpPU6H1kwrcHP7cmo2KUed+a/Ofyyl+MXZOXMJ49N4Ow0QMlm+O8brxH7zTftk/0LCO76xtJj9dTvai8vbsR/qpcTeT+0/AYlDPhj3+SLMpFYax2/i5ivHfHAYtCw8hwazudN9RcvMfQAJnlj6RzLwo6SMkA9XB4D/Rzt9en1LdTZafoZD7lf11LvWLYQYPvKYx9TNu/G4x/Vlg3lDe/9+oRtI0E1+etGmxdNw+hjnFnOedjUA2jLLrQYQb1wsOBtmz2WXWcWylFiMow9IAwhuqKnvHJ0dfJGxqVONv6xwy6j/d/eR4ygSYgjL1xcujruhtxZf/Aj91/R9wPt5m90ZsttEYSWkzfmjovfeK6R94H6NUgFi0ToJq4O25GDauoxYQxTfvzF3b+dEc0Cy4iAXZp6j1PL7O85CN/oF7hlK26qZTvbkeFz+UaSH7Q7O917o2YfEBtkQLnL+CygNDS/NZNaBBE1hNF7Z+ZxmF4lJzk=',
            },
            {
              name: 'X-Forefront-Antispam-Report-Untrusted',
              value:
                'CIP:255.255.255.255;CTRY:;LANG:en;SCL:-1;SRV:;IPV:NLI;SFV:SKI;H:PH0PR09MB7884.namprd09.prod.outlook.com;PTR:;CAT:NONE;SFS:;DIR:INB;',
            },
            { name: 'x-ms-exchange-atpsafelinks-stat', value: '0' },
            {
              name: 'X-MS-Exchange-ATPSafeLinks-BitVector',
              value: '3000:0x0|0x0|0x3000|0x0;',
            },
            {
              name: 'Content-Type',
              value:
                'multipart/alternative; boundary="_000_PH0PR09MB78840D967BF3AA3F19E64A96A1DE9PH0PR09MB7884namp_"',
            },
            { name: 'MIME-Version', value: '1.0' },
            {
              name: 'X-MS-Exchange-Transport-CrossTenantHeadersStamped',
              value: 'BY5PR09MB5921',
            },
            {
              name: 'X-OrganizationHeadersPreserved',
              value: 'BY5PR09MB5921.namprd09.prod.outlook.com',
            },
            {
              name: 'X-CrossPremisesHeadersPromoted',
              value: 'NDJSLNSCAS2.ndc.nasa.gov',
            },
            {
              name: 'X-CrossPremisesHeadersFiltered',
              value: 'NDJSLNSCAS2.ndc.nasa.gov',
            },
            { name: 'EX-Check', value: '1' },
            { name: 'X-EOPAttributedMessage', value: '0' },
            {
              name: 'X-MS-Exchange-Transport-CrossTenantHeadersStripped',
              value: 'BL0GCC02FT048.eop-gcc02.prod.protection.outlook.com',
            },
            { name: 'X-MS-PublicTrafficType', value: 'Email' },
            {
              name: 'X-MS-Office365-Filtering-Correlation-Id-Prvs',
              value: 'c0e5c332-f905-4574-4e47-08db0b8bb189',
            },
            { name: 'NPF-Check', value: '1' },
            { name: 'X-Microsoft-Antispam', value: 'BCL:0;' },
          ],
          commonHeaders: {
            returnPath: 'dakota.c.dutko@nasa.gov',
            from: [
              '"Dutko, Dakota C. (GSFC-660.0)[ADNET SYSTEMS INC]" <dakota.c.dutko@nasa.gov>',
            ],
            date: 'Fri, 10 Feb 2023 17:24:40 +0000',
            to: ['"circulars@dev.gcn.nasa.gov" <circulars@dev.gcn.nasa.gov>'],
            messageId:
              '<PH0PR09MB78840D967BF3AA3F19E64A96A1DE9@PH0PR09MB7884.namprd09.prod.outlook.com>',
            subject: 'GRB 230207B: Detection by GRBAlpha',
          },
        },
        receipt: {
          timestamp: '2023-02-10T17:25:54.529Z',
          processingTimeMillis: 803,
          recipients: ['circulars@dev.gcn.nasa.gov'],
          spamVerdict: { status: 'PASS' },
          virusVerdict: { status: 'PASS' },
          spfVerdict: { status: 'PASS' },
          dkimVerdict: { status: 'FAIL' },
          dmarcVerdict: { status: 'PASS' },
          action: {
            type: 'SNS',
            topicArn: 'arn:aws:sns:us-east-1:080289926366:Test-Email-Incoming',
            encoding: 'BASE64',
          },
        },
        content:
          'UmV0dXJuLVBhdGg6IDxkYWtvdGEuYy5kdXRrb0BuYXNhLmdvdj4NClJlY2VpdmVkOiBmcm9tIG5kanN2bnBmMTAyLm5kYy5uYXNhLmdvdiAobmRqc3ZucGYxMDIubmRjLm5hc2EuZ292IFsxOTguMTE3LjEuMTUyXSkNCiBieSBpbmJvdW5kLXNtdHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb20gd2l0aCBTTVRQIGlkIGNxZ3F2dnUzbWxnbnV2YjFpczAyZHB2YW01OGVrbWVlZDM2NXNvMDENCiBmb3IgY2lyY3VsYXJzQGRldi5nY24ubmFzYS5nb3Y7DQogRnJpLCAxMCBGZWIgMjAyMyAxNzoyNTo1NCArMDAwMCAoVVRDKQ0KWC1TRVMtU3BhbS1WZXJkaWN0OiBQQVNTDQpYLVNFUy1WaXJ1cy1WZXJkaWN0OiBQQVNTDQpSZWNlaXZlZC1TUEY6IHBhc3MgKHNwZkNoZWNrOiBkb21haW4gb2YgbmFzYS5nb3YgZGVzaWduYXRlcyAxOTguMTE3LjEuMTUyIGFzIHBlcm1pdHRlZCBzZW5kZXIpIGNsaWVudC1pcD0xOTguMTE3LjEuMTUyOyBlbnZlbG9wZS1mcm9tPWRha290YS5jLmR1dGtvQG5hc2EuZ292OyBoZWxvPW5kanN2bnBmMTAyLm5kYy5uYXNhLmdvdjsNCkF1dGhlbnRpY2F0aW9uLVJlc3VsdHM6IGFtYXpvbnNlcy5jb207DQogc3BmPXBhc3MgKHNwZkNoZWNrOiBkb21haW4gb2YgbmFzYS5nb3YgZGVzaWduYXRlcyAxOTguMTE3LjEuMTUyIGFzIHBlcm1pdHRlZCBzZW5kZXIpIGNsaWVudC1pcD0xOTguMTE3LjEuMTUyOyBlbnZlbG9wZS1mcm9tPWRha290YS5jLmR1dGtvQG5hc2EuZ292OyBoZWxvPW5kanN2bnBmMTAyLm5kYy5uYXNhLmdvdjsNCiBka2ltPWZhaWwgaGVhZGVyLmk9QG5hc2EuZ292Ow0KIGRtYXJjPXBhc3MgaGVhZGVyLmZyb209bmFzYS5nb3Y7DQpYLVNFUy1SRUNFSVBUOiBBRUZCUVVGQlFVRkJRVUZHTVcxeWVEZDJSVUpRTWxaalV6Uk1SMUZ3YVZCdGRIbHNWbTB5WTBwcVRXRklkbXhXVVZwM1VtTXpjWFZ0WWtWSmJIVndLM0F5Vmk5MGREQnllWFZOVlVaVmJVVkNVM2hhUnpCNWFIQmFiMXBYTW1GR1ZIcFJRMmxRUzBsWU1HOU1NR05NUlRGcFUwMWlSamswUzBKUmRGUmFURE5FTm5NMFNtTm9lSFZzTlVkSlowZ3dhV000TldOVE5WbE1VbkkzVjNaUWRXdFhia2N3V21GNlZXazFWVGcwYUVWV1drUnNURE5GVWxOSlQyaDRiSEJhWWtZelRtTjNOREpKTVVZeVFUUkdTbGxvYWxwQ2FtcFRUbEl3ZWxoVWFteGhkV0ZDZUhkaGF6TlRPVFZ0WW1wbFptMTNRbXhLYUhOaFNVNXFVRzVHUWs0NUx6bE5kR1JqYjJac1NsWldWM1ZaUlhSbVRURkxabmN6YmxOV2VrTkRaMFJpWkN0aGNEUjFWMVJYZEZnMVdqQXpZMUZyTkhjOVBRPT0NClgtU0VTLURLSU0tU0lHTkFUVVJFOiBhPXJzYS1zaGEyNTY7IHE9ZG5zL3R4dDsgYj1rSWRpNTRKMzRjYVk4OXh4clpMM0k2dERUMS9JMGduTmtpOEdXcHM1T0ZVYjZJTm9QYzhPQ3RaM2l1V3B6OG1BNlhFT1RxRjZ0dFFSMFlvajlLVzQ4V3pDVVNNaHI2OEpZYzhEeDBYYi84SmNlT2R5d1FPbEhxZi9Hem51MjkyN2E2WHBvclRpK3h3eGJ4UDRGWkdxZXczdmlmVjhlSnc1S0t1ODByaVE4Ykk9OyBjPXJlbGF4ZWQvc2ltcGxlOyBzPTZnYnJqcGd3anNrY2tvYTZhNXpuNmZ3cWtuNjd4YnR3OyBkPWFtYXpvbnNlcy5jb207IHQ9MTY3NjA0OTk1NTsgdj0xOyBiaD1ZaUQ5cWd1Qm8rZ1VBQmh2M2c1d0NsTkE2Q1phc1JDV2gyd3lpK2Z0bU8wPTsgaD1Gcm9tOlRvOkNjOkJjYzpTdWJqZWN0OkRhdGU6TWVzc2FnZS1JRDpNSU1FLVZlcnNpb246Q29udGVudC1UeXBlOlgtU0VTLVJFQ0VJUFQ7DQpSZWNlaXZlZDogZnJvbSBOQU0xMC1ETTYtb2JlLm91dGJvdW5kLnByb3RlY3Rpb24ub3V0bG9vay5jb20gKG1haWwtZG02bmFtMTBscDIxMDYub3V0Ym91bmQucHJvdGVjdGlvbi5vdXRsb29rLmNvbSBbMTA0LjQ3LjU4LjEwNl0pDQoJKHVzaW5nIFRMU3YxLjIgd2l0aCBjaXBoZXIgRUNESEUtUlNBLUFFUzI1Ni1HQ00tU0hBMzg0ICgyNTYvMjU2IGJpdHMpKQ0KCShObyBjbGllbnQgY2VydGlmaWNhdGUgcmVxdWVzdGVkKQ0KCWJ5IG5kanN2bnBmMTAyLm5kYy5uYXNhLmdvdiAoUG9zdGZpeCkgd2l0aCBFU01UUFMgaWQgMUFFRTU0MDBFMDlDDQoJZm9yIDxjaXJjdWxhcnNAZGV2Lmdjbi5uYXNhLmdvdj47IEZyaSwgMTAgRmViIDIwMjMgMTE6MjU6NTMgLTA2MDAgKENTVCkNCkRLSU0tRmlsdGVyOiBPcGVuREtJTSBGaWx0ZXIgdjIuMTEuMCBuZGpzdm5wZjEwMi5uZGMubmFzYS5nb3YgMUFFRTU0MDBFMDlDDQpBdXRoZW50aWNhdGlvbi1SZXN1bHRzOiBuZGpzdm5wZjEwMi5uZGMubmFzYS5nb3Y7DQoJZGtpbT1mYWlsIHJlYXNvbj0ic2lnbmF0dXJlIHZlcmlmaWNhdGlvbiBmYWlsZWQiICgxMDI0LWJpdCBrZXkpIGhlYWRlci5kPW5hc2EuZ292IGhlYWRlci5pPUBuYXNhLmdvdiBoZWFkZXIuYj0iWUpmdGRnUlAiDQpSZWNlaXZlZDogZnJvbSBCTjZQUjA5Q0EwMDc3Lm5hbXByZDA5LnByb2Qub3V0bG9vay5jb20gKDI2MDM6MTBiNjo0MDQ6ZGM6OjE1KQ0KIGJ5IFNKMFBSMDlNQjk0MDAubmFtcHJkMDkucHJvZC5vdXRsb29rLmNvbSAoMjYwMzoxMGI2OmEwMzo0NjA6OjIxKSB3aXRoDQogTWljcm9zb2Z0IFNNVFAgU2VydmVyICh2ZXJzaW9uPVRMUzFfMiwNCiBjaXBoZXI9VExTX0VDREhFX1JTQV9XSVRIX0FFU18yNTZfR0NNX1NIQTM4NCkgaWQgMTUuMjAuNjA4Ni4yMTsgRnJpLCAxMCBGZWINCiAyMDIzIDE3OjI0OjQzICswMDAwDQpSZWNlaXZlZDogZnJvbSBCTDBHQ0MwMkZUMDQ4LmVvcC1nY2MwMi5wcm9kLnByb3RlY3Rpb24ub3V0bG9vay5jb20NCiAoMmEwMToxMTE6ZjQwMDo3ZDA1OjoyMDYpIGJ5IEJONlBSMDlDQTAwNzcub3V0bG9vay5vZmZpY2UzNjUuY29tDQogKDI2MDM6MTBiNjo0MDQ6ZGM6OjE1KSB3aXRoIE1pY3Jvc29mdCBTTVRQIFNlcnZlciAodmVyc2lvbj1UTFMxXzIsDQogY2lwaGVyPVRMU19FQ0RIRV9SU0FfV0lUSF9BRVNfMjU2X0dDTV9TSEEzODQpIGlkIDE1LjIwLjYwODYuMjEgdmlhIEZyb250ZW5kDQogVHJhbnNwb3J0OyBGcmksIDEwIEZlYiAyMDIzIDE3OjI0OjQzICswMDAwDQpBdXRoZW50aWNhdGlvbi1SZXN1bHRzOiBzcGY9cGFzcyAoc2VuZGVyIElQIGlzIDE5OC4xMTcuMS4yMTUpDQogc210cC5tYWlsZnJvbT1uYXNhLmdvdjsgZGtpbT1wYXNzIChzaWduYXR1cmUgd2FzIHZlcmlmaWVkKQ0KIGhlYWRlci5kPW5hc2EuZ292O2RtYXJjPXBhc3MgYWN0aW9uPW5vbmUgaGVhZGVyLmZyb209bmFzYS5nb3Y7DQpSZWNlaXZlZC1TUEY6IFBhc3MgKHByb3RlY3Rpb24ub3V0bG9vay5jb206IGRvbWFpbiBvZiBuYXNhLmdvdiBkZXNpZ25hdGVzDQogMTk4LjExNy4xLjIxNSBhcyBwZXJtaXR0ZWQgc2VuZGVyKSByZWNlaXZlcj1wcm90ZWN0aW9uLm91dGxvb2suY29tOw0KIGNsaWVudC1pcD0xOTguMTE3LjEuMjE1OyBoZWxvPWF1dG9kaXNjb3Zlci5uYXNhLmdvdjsgcHI9Qw0KUmVjZWl2ZWQ6IGZyb20gYXV0b2Rpc2NvdmVyLm5hc2EuZ292ICgxOTguMTE3LjEuMjE1KSBieQ0KIEJMMEdDQzAyRlQwNDgubWFpbC5wcm90ZWN0aW9uLm91dGxvb2suY29tICgxMC45Ny4xMC44Nikgd2l0aCBNaWNyb3NvZnQgU01UUA0KIFNlcnZlciAodmVyc2lvbj1UTFMxXzIsIGNpcGhlcj1UTFNfRUNESEVfUlNBX1dJVEhfQUVTXzI1Nl9HQ01fU0hBMzg0KSBpZA0KIDE1LjIwLjYwODYuMjEgdmlhIEZyb250ZW5kIFRyYW5zcG9ydDsgRnJpLCAxMCBGZWIgMjAyMyAxNzoyNDo0MyArMDAwMA0KUmVjZWl2ZWQ6IGZyb20gTkRKU0xOU0NBUzIubmRjLm5hc2EuZ292ICgxOTguMTE3LjUuMTEyKSBieQ0KIE5ESlNMTlNDQVMyLm5kYy5uYXNhLmdvdiAoMTk4LjExNy41LjExMikgd2l0aCBNaWNyb3NvZnQgU01UUCBTZXJ2ZXINCiAodmVyc2lvbj1UTFMxXzIsIGNpcGhlcj1UTFNfRUNESEVfUlNBX1dJVEhfQUVTXzI1Nl9HQ01fU0hBMzg0KSBpZA0KIDE1LjEuMjUwNy42OyBGcmksIDEwIEZlYiAyMDIzIDExOjI0OjQyIC0wNjAwDQpSZWNlaXZlZDogZnJvbSBOQU0xMC1ETTYtb2JlLm91dGJvdW5kLnByb3RlY3Rpb24ub3V0bG9vay5jb20gKDEwNC40Ny41OC4xMDMpDQogYnkgTkRKU0xOU0NBUzIubmRjLm5hc2EuZ292ICgxOTguMTE3LjEuMjE1KSB3aXRoIE1pY3Jvc29mdCBTTVRQIFNlcnZlcg0KICh2ZXJzaW9uPVRMUzFfMiwgY2lwaGVyPVRMU19FQ0RIRV9SU0FfV0lUSF9BRVNfMjU2X0dDTV9TSEEzODQpIGlkIDE1LjEuMjUwNy42DQogdmlhIEZyb250ZW5kIFRyYW5zcG9ydDsgRnJpLCAxMCBGZWIgMjAyMyAxMToyNDo0MiAtMDYwMA0KQVJDLVNlYWw6IGk9MTsgYT1yc2Etc2hhMjU2OyBzPWFyY3NlbGVjdG9yOTkwMTsgZD1taWNyb3NvZnQuY29tOyBjdj1ub25lOw0KIGI9YnYzT1hIaEV1WGdYdzZXcDRpL2Q2aGdOOW1vWnkzaWxlMmNVRDdOT2IxMmErK2hoZzRMeEtoS3N3WFBEOVNwNGF5NGRoZURKV1E4M0htSEw3RlRpYkU2eTE2MHlFSEp0K0Z2c2lSdHpEMGw1bWRDVTJwV3N4TUVtKzlxU0RyQThNMmhNRVJ1YjVWVFZIOElVMnFoSXpFRDgyK3VoMnYvZExuOFloU2MvYnpMaDVQK09wMVhaZEh5bGZnRTZYcXRueEJRMFBGN2J3RU94SDBYbnlRME9wTUhuWkFxS2Z6ZEgrYUVhYXJjVjA4WHJQSFFueEpGNlNqK01aa28vVEF1SmNtMmZqVDZVSmRRRnJDd2ZvakdWYUJIRy9hVFUrcER5TmU2YUhxdUxRRnlIZDQrNEtsb2FLUzRjc1pPb3BqMUZlVHo2WFhET1N3T2tLdFhJNUZXaVJ3PT0NCkFSQy1NZXNzYWdlLVNpZ25hdHVyZTogaT0xOyBhPXJzYS1zaGEyNTY7IGM9cmVsYXhlZC9yZWxheGVkOyBkPW1pY3Jvc29mdC5jb207DQogcz1hcmNzZWxlY3Rvcjk5MDE7DQogaD1Gcm9tOkRhdGU6U3ViamVjdDpNZXNzYWdlLUlEOkNvbnRlbnQtVHlwZTpNSU1FLVZlcnNpb246WC1NUy1FeGNoYW5nZS1BbnRpU3BhbS1NZXNzYWdlRGF0YS1DaHVua0NvdW50OlgtTVMtRXhjaGFuZ2UtQW50aVNwYW0tTWVzc2FnZURhdGEtMDpYLU1TLUV4Y2hhbmdlLUFudGlTcGFtLU1lc3NhZ2VEYXRhLTE7DQogYmg9V0Ixc3ZtUjNLeHhlRWg0Q003WVhXR3RaYnBYcG51QytFdXRJcG1tK0ZvTT07DQogYj1ZMFpxeVZ3NnhFblVDZlBQZGhpQlJlNUtJL2tSaTVoRmdRSDFtUnZhR0V2bStUZGJjZWxMc01xbDFGWWlnOSsxK1VhQkxEQndqUU9pTlBkaUpaaDFaTzlHeENaWjI4NzlMRk54a1c2MHJVdUVVVXRUdmR2RnR5VnpCSmtBNi94MjZ6UG8wVkNDTHVRZEVEMVlLdVVGdGpMTExPMUlJWkFjb2k1bGpOUmRoL05laGErMXVRL05wYVVrbkk5dTZKbnVjd3hjRnoxVER5L0VwSWRWY2FIR0ZOU3F4R2I0VjdpbEJITnJZK2tuWFhaa0JWUU91aUp2VDlmWjg5TW5LWFlxbFVYa2ZjdkZ0MTd1Y29oTzF5dmVvRk45MTNGOVRob3p5ellUbHpuaVhLTHhicXBDdGJpYUxBWlZOS1JqekdYb3hJYTRsNnAva3hlZ3JDQkJET2daMlE9PQ0KQVJDLUF1dGhlbnRpY2F0aW9uLVJlc3VsdHM6IGk9MTsgbXgubWljcm9zb2Z0LmNvbSAxOyBzcGY9cGFzcw0KIHNtdHAubWFpbGZyb209bmFzYS5nb3Y7IGRtYXJjPXBhc3MgYWN0aW9uPW5vbmUgaGVhZGVyLmZyb209bmFzYS5nb3Y7DQogZGtpbT1wYXNzIGhlYWRlci5kPW5hc2EuZ292OyBhcmM9bm9uZQ0KREtJTS1TaWduYXR1cmU6IHY9MTsgYT1yc2Etc2hhMjU2OyBjPXJlbGF4ZWQvcmVsYXhlZDsgZD1uYXNhLmdvdjsgcz1zZWxlY3RvcjE7DQogaD1Gcm9tOkRhdGU6U3ViamVjdDpNZXNzYWdlLUlEOkNvbnRlbnQtVHlwZTpNSU1FLVZlcnNpb246WC1NUy1FeGNoYW5nZS1TZW5kZXJBRENoZWNrOw0KIGJoPVdCMXN2bVIzS3h4ZUVoNENNN1lYV0d0WmJwWHBudUMrRXV0SXBtbStGb009Ow0KIGI9WUpmdGRnUlBEMFo5RTIyTGQ5bDhYSU9ObUVWcFZTbjZWMi9ET2RIbVFYbHhTUmtWcGE5akRHVFZubjN3SDNldG1Cd1ZwelZ2ZVVtR0x0bSsyT0VGUk9tVTZUdEQyMjN5MkpOWVR1Zi9SeG5hTkhNbnVXdXk2cnhxVHREV3BVTTdPMGgwZ05sbzhERncyUlBvRnBhbEVucDh1bjFBUjNSOHFRQ2swYVJuR1pBPQ0KUmVjZWl2ZWQ6IGZyb20gUEgwUFIwOU1CNzg4NC5uYW1wcmQwOS5wcm9kLm91dGxvb2suY29tICgyNjAzOjEwYjY6NTEwOjY3OjoyMSkNCiBieSBCWTVQUjA5TUI1OTIxLm5hbXByZDA5LnByb2Qub3V0bG9vay5jb20gKDI2MDM6MTBiNjphMDM6MjRiOjo4KSB3aXRoDQogTWljcm9zb2Z0IFNNVFAgU2VydmVyICh2ZXJzaW9uPVRMUzFfMiwNCiBjaXBoZXI9VExTX0VDREhFX1JTQV9XSVRIX0FFU18yNTZfR0NNX1NIQTM4NCkgaWQgMTUuMjAuNjA4Ni4yMTsgRnJpLCAxMCBGZWINCiAyMDIzIDE3OjI0OjQxICswMDAwDQpSZWNlaXZlZDogZnJvbSBQSDBQUjA5TUI3ODg0Lm5hbXByZDA5LnByb2Qub3V0bG9vay5jb20NCiAoW2ZlODA6OmZlNTk6ZWM5MjpiMDUwOjc5ZDRdKSBieSBQSDBQUjA5TUI3ODg0Lm5hbXByZDA5LnByb2Qub3V0bG9vay5jb20NCiAoW2ZlODA6OmZlNTk6ZWM5MjpiMDUwOjc5ZDQlOF0pIHdpdGggbWFwaSBpZCAxNS4yMC42MDg2LjAyMTsgRnJpLCAxMCBGZWIgMjAyMw0KIDE3OjI0OjQxICswMDAwDQpGcm9tOiAiRHV0a28sIERha290YSBDLiAoR1NGQy02NjAuMClbQURORVQgU1lTVEVNUyBJTkNdIg0KCTxkYWtvdGEuYy5kdXRrb0BuYXNhLmdvdj4NClRvOiAiY2lyY3VsYXJzQGRldi5nY24ubmFzYS5nb3YiIDxjaXJjdWxhcnNAZGV2Lmdjbi5uYXNhLmdvdj4NClN1YmplY3Q6IEdSQiAyMzAyMDdCOiBEZXRlY3Rpb24gYnkgR1JCQWxwaGENClRocmVhZC1Ub3BpYzogR1JCIDIzMDIwN0I6IERldGVjdGlvbiBieSBHUkJBbHBoYQ0KVGhyZWFkLUluZGV4OiBBZGs5ZEk1YVlQcjZNM1doUUZtcklWMWVvejV6MUE9PQ0KRGF0ZTogRnJpLCAxMCBGZWIgMjAyMyAxNzoyNDo0MCArMDAwMA0KTWVzc2FnZS1JRDogPFBIMFBSMDlNQjc4ODQwRDk2N0JGM0FBM0YxOUU2NEE5NkExREU5QFBIMFBSMDlNQjc4ODQubmFtcHJkMDkucHJvZC5vdXRsb29rLmNvbT4NCkFjY2VwdC1MYW5ndWFnZTogZW4tVVMNCkNvbnRlbnQtTGFuZ3VhZ2U6IGVuLVVTDQpYLU1TLUhhcy1BdHRhY2g6DQpYLU1TLVRORUYtQ29ycmVsYXRvcjoNCkF1dGhlbnRpY2F0aW9uLVJlc3VsdHMtT3JpZ2luYWw6IGRraW09bm9uZSAobWVzc2FnZSBub3Qgc2lnbmVkKQ0KIGhlYWRlci5kPW5vbmU7ZG1hcmM9bm9uZSBhY3Rpb249bm9uZSBoZWFkZXIuZnJvbT1uYXNhLmdvdjsNCngtbXMtdHJhZmZpY3R5cGVkaWFnbm9zdGljOg0KCVBIMFBSMDlNQjc4ODQ6RUVffEJZNVBSMDlNQjU5MjE6RUVffEJMMEdDQzAyRlQwNDg6RUVffFNKMFBSMDlNQjk0MDA6RUVfDQpYLU1TLU9mZmljZTM2NS1GaWx0ZXJpbmctQ29ycmVsYXRpb24tSWQ6IDNmZTI3N2E2LTM4ZmYtNDk4MS1mMWNiLTA4ZGIwYjhiYjMwMQ0KWC1NUy1FeGNoYW5nZS1BdHBNZXNzYWdlUHJvcGVydGllczogU0F8U0wNClgtTWljcm9zb2Z0LUFudGlzcGFtLVVudHJ1c3RlZDogQkNMOjA7DQpYLU1pY3Jvc29mdC1BbnRpc3BhbS1NZXNzYWdlLUluZm8tT3JpZ2luYWw6DQogbU1pOHpOM2xBbllDNTBoVDg2VWlsVWxUb1BkNWZvOUhSUFRNTkxpUEJiT3JOeWtWemI0amtsQmgxTXFXY2JvdHp6S3psSjMzMCtPblIzTFdmQkRkYkt0UC9kQ0Nqa0gyOE5CK2YxamVWTkt6Yjk0VE00QlRoY0Z3SzBBekhkZkRPSkJmZzRod0tCeStuZWRTYWdBTEdTUGgwdUxKa2kydHZsNHlJcTZpd0Nxc1dmVDJWOXlhdDlOOVk2SEhUcDFpTW1uNmxXaGpNM2JCY2hvOXdQVDF1SGsvMjFDYiswTmMrd3pNa2NIcUNKQjlQazU2SXErcm5Na0l2RXlURE9LTU1KRWJVMjM0U2taVkladXlxQXJ2QTNSV0Zla2gyZVJZNW9IUEltVmlXVlpvL21wUE55QTNDVDZHOTdoK2o4c21mb0FQOStHY3kyeFA3Zm8yQ1VNMi94U3JiYU1Rc0xFTUZ4REFFVmIxY0twc0FsN1lzQjBPNWJ6QStzdEp6OEpucFBVNkgxa3dyY0hQN2NtbzJLVWVkK2EvT2Z5eWwrTVhaT1hNSjQ5TjRPdzBRTWxtK084YnJ4SDd6VGZ0ay8wTENPNzZ4dEpqOWRUdmFpOHZic1IvcXBjVGVUKzAvQVlsRFBoajMrU0xNcEZZYXgyL2k1aXZIZkhBWXRDdzhod2F6dWROOVJjdk1mUUFKbmxqNlJ6THdvNlNNa0E5WEI0RC9SenQ5ZW4xTGRUWmFmb1pEN2xmMTFMdldMWVFZUHZLWXg5VE51L0c0eC9WbGczbERlLzkrb1J0STBFMStldEdteGROdytoam5Gbk9lZGpVQTJqTExyUVlRYjF3c09CdG16MldYV2NXeWxGaU1vdzlJQXdodXFLbnZISjBkZkpHeHFWT052Nnh3eTZqL2QvZVI0eWdTWWdqTDF4Y3VqcnVodHhaZi9BajkxL1I5d1B0NW05MFpzdHRFWVNXa3pmbWpvdmZlSzZSOTRINk5VZ0ZpMFRvSnE0TzI1R0RhdW94WVF4VGZ2ekYzYitkRWMwQ3k0aUFYWnA2ajFQTDdPODVDTi9vRjdobEsyNnFaVHZia2VGeitVYVNIN1E3TzkxN28yWWZFQnRrUUxuTCtDeWdORFMvTlpOYUJCRTFoTkY3WitaeG1GNGxKems9DQpYLUZvcmVmcm9udC1BbnRpc3BhbS1SZXBvcnQtVW50cnVzdGVkOg0KIENJUDoyNTUuMjU1LjI1NS4yNTU7Q1RSWTo7TEFORzplbjtTQ0w6LTE7U1JWOjtJUFY6TkxJO1NGVjpTS0k7SDpQSDBQUjA5TUI3ODg0Lm5hbXByZDA5LnByb2Qub3V0bG9vay5jb207UFRSOjtDQVQ6Tk9ORTtTRlM6O0RJUjpJTkI7DQp4LW1zLWV4Y2hhbmdlLWF0cHNhZmVsaW5rcy1zdGF0OiAwDQpYLU1TLUV4Y2hhbmdlLUFUUFNhZmVMaW5rcy1CaXRWZWN0b3I6IDMwMDA6MHgwfDB4MHwweDMwMDB8MHgwOw0KQ29udGVudC1UeXBlOiBtdWx0aXBhcnQvYWx0ZXJuYXRpdmU7DQoJYm91bmRhcnk9Il8wMDBfUEgwUFIwOU1CNzg4NDBEOTY3QkYzQUEzRjE5RTY0QTk2QTFERTlQSDBQUjA5TUI3ODg0bmFtcF8iDQpNSU1FLVZlcnNpb246IDEuMA0KWC1NUy1FeGNoYW5nZS1UcmFuc3BvcnQtQ3Jvc3NUZW5hbnRIZWFkZXJzU3RhbXBlZDogQlk1UFIwOU1CNTkyMQ0KWC1Pcmdhbml6YXRpb25IZWFkZXJzUHJlc2VydmVkOiBCWTVQUjA5TUI1OTIxLm5hbXByZDA5LnByb2Qub3V0bG9vay5jb20NClgtQ3Jvc3NQcmVtaXNlc0hlYWRlcnNQcm9tb3RlZDogTkRKU0xOU0NBUzIubmRjLm5hc2EuZ292DQpYLUNyb3NzUHJlbWlzZXNIZWFkZXJzRmlsdGVyZWQ6IE5ESlNMTlNDQVMyLm5kYy5uYXNhLmdvdg0KRVgtQ2hlY2s6IDENClgtRU9QQXR0cmlidXRlZE1lc3NhZ2U6IDANClgtTVMtRXhjaGFuZ2UtVHJhbnNwb3J0LUNyb3NzVGVuYW50SGVhZGVyc1N0cmlwcGVkOg0KIEJMMEdDQzAyRlQwNDguZW9wLWdjYzAyLnByb2QucHJvdGVjdGlvbi5vdXRsb29rLmNvbQ0KWC1NUy1QdWJsaWNUcmFmZmljVHlwZTogRW1haWwNClgtTVMtT2ZmaWNlMzY1LUZpbHRlcmluZy1Db3JyZWxhdGlvbi1JZC1QcnZzOg0KCWMwZTVjMzMyLWY5MDUtNDU3NC00ZTQ3LTA4ZGIwYjhiYjE4OQ0KTlBGLUNoZWNrOiAxDQpYLU1pY3Jvc29mdC1BbnRpc3BhbTogQkNMOjA7DQpYLU1pY3Jvc29mdC1BbnRpc3BhbS1NZXNzYWdlLUluZm86DQoJPT91cy1hc2NpaT9RP1RycWNMcnZ2dVFQTVdPUWVwQ1NNTlNQeFEzRWJQZzF0SllQeHQ4Wk5FQVBvN20wOHRROE1NcW5UOGFPej89DQogPT91cy1hc2NpaT9RPzNJakZNZ2ZzY0NpQVVxbmtRNWFIRTFQQ2ZyMm11eDA5YjBhZC9NRUVxYXg4MjVpSXRDOGs5ekxKZWxFbT89DQogPT91cy1hc2NpaT9RP3FLY3ZGam1ZdVRpc2dqc3RTTkxtWVpDbjQwZ3JYVHRrT0U1TGlDZjNXVFNVMFY3WW4zN2ZNUW9UajFVUD89DQogPT91cy1hc2NpaT9RP1ZHZEkzY05PVDg3MUlQOFlSWDdEWHlqcWY5bmgxbkNGYUtyandkZVlvZDFxWmlFdVlZeU4yMEIvcnhhbD89DQogPT91cy1hc2NpaT9RP1E1S3B5alNudDhKU2xRWlZRcEpUZ2N2L0dhQm0vR0xDOEkwVkpRY1owbWRTOVZkUXhFMnF1RXI4SGtucj89DQogPT91cy1hc2NpaT9RP2ZLOThjRXIrRWdST09iQWhVL1dnQ2M0ZWFVcXp4VUNjbXBUWnJuNWNOUFhkQ2RlMkZ2c2J4T1p1L1J2OT89DQogPT91cy1hc2NpaT9RP0NzUnVkY0FranowbTNnUmpXN0grUmswK2NpdCtpMXZvUUhLM1JvQlEveDlTdkdkTmRqNkI3TndYQ0w0aD89DQogPT91cy1hc2NpaT9RP005djdBWWdqV2RwNElXa2NreE5CWitCYjZJenlERDFqQ3BncmVsVEQvNWRTcFQ5aE1GL1hnZTltY0h2Rj89DQogPT91cy1hc2NpaT9RP3JxVk9rR2hBLzlqNGx2SE1EMk1KRGxWeUp1WVcxdXgvZE9IZHF4UW9nL0diL0l0MlF5eGRKZ2ZCNGZUQT89DQogPT91cy1hc2NpaT9RP1MwaHQ0dmJEMkltdUdGYWd0TWZuZ2lDblRENU45NHpsNHcxRVZYdWtkbWh2QnlxZkNtdUU3enlIL2cxRz89DQogPT91cy1hc2NpaT9RP1JnTmMrdStsTjFVQVI0TEgwRG45VnZvMktRV0dPTWdxbGltQWE4bVhVNE91RUtESTNOV3hZUDR6ckFCRz89DQogPT91cy1hc2NpaT9RP1R3bUJmUnFHQWVVMDZzeVB6QmU0eWVTbGNNejkrekhBOVpQYWI5bnZZTkhkekFQWStCMFlMZ3lxanFFVj89DQogPT91cy1hc2NpaT9RP20venREMDg2R3RWWCtSZ2VmWFh3L0pwaDNQNU4rVFpuNTRpVDQ5Y0VITUZXV0ZwSThPMjJoMDJRSzNWcD89DQogPT91cy1hc2NpaT9RP1NHUXdyaHBhVklZeVF5bXRmTGVBUHNzTnJBd2tOenJEUjc1UXFBRG12U2haZURvekJYRGlTejlndjBoaD89DQogPT91cy1hc2NpaT9RP0pZdkJwM1VZSVBlZ0hBblpFMWNKclZqQ0hZQW1Ub0d5bzlxUnFFZnphcThBWW03VjIvL2NDbEszWmdrVz89DQogPT91cy1hc2NpaT9RP3NoR1BxUEpxUVJHMWVjZC83NGEwdHBpZjJubnhKM0xNakR1cnBXNlo3UGZvbStEUURhVW1HOHA1VDMvNT89DQogPT91cy1hc2NpaT9RP0w5UVU4NmpqUHpLaUJ5ejNBVDRhc0Fjd1lLTnhNV045TlJOQlAzSnVxa2NXcUpPT3d0V0RZQjZOVlFRTD89DQogPT91cy1hc2NpaT9RP2tYS1BqT1NPVXNhZm05Y2IweVNacjlIV0VablFUUDQxQXdsTloxM0NBOXQvVURUN3VlM2M4RE5ZWjIrLz89DQogPT91cy1hc2NpaT9RP0dCVHEra1VGYU1iN3NReDN2cmpYdTVvOUJRN2txSVR5blgwbmlqR2d5M1pnQWM1UHp5WVlabGl4SHlNZj89DQogPT91cy1hc2NpaT9RP3RsNTdkaWhSK1Bhb2hRUkhDQkJkQ2U0ZUdsaW1tWnR5b0dOTDVabG5pWGRIcjV4U3ppck5jdlV0eXlOeD89DQogPT91cy1hc2NpaT9RP1RyMG5IZlFqVkF3OWJ2VEdlK0lxbDRxVWljT0UvbS9oR0FTblFvUklmL3NveU5OVldxSjhKYkp4Vi9lMj89DQogPT91cy1hc2NpaT9RPzZYVi8zOEczRkVheUhvQlppUi9nUnJFQWp1YkJtekx4WVpldFpnQ0tjd3hKTzVReGY3b00vSTdOdXdRNj89DQogPT91cy1hc2NpaT9RPy9IdTY5VkV0WW8xdEN6TmEyYW1CbC91QVQ1R1JPRmJSYS90UVI2NW5naHJ3MXA3M01kUkxTNXk1TTFsRz89DQogPT91cy1hc2NpaT9RPzc1TDhPcE1mcm5CblVMRis4WE4yelhZRlJCTXl1cUk1WDI4WXJwQmVFU0VTU0pVdTZtWWhpdGtFQkNhTT89DQogPT91cy1hc2NpaT9RP0ZRODNCWXMzaW85cHBwZjY4RnZaKy9ZMUhDZHpQbTVSREF3S2puVjhOZi9aSi9jS05UMU1RdXhmeDU3UT89DQogPT91cy1hc2NpaT9RP3ZWU3l0T0VpK1VDUjhkZ2UvNW9aYkI2Wk9QaEJWdzBLZ2puM0tXZlErdmhiMzd1eWYwdDRDS1VGWU9MbD89DQogPT91cy1hc2NpaT9RP3NLTlpsZUhEVUNmUURwcGpnb3FkcU9oaGVaU3FuNWQ4WHhsSEJieStJcjhPanNiRWc5WHVqdHVja2QyVz89DQogPT91cy1hc2NpaT9RP2ptU2FoWlBSY1hPdlZBRGFtV1lhOTM1ckxQVDFBSUtzcndkcllVbHVxZGZNaHNwWmc5S0VnUHZaWCtHVj89DQogPT91cy1hc2NpaT9RP0dRaHlDeWlFQm9JQlhLdHlSV1pzL2lUVkRiNGE2RE1HTERYZFBQcU8rZG1SNE1wMkdsQVBkRzVqNlhjdD89DQogPT91cy1hc2NpaT9RPys4NG8zNVFpODRMSVUrN2x1cFMyOEhieWJSdXNncm1WNzU5Mmdxc1VmZ09hK1U1YWgvem5kQURaUFEvVz89DQogPT91cy1hc2NpaT9RP3B3V0dRV3V5a0dJZFZZMkoyTjlsY041ZW0ydkg4Z2hSTkRCWWFFdUZ0YzJqY05KOHhZNXRLclJmSkwrMT89DQogPT91cy1hc2NpaT9RP3VQSGF3MVkrUWxHajZaa0pLQT0zRD0zRD89DQpYLUZvcmVmcm9udC1BbnRpc3BhbS1SZXBvcnQ6DQoJQ0lQOjE5OC4xMTcuMS4yMTU7Q1RSWTpVUztMQU5HOmVuO1NDTDoxO1NSVjo7SVBWOk5MSTtTRlY6TlNQTTtIOmF1dG9kaXNjb3Zlci5uYXNhLmdvdjtQVFI6bmRqc2xuc2NhczItcHViLm5kYy5uYXNhLmdvdjtDQVQ6Tk9ORTtTRlM6KDEzMjMwMDI1KSg0NTExOTkwMTgpKDU2NjAzMDAwMDIpKDgzMzgwNDAwMDAxKSgxODYwMDMpKDI2MDA1KSgzMzYwMTIpKDM1NjAwNSkoOTY4NjAwMykoNzYzNjAwMykoMTA5NjAwMykoNjkxNjAwOSkoODY3NjAwMikoODkzNjAwMikoNTI1MzYwMTQpKDMzNjU2MDAyKSg4NjM2MjAwMSkoODIzMTA0MDAwMDUpKDY1MDYwMDcpKDk2NjAwNSkoNzY5NjAwNSkoNTUwMTYwMDMpO0RJUjpJTkI7DQpYLU1TLUV4Y2hhbmdlLVNhZmVsaW5rcy1VcmwtS2V5VmVyOiAxDQpYLU1TLUV4Y2hhbmdlLUFUUFNhZmVMaW5rcy1TdGF0OiAwDQpYLU1TLUV4Y2hhbmdlLUFudGlTcGFtLUV4dGVybmFsSG9wLU1lc3NhZ2VEYXRhLUNodW5rQ291bnQ6IDENClgtTVMtRXhjaGFuZ2UtQW50aVNwYW0tRXh0ZXJuYWxIb3AtTWVzc2FnZURhdGEtMDoNCgl3c3BOdUdVU2RLOTkzaVV5K05tWk5GcW0ybWcycHNzb2NROWhjWDdnSzh1RXYxa2NJZTRmZEFBTjl1Rkp1c0ljTFVTMi9Fc2FxUThIN1lNWWdacEJtYzFrVGRHODk4YTVZL0JTaG5jRG1WaTgrTVY3QlBHWmFzMlg1MTEyd0lhOE9yTVNRVm9zL2VLdnpxNnJRanNHd1JjV2l4Vm1BeU1UYWY0ZnVOV0hXUExxaEY2QmpQcnlpOTVPcnk5ZUgxbFM0TEJBbWZOQllqOGM1MEdzZUxvWlV2c3lxSlJhdThwVUZ0RXl5L0QrRmNrZk5pbjlXRUorTUIwRUJBUnZHT3Q3VjBhVVVWd0NZVDZzaUF0SXhuL3QvMXRZN21Hd3p4emszYXN6V2pubzYxamhOR2ZST084ckQxbndZd1VvY1JCcGxCTWU2RmN1UnoyblZ6RlFsc1djdGN1UVVIMG9NbXZsZXpRYnZwMHl0Y0YwdUtRSTQ4M1ZXZTFFRDRMTTNnLzhaNUczR3FnQmtrYk1zc3A1aVBVenlLL1FYUWkrSE1zb2RMZXRmOG9Gb3pHbGVLTHBtaVBJNVcxWjZ3MUxPcmVnUlI1Z3Q2OFJnZmFQN0VRVG1lOGRsMWVxTFNZYUJZcmZ5R09ZWnlqWmVTNVd2RVVVeFREUTZsbUFCcmdEbDBON0pGNUh6eUNvUmZzL25qRGlHT1IwMFR6dnhkNUZaMitycUkwY2NBT09PNlVmelNBYlZIQTFzYUthVVZ0d3NGWmNta2g4L0QvYnNweEhoaHVsMGVDRVFJZzdZQnc4OUVKcXprOGJBMVdIaVJzNUhFN3BLYnB1SWllcHN5WFNxSk5rUDdHN2tIQ0dsZmkzdDFTai9aNHB5L21rMnp6eGlmVTRNR0FldTdJNFBpdnpQM0N6L1hMeE5ub3FmckpRNCswVmpuSUhCNmFaMk84emZSdkFyVGErdXNVd3Q2VVNVV0FBNVdpY29KTlZMK3FEYUdOMVFQYkhpSG5FdS8zWkJUaGFmTkpUSWRhNHdZY1M1UlNRTkkwendJS1luYTZ6aXE3WXR0d25aK3duQTZ6enZyV2prY0xGaWRGUUorT00rWW8wDQpYLU9yaWdpbmF0b3JPcmc6IG5hc2EuZ292DQpYLU1TLUV4Y2hhbmdlLUNyb3NzVGVuYW50LU9yaWdpbmFsQXJyaXZhbFRpbWU6IDEwIEZlYiAyMDIzIDE3OjI0OjQzLjM1NzINCiAoVVRDKQ0KWC1NUy1FeGNoYW5nZS1Dcm9zc1RlbmFudC1OZXR3b3JrLU1lc3NhZ2UtSWQ6IDNmZTI3N2E2LTM4ZmYtNDk4MS1mMWNiLTA4ZGIwYjhiYjMwMQ0KWC1NUy1FeGNoYW5nZS1Dcm9zc1RlbmFudC1JZDogNzAwNWQ0NTgtNDViZS00OGFlLTgxNDAtZDQzZGE5NmRkMTdiDQpYLU1TLUV4Y2hhbmdlLUNyb3NzVGVuYW50LU9yaWdpbmFsQXR0cmlidXRlZFRlbmFudENvbm5lY3RpbmdJcDogVGVuYW50SWQ9NzAwNWQ0NTgtNDViZS00OGFlLTgxNDAtZDQzZGE5NmRkMTdiO0lwPVsxOTguMTE3LjEuMjE1XTtIZWxvPVthdXRvZGlzY292ZXIubmFzYS5nb3ZdDQpYLU1TLUV4Y2hhbmdlLUNyb3NzVGVuYW50LUF1dGhTb3VyY2U6DQoJQkwwR0NDMDJGVDA0OC5lb3AtZ2NjMDIucHJvZC5wcm90ZWN0aW9uLm91dGxvb2suY29tDQpYLU1TLUV4Y2hhbmdlLUNyb3NzVGVuYW50LUF1dGhBczogQW5vbnltb3VzDQpYLU1TLUV4Y2hhbmdlLUNyb3NzVGVuYW50LUZyb21FbnRpdHlIZWFkZXI6IEh5YnJpZE9uUHJlbQ0KWC1NUy1FeGNoYW5nZS1UcmFuc3BvcnQtQ3Jvc3NUZW5hbnRIZWFkZXJzU3RhbXBlZDogU0owUFIwOU1COTQwMA0KDQotLV8wMDBfUEgwUFIwOU1CNzg4NDBEOTY3QkYzQUEzRjE5RTY0QTk2QTFERTlQSDBQUjA5TUI3ODg0bmFtcF8NCkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD0idXMtYXNjaWkiDQpDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiBxdW90ZWQtcHJpbnRhYmxlDQoNCg0KTS4gRGFmY2lrb3ZhLCBKLiBSaXBhIChNYXNhcnlrIFUuKSwgQS4gUGFsIChLb25rb2x5IE9ic2VydmF0b3J5KSwgTi4gV2VybmVyDQooTWFzYXJ5ayBVLiksIE0uIE9obm8sIEguIFRha2FoYXNoaSAoSGlyb3NoaW1hIFUuKSwgTC4gTWVzemFyb3MsIEIuIENzYWsNCihLb25rb2x5IE9ic2VydmF0b3J5KSwgTi4gSHVzYXJpa292YSwgRi4gTXVueiAsIE0uIFRvcGlua2EsIE0uIEtvbGFyLCBKLi1QLg0KQnJldWVyLCBGLiBIcm9jaCAoTWFzYXJ5ayBVLiksIFQuIFVyYmFuZWMsIE0uIEthc2FsLCAgQS4gUG92YWxhYyAoQnJubyBVLg0Kb2YgVGVjaG5vbG9neSksIEouIEh1ZGVjLCBKLiBLYXB1cywgTS4gRnJhanQgKFNwYWNlbWFuaWMgcy5yLm8pLCBSLiBMYXN6bG8sDQpNLiBLb2xlZGEgKE5lZWRyb25peCBzLnIubyksIE0uIFNtZWxrbywgUC4gSGFuYWssIFAuIExpcG92c2t5IChUZWNobmljYWwgVS4NCm9mIEtvc2ljZSksIEcuIEdhbGdvY3ppIChXaWduZXIgUmVzZWFyY2ggQ2VudGVyL0VvdHZvcyBVLiksIFkuIFVjaGlkYSwgSC4NClBvb24sIEguIE1hdGFrZSAoSGlyb3NoaW1hIFUuKSwgTi4gVWNoaWRhIChJU0FTL0pBWEEpLCBULiBCb3pva2kgKEVvdHZvcw0KVS4pLCBHLiBEYWx5YSAoRW90dm9zIFUuKSwgVC4gRW5vdG8gKEt5b3RvIFUuKSwgWnMuIEZyZWkgKEVvdHZvcyBVLiksIEcuDQpGcmlzcyAoRW90dm9zIFUuKSwgWS4gRnVrYXphd2EsIEsuIEhpcm9zZSAoSGlyb3NoaW1hIFUuKSwgUy4gSGlzYWRvbWkNCihOYWdveWEgVS4pLCBZLiBJY2hpbm9oZSAoUmlra3lvIFUuKSwgSy4gS2FwYXMgKEVvdHZvcyBVLiksIEwuIEwuIEtpc3MNCihLb25rb2x5IE9ic2VydmF0b3J5KSwgIFQuIE1penVubyAoSGlyb3NoaW1hIFUuKSwgSy4gTmFrYXphd2EgKE5hZ295YSBVLiksDQpILiBPZGFrYSAoVW5pdiBvZiBUb2t5byksIEouIFRha2F0c3kgKEVvdHZvcyBVLiksIEsuIFRvcmlnb2UgKEhpcm9zaGltYQ0KVS4pLCBOLiBLb2dpc28sIE0uIFlvbmV5YW1hIChPc2FrYSBNZXRyb3BvbGl0YW4gVS4pLCBNLiBNb3JpdGFraSAoVS4NClRva3lvKSwgVC4gS2FubyAoVS4gTWljaGlnYW4pIC0tIHRoZSBHUkJBbHBoYSBjb2xsYWJvcmF0aW9uLg0KDQpUaGUgbG9uZy1kdXJhdGlvbiBHUkIgMjMwMjA3QiAoQUdJTEUvTUNBTCBkZXRlY3Rpb246IEdDTiBDaXJjLiAzMzI5NjsNClN3aWZ0L0JBVC1HVUFOTyBkZXRlY3Rpb246IEdDTiBDaXJjLiAzMzI5ODsgQ0FMRVQvR0NCTSBkZXRlY3Rpb246IHRyaWdnZXINCm5vLiAxMzU5Nzc5OTQ1OyBJTlRFR1JBTC9TUEktQUNTIGRldGVjdGlvbjogdHJpZ2dlciBuby4gMTAxOTApIHdhcyBvYnNlcnZlZA0KYnkgdGhlIEdSQkFscGhhIDFVIEN1YmVTYXQgKFBhbCBldCBhbC4gUHJvYy4gU1BJRSAyMDIwKS4NCg0KVGhlIGRldGVjdGlvbiB3YXMgY29uZmlybWVkIGF0IHRoZSBwZWFrIHRpbWUgMjAyMy0wMi0wNyAwNDo0MDo0OCBVVEMuIFRoZQ0KVDkwIGR1cmF0aW9uIG1lYXN1cmVkIGJ5IEdSQkFscGhhIGlzIDEwIHMgYW5kIHRoZSBvdmVyYWxsIHNpZ25pZmljYW5jZQ0KZHVyaW5nIFQ5MCByZWFjaGVzIDI1IHNpZ21hLg0KDQpUaGUgbGlnaHQgY3VydmUgb2J0YWluZWQgYnkgR1JCQWxwaGEgaXMgYXZhaWxhYmxlIGhlcmU6DQoNCmh0dHBzOi8vZ2NjMDIuc2FmZWxpbmtzLnByb3RlY3Rpb24ub3V0bG9vay5jb20vP3VybD0zRGh0dHBzJTNBJTJGJTJGZ3JiYWxwaD0NCmEua29ua29seS5odSUyRnN0YXRpYyUyRnNoYXJlJTJGR1JCMjMwMjA3Ql9HQ04ucGRmJmRhdGE9M0QwNSU3QzAxJTdDY2lyY3VsYT0NCnJzJTQwZGV2Lmdjbi5uYXNhLmdvdiU3QzNmZTI3N2E2MzhmZjQ5ODFmMWNiMDhkYjBiOGJiMzAxJTdDNzAwNWQ0NTg0NWJlNDhhZT0NCjgxNDBkNDNkYTk2ZGQxN2IlN0MwJTdDMCU3QzYzODExNjQ2NzUyODIzNjAzMiU3Q1Vua25vd24lN0NUV0ZwYkdac2IzZDhleUpXST0NCmpvaU1DNHdMakF3TURBaUxDSlFJam9pVjJsdU16SWlMQ0pCVGlJNklrMWhhV3dpTENKWFZDSTZNbjAlM0QlN0MzMDAwJTdDJTdDJT0NCjdDJnNkYXRhPTNEZVRFZTNVODZ2QmJPY2FXOGMwYndNaE9WMDlQdUxtaEwydllMTGszeDdnWSUzRCZyZXNlcnZlZD0zRDANCg0KQWxsIEdSQkFscGhhIGRldGVjdGlvbnMgYXJlIGxpc3RlZCBhdDoNCmh0dHBzOi8vZ2NjMDIuc2FmZWxpbmtzLnByb3RlY3Rpb24ub3V0bG9vay5jb20vP3VybD0zRGh0dHBzJTNBJTJGJTJGbW9ub2Nlcj0NCm9zLnBoeXNpY3MubXVuaS5jeiUyRmhlYSUyRkdSQkFscGhhJTJGJmRhdGE9M0QwNSU3QzAxJTdDY2lyY3VsYXJzJTQwZGV2Lmdjbj0NCi5uYXNhLmdvdiU3QzNmZTI3N2E2MzhmZjQ5ODFmMWNiMDhkYjBiOGJiMzAxJTdDNzAwNWQ0NTg0NWJlNDhhZTgxNDBkNDNkYTk2ZD0NCmQxN2IlN0MwJTdDMCU3QzYzODExNjQ2NzUyODIzNjAzMiU3Q1Vua25vd24lN0NUV0ZwYkdac2IzZDhleUpXSWpvaU1DNHdMakF3TT0NCkRBaUxDSlFJam9pVjJsdU16SWlMQ0pCVGlJNklrMWhhV3dpTENKWFZDSTZNbjAlM0QlN0MzMDAwJTdDJTdDJTdDJnNkYXRhPTNEdz0NCmIlMkZLbG1lQkElMkZzdlQ3UUNwNkNlaGphdW9pZjRVRW9KNCUyRk1sYzhMbjlrMCUzRCZyZXNlcnZlZD0zRDANCg0KR1JCQWxwaGEsIGxhdW5jaGVkIG9uIDIwMjEgTWFyY2ggMjIsIGlzIGEgZGVtb25zdHJhdGlvbiBtaXNzaW9uIGZvciBhDQpmdXR1cmUgQ3ViZVNhdCBjb25zdGVsbGF0aW9uIChXZXJuZXIgZXQgYWwuIFByb2MuIFNQSUUgMjAxOCkuIFRoZSBkZXRlY3Rvcg0Kb2YgR1JCQWxwaGEgY29uc2lzdHMgb2YgYSA3NSB4IDc1IHggNSBtbTMgQ3NJIHNjaW50aWxsYXRvciByZWFkIG91dCBieSBhDQpTaVBNIGFycmF5LCBjb3ZlcmluZyB0aGUgZW5lcmd5IHJhbmdlIGZyb20gfjUwIGtlViB0byB+MTAwMCBrZVYuIFRvDQppbmNyZWFzZSB0aGUgZHV0eSBjeWNsZSBhbmQgdGhlIGRvd25saW5rIHJhdGUsIHRoZSB1cGdyYWRlIG9mIHRoZSBvbi1ib2FyZA0KZGF0YSBhY3F1aXNpdGlvbiBzb2Z0d2FyZSBzdGFjayBpcyBpbiBwcm9ncmVzcy4gVGhlIGdyb3VuZCBzZWdtZW50IGlzIGFsc28NCnN1cHBvcnRlZCBieSB0aGUgcmFkaW8gYW1hdGV1ciBjb21tdW5pdHkgYW5kIGl0IHRha2VzIGFkdmFudGFnZSBvZiB0aGUNClNhdE5PR1MgbmV0d29yayBmb3IgaW5jcmVhc2VkIGRhdGEgZG93bmxpbmsgdm9sdW1lLg0KDQotLV8wMDBfUEgwUFIwOU1CNzg4NDBEOTY3QkYzQUEzRjE5RTY0QTk2QTFERTlQSDBQUjA5TUI3ODg0bmFtcF8NCkNvbnRlbnQtVHlwZTogdGV4dC9odG1sOyBjaGFyc2V0PSJ1cy1hc2NpaSINCkNvbnRlbnQtVHJhbnNmZXItRW5jb2Rpbmc6IHF1b3RlZC1wcmludGFibGUNCg0KPGh0bWwgeG1sbnM6dj0zRCJ1cm46c2NoZW1hcy1taWNyb3NvZnQtY29tOnZtbCIgeG1sbnM6bz0zRCJ1cm46c2NoZW1hcy1taWNyPQ0Kb3NvZnQtY29tOm9mZmljZTpvZmZpY2UiIHhtbG5zOnc9M0QidXJuOnNjaGVtYXMtbWljcm9zb2Z0LWNvbTpvZmZpY2U6d29yZCIgPQ0KeG1sbnM6bT0zRCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL29mZmljZS8yMDA0LzEyL29tbWwiIHhtbG5zPTNEImh0dHA6PQ0KLy93d3cudzMub3JnL1RSL1JFQy1odG1sNDAiPg0KPGhlYWQ+DQo8bWV0YSBodHRwLWVxdWl2PTNEIkNvbnRlbnQtVHlwZSIgY29udGVudD0zRCJ0ZXh0L2h0bWw7IGNoYXJzZXQ9M0R1cy1hc2NpaSI9DQo+DQo8bWV0YSBuYW1lPTNEIkdlbmVyYXRvciIgY29udGVudD0zRCJNaWNyb3NvZnQgV29yZCAxNSAoZmlsdGVyZWQgbWVkaXVtKSI+DQo8c3R5bGU+PCEtLQ0KLyogRm9udCBEZWZpbml0aW9ucyAqLw0KQGZvbnQtZmFjZQ0KCXtmb250LWZhbWlseToiQ2FtYnJpYSBNYXRoIjsNCglwYW5vc2UtMToyIDQgNSAzIDUgNCA2IDMgMiA0O30NCkBmb250LWZhY2UNCgl7Zm9udC1mYW1pbHk6Q2FsaWJyaTsNCglwYW5vc2UtMToyIDE1IDUgMiAyIDIgNCAzIDIgNDt9DQovKiBTdHlsZSBEZWZpbml0aW9ucyAqLw0KcC5Nc29Ob3JtYWwsIGxpLk1zb05vcm1hbCwgZGl2Lk1zb05vcm1hbA0KCXttYXJnaW46MGluOw0KCWZvbnQtc2l6ZToxMS4wcHQ7DQoJZm9udC1mYW1pbHk6IkNhbGlicmkiLHNhbnMtc2VyaWY7fQ0Kc3Bhbi5FbWFpbFN0eWxlMTcNCgl7bXNvLXN0eWxlLXR5cGU6cGVyc29uYWwtY29tcG9zZTsNCglmb250LWZhbWlseToiQ2FsaWJyaSIsc2Fucy1zZXJpZjsNCgljb2xvcjp3aW5kb3d0ZXh0O30NCi5Nc29DaHBEZWZhdWx0DQoJe21zby1zdHlsZS10eXBlOmV4cG9ydC1vbmx5O30NCkBwYWdlIFdvcmRTZWN0aW9uMQ0KCXtzaXplOjguNWluIDExLjBpbjsNCgltYXJnaW46MS4waW4gMS4waW4gMS4waW4gMS4waW47fQ0KZGl2LldvcmRTZWN0aW9uMQ0KCXtwYWdlOldvcmRTZWN0aW9uMTt9DQotLT48L3N0eWxlPjwhLS1baWYgZ3RlIG1zbyA5XT48eG1sPg0KPG86c2hhcGVkZWZhdWx0cyB2OmV4dD0zRCJlZGl0IiBzcGlkbWF4PTNEIjEwMjYiIC8+DQo8L3htbD48IVtlbmRpZl0tLT48IS0tW2lmIGd0ZSBtc28gOV0+PHhtbD4NCjxvOnNoYXBlbGF5b3V0IHY6ZXh0PTNEImVkaXQiPg0KPG86aWRtYXAgdjpleHQ9M0QiZWRpdCIgZGF0YT0zRCIxIiAvPg0KPC9vOnNoYXBlbGF5b3V0PjwveG1sPjwhW2VuZGlmXS0tPg0KPC9oZWFkPg0KPGJvZHkgbGFuZz0zRCJFTi1VUyIgbGluaz0zRCIjMDU2M0MxIiB2bGluaz0zRCIjOTU0RjcyIiBzdHlsZT0zRCJ3b3JkLXdyYXA6PQ0KYnJlYWstd29yZCI+DQo8ZGl2IGNsYXNzPTNEIldvcmRTZWN0aW9uMSI+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPjxvOnA+Jm5ic3A7PC9vOnA+PC89DQpzcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+TS4gRGFmY2lrb3ZhLCBKLiBSaT0NCnBhIChNYXNhcnlrIFUuKSwgQS4gUGFsIChLb25rb2x5IE9ic2VydmF0b3J5KSwgTi4gV2VybmVyPG86cD48L286cD48L3NwYW4+PD0NCi9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij4oTWFzYXJ5ayBVLiksIE0uIE9oPQ0Kbm8sIEguIFRha2FoYXNoaSAoSGlyb3NoaW1hIFUuKSwgTC4gTWVzemFyb3MsIEIuIENzYWs8bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPihLb25rb2x5IE9ic2VydmF0b3I9DQp5KSwgTi4gSHVzYXJpa292YSwgRi4gTXVueiAsIE0uIFRvcGlua2EsIE0uIEtvbGFyLCBKLi1QLjxvOnA+PC9vOnA+PC9zcGFuPjw9DQovcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+QnJldWVyLCBGLiBIcm9jaCAoTT0NCmFzYXJ5ayBVLiksIFQuIFVyYmFuZWMsIE0uIEthc2FsLCZuYnNwOyBBLiBQb3ZhbGFjIChCcm5vIFUuPG86cD48L286cD48L3NwYT0NCm4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5vZiBUZWNobm9sb2d5KSwgSi4gPQ0KSHVkZWMsIEouIEthcHVzLCBNLiBGcmFqdCAoU3BhY2VtYW5pYyBzLnIubyksIFIuIExhc3psbyw8bzpwPjwvbzpwPjwvc3Bhbj48PQ0KL3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPk0uIEtvbGVkYSAoTmVlZHJvbmk9DQp4IHMuci5vKSwgTS4gU21lbGtvLCBQLiBIYW5haywgUC4gTGlwb3Zza3kgKFRlY2huaWNhbCBVLjxvOnA+PC9vOnA+PC9zcGFuPjw9DQovcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+b2YgS29zaWNlKSwgRy4gR2FsZz0NCm9jemkgKFdpZ25lciBSZXNlYXJjaCBDZW50ZXIvRW90dm9zIFUuKSwgWS4gVWNoaWRhLCBILjxvOnA+PC9vOnA+PC9zcGFuPjwvcD0NCj4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+UG9vbiwgSC4gTWF0YWtlIChIaT0NCnJvc2hpbWEgVS4pLCBOLiBVY2hpZGEgKElTQVMvSkFYQSksIFQuIEJvem9raSAoRW90dm9zPG86cD48L286cD48L3NwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5VLiksIEcuIERhbHlhIChFb3R2PQ0Kb3MgVS4pLCBULiBFbm90byAoS3lvdG8gVS4pLCBacy4gRnJlaSAoRW90dm9zIFUuKSwgRy48bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPkZyaXNzIChFb3R2b3MgVS4pLCA9DQpZLiBGdWthemF3YSwgSy4gSGlyb3NlIChIaXJvc2hpbWEgVS4pLCBTLiBIaXNhZG9taTxvOnA+PC9vOnA+PC9zcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+KE5hZ295YSBVLiksIFkuIEljaD0NCmlub2hlIChSaWtreW8gVS4pLCBLLiBLYXBhcyAoRW90dm9zIFUuKSwgTC4gTC4gS2lzczxvOnA+PC9vOnA+PC9zcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+KEtvbmtvbHkgT2JzZXJ2YXRvcj0NCnkpLCZuYnNwOyBULiBNaXp1bm8gKEhpcm9zaGltYSBVLiksIEsuIE5ha2F6YXdhIChOYWdveWEgVS4pLDxvOnA+PC9vOnA+PC9zcD0NCmFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+SC4gT2Rha2EgKFVuaXYgb2YgVD0NCm9reW8pLCBKLiBUYWthdHN5IChFb3R2b3MgVS4pLCBLLiBUb3JpZ29lIChIaXJvc2hpbWE8bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIGxhbmc9M0QiRVMiIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPlUuKSwgTi49DQogS29naXNvLCBNLiBZb25leWFtYSAoT3Nha2EgTWV0cm9wb2xpdGFuIFUuKSwgTS4gTW9yaXRha2kgKFUuPG86cD48L286cD48L3M9DQpwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5Ub2t5byksIFQuIEthbm8gKFUuPQ0KIE1pY2hpZ2FuKSAtLSB0aGUgR1JCQWxwaGEgY29sbGFib3JhdGlvbi48bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPjxvOnA+Jm5ic3A7PC9vOnA+PC89DQpzcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+VGhlIGxvbmctZHVyYXRpb24gRz0NClJCIDIzMDIwN0IgKEFHSUxFL01DQUwgZGV0ZWN0aW9uOiBHQ04gQ2lyYy4gMzMyOTY7PG86cD48L286cD48L3NwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5Td2lmdC9CQVQtR1VBTk8gZGV0PQ0KZWN0aW9uOiBHQ04gQ2lyYy4gMzMyOTg7IENBTEVUL0dDQk0gZGV0ZWN0aW9uOiB0cmlnZ2VyPG86cD48L286cD48L3NwYW4+PC9wPQ0KPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5uby4gMTM1OTc3OTk0NTsgSU5UPQ0KRUdSQUwvU1BJLUFDUyBkZXRlY3Rpb246IHRyaWdnZXIgbm8uIDEwMTkwKSB3YXMgb2JzZXJ2ZWQ8bzpwPjwvbzpwPjwvc3Bhbj48PQ0KL3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPmJ5IHRoZSBHUkJBbHBoYSAxVSA9DQpDdWJlU2F0IChQYWwgZXQgYWwuIFByb2MuIFNQSUUgMjAyMCkuPG86cD48L286cD48L3NwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij48bzpwPiZuYnNwOzwvbzpwPjwvPQ0Kc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPlRoZSBkZXRlY3Rpb24gd2FzIGM9DQpvbmZpcm1lZCBhdCB0aGUgcGVhayB0aW1lIDIwMjMtMDItMDcgMDQ6NDA6NDggVVRDLiBUaGU8bzpwPjwvbzpwPjwvc3Bhbj48L3A9DQo+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPlQ5MCBkdXJhdGlvbiBtZWFzdXI9DQplZCBieSBHUkJBbHBoYSBpcyAxMCBzIGFuZCB0aGUgb3ZlcmFsbCBzaWduaWZpY2FuY2U8bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPmR1cmluZyBUOTAgcmVhY2hlcyA9DQoyNSBzaWdtYS48bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPjxvOnA+Jm5ic3A7PC9vOnA+PC89DQpzcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+VGhlIGxpZ2h0IGN1cnZlIG9idD0NCmFpbmVkIGJ5IEdSQkFscGhhIGlzIGF2YWlsYWJsZSBoZXJlOjxvOnA+PC9vOnA+PC9zcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+PG86cD4mbmJzcDs8L286cD48Lz0NCnNwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5odHRwczovL2dyYmFscGhhLmtvPQ0KbmtvbHkuaHUvc3RhdGljL3NoYXJlL0dSQjIzMDIwN0JfR0NOLnBkZjxvOnA+PC9vOnA+PC9zcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+PG86cD4mbmJzcDs8L286cD48Lz0NCnNwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5BbGwgR1JCQWxwaGEgZGV0ZWN0PQ0KaW9ucyBhcmUgbGlzdGVkIGF0OjxvOnA+PC9vOnA+PC9zcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+aHR0cHM6Ly9tb25vY2Vyb3MucD0NCmh5c2ljcy5tdW5pLmN6L2hlYS9HUkJBbHBoYS88bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPjxvOnA+Jm5ic3A7PC9vOnA+PC89DQpzcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+R1JCQWxwaGEsIGxhdW5jaGVkID0NCm9uIDIwMjEgTWFyY2ggMjIsIGlzIGEgZGVtb25zdHJhdGlvbiBtaXNzaW9uIGZvciBhPG86cD48L286cD48L3NwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBsYW5nPTNEIkZSIiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5mdXR1cmUgPQ0KQ3ViZVNhdCBjb25zdGVsbGF0aW9uIChXZXJuZXIgZXQgYWwuDQo8L3NwYW4+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+UHJvYy4gU1BJRSAyMDE4KS4gVGhlIGRldGVjdG9yPG86cD49DQo8L286cD48L3NwYW4+PC9wPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5vZiBHUkJBbHBoYSBjb25zaXN0PQ0KcyBvZiBhIDc1IHggNzUgeCA1IG1tMyBDc0kgc2NpbnRpbGxhdG9yIHJlYWQgb3V0IGJ5IGE8bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPlNpUE0gYXJyYXksIGNvdmVyaW49DQpnIHRoZSBlbmVyZ3kgcmFuZ2UgZnJvbSB+NTAga2VWIHRvIH4xMDAwIGtlVi4gVG88bzpwPjwvbzpwPjwvc3Bhbj48L3A+DQo8cCBjbGFzcz0zRCJNc29Ob3JtYWwiPjxzcGFuIHN0eWxlPTNEImZvbnQtc2l6ZToxNC4wcHQiPmluY3JlYXNlIHRoZSBkdXR5IGM9DQp5Y2xlIGFuZCB0aGUgZG93bmxpbmsgcmF0ZSwgdGhlIHVwZ3JhZGUgb2YgdGhlIG9uLWJvYXJkPG86cD48L286cD48L3NwYW4+PC89DQpwPg0KPHAgY2xhc3M9M0QiTXNvTm9ybWFsIj48c3BhbiBzdHlsZT0zRCJmb250LXNpemU6MTQuMHB0Ij5kYXRhIGFjcXVpc2l0aW9uIHNvPQ0KZnR3YXJlIHN0YWNrIGlzIGluIHByb2dyZXNzLiBUaGUgZ3JvdW5kIHNlZ21lbnQgaXMgYWxzbzxvOnA+PC9vOnA+PC9zcGFuPjwvPQ0KcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+c3VwcG9ydGVkIGJ5IHRoZSByYT0NCmRpbyBhbWF0ZXVyIGNvbW11bml0eSBhbmQgaXQgdGFrZXMgYWR2YW50YWdlIG9mIHRoZTxvOnA+PC9vOnA+PC9zcGFuPjwvcD4NCjxwIGNsYXNzPTNEIk1zb05vcm1hbCI+PHNwYW4gc3R5bGU9M0QiZm9udC1zaXplOjE0LjBwdCI+U2F0Tk9HUyBuZXR3b3JrIGZvcj0NCiBpbmNyZWFzZWQgZGF0YSBkb3dubGluayB2b2x1bWUuPG86cD48L286cD48L3NwYW4+PC9wPg0KPC9kaXY+DQo8L2JvZHk+DQo8L2h0bWw+DQoNCi0tXzAwMF9QSDBQUjA5TUI3ODg0MEQ5NjdCRjNBQTNGMTlFNjRBOTZBMURFOVBIMFBSMDlNQjc4ODRuYW1wXy0tDQo=',
      },
    },
  },
}
