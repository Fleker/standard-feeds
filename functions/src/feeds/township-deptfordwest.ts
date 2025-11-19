/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const wdeptford = 'https://www.westdeptford.com/government/meeting_agendas/township_committee.php'
  const pFetch = await fetch.default(wdeptford)
  const pHtml = await pFetch.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)


  const rows = $('div#post table tr')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const cols = $(row).find('td')
    if (cols.length === 1) continue // No meeting minutes yet
    const rowDate = $(cols[0]).text().trim().split(' ')[0]
    const title = $(cols[0]).text().trim()
    const link = $(cols[1]).find('a').attr('href')
    if (link === undefined) continue
    const postDate = new Date(rowDate)
    posts.push({
      authors: ['West Deptford Township Committee'],
      guid: `${postDate.toDateString()}`,
      link: `https://westdeptford.com/${link}`,
      content: `https://www.westdeptford.com/${link}`,
      pubDate: postDate,
      title: `West Deptford Township Committee ${title}`
    })
  }
  return posts
}

async function parseBoeMinutes(): Promise<RssArticle[]> {
  // This needs to be manually updated with every school year
  // See https://wdschools.org/Board_of_Education/board_meetings/meeting_minutes

  const res = await fetch.default("https://wdschools.org/portal/svc/ContentItemSvc.asmx/GetItemList", {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-US,en;q=0.9",
      "content-type": "application/json; charset=UTF-8",
      "priority": "u=1, i",
      "requestfrom": "contentItem",
      "sec-ch-ua": "\"Chromium\";v=\"142\", \"Google Chrome\";v=\"142\", \"Not_A Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Linux\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": "ASP.NET_SessionId=sznfp5twjdd3qibotkwzgrco; _ga=GA1.1.61917832.1763574049; __cf_bm=nC7FHVGcPZfwULT4PY1Wt91eU6loYHIpnOzkEpNGbwo-1763574049-1.0.1.1-UGu4rPKUndD6UjLTELZxFoMNayzoZ7zrwVZGegq58LMG8ipACbc61tj9rCwiP0zk.7LqV0.c_2COpb3A86iGuw5_LqxWBWewLJvisFj9F_8; _ga_1EMTLSBQLJ=GS2.1.s1763574049$o1$g1$t1763574065$j44$l0$h0",
      "Referer": "https://wdschools.org/Board_of_Education/board_meetings/meeting_minutes"
    },
    "body": "{\"parentId\":56478826,\"Params\":\"{\\\"ContextId\\\":37453,\\\"OneLink\\\":\\\"/cms/One.aspx\\\",\\\"RawUrl\\\":\\\"/Board_of_Education/board_meetings/meeting_minutes\\\",\\\"Extension\\\":\\\"6731\\\",\\\"ClientId\\\":\\\"ctl00_ContentPlaceHolder1_ctl15\\\",\\\"Place\\\":\\\"cms\\\",\\\"ThisRequest\\\":\\\"https://wdschools.org:443/cms/One.aspx?portalId=3543&pageId=37449\\\",\\\"Link\\\":\\\"/Board_of_Education/board_meetings/meeting_minutes/?portalId=3543&pageId=37449&objectId.6731=37454&contextId.6731=37453\\\",\\\"PortalId\\\":\\\"3543\\\",\\\"PageId\\\":\\\"37449\\\",\\\"HideDescription\\\":true,\\\"ShowDispSettings\\\":false,\\\"ShowSecurity\\\":false,\\\"ShowActivity\\\":false,\\\"ShowSubscription\\\":true,\\\"id\\\":5,\\\"csFolder.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csFolder.html\\\",\\\"csFile.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csFile.html\\\",\\\"csLink.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csLink.html\\\",\\\"csMove.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csMove.html\\\",\\\"csDisplaySettings.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csDisplaySettings.html\\\",\\\"csFileProps.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csFileProps.html\\\",\\\"csContentActivity.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csContentActivity.html\\\",\\\"csContentAlert.html\\\":\\\"/Common/controls/ContentItemModern/Controls/csContentAlert.html\\\",\\\"searchVal\\\":\\\"\\\",\\\"Segment\\\":\\\"https://wdschools.org/Board_of_Education/board_meetings/meeting_minutes/\\\",\\\"InstanceId\\\":\\\"6731\\\"}\"}",
    "method": "POST"
  });
  const json = await res.json()
  const dataObjects = json.d.DataObject
  const posts: RssArticle[] = []

  for (const object of dataObjects) {
    const link = object.DownloadLink
    const pubDate = new Date(object.ModifiedDateString)
    posts.push({
      authors: ['West Deptford Board of Education'],
      content: `View minutes at ${link}`,
      guid: `${object.ObjectId}`,
      link,
      pubDate,
      title: object.Title
    })
  }
  return posts
}

const getFeed = (key: string) => {
  return {
    obtainFeed: async () => {
      const rss: RssFeed = {
        entries: [],
        lastBuildDate: new Date(),
        link: 'https://gloucestercounty.substack.com',
        title: 'West Deptford Government Minutes',
        icon: 'https://www.westdeptford.com/_assets_/images/logo.png',
      }
  
      if (key === 'township') {
        const wdeptford = await parseBoroMinutes()
        rss.entries.push(...wdeptford)
      }
      if (key === 'school') {
        const boe = await parseBoeMinutes()
        rss.entries.push(...boe)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
