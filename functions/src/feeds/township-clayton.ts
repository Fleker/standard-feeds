/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

// https://woodburynj.portal.civicclerk.com/
// stream/WOODBURYNJ/a0b72d89-3b97-41fc-a51d-26067f0b4334.pdf
// https://woodburynj.portal.civicclerk.com/stream/WOODBURYNJ/a0b72d89-3b97-41fc-a51d-26067f0b4334.pdf

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const woodbury = await fetch.default("https://www.claytonnj.com/node/22/minutes/2025", {
    "headers": {
      "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "accept-language": "en-US,en;q=0.9",
      "cache-control": "max-age=0",
      "if-none-match": "\"1745884723-0\"",
      "priority": "u=0, i",
      "sec-ch-ua": "\"Chromium\";v=\"136\", \"Google Chrome\";v=\"136\", \"Not.A/Brand\";v=\"99\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "same-origin",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "cookie": "_ga=GA1.2.1984037321.1745884690; _gid=GA1.2.1196557284.1745884690; _ga_NBDERJCZNT=GS1.2.1745884690.1.1.1745884706.0.0.0",
      "Referer": "https://www.claytonnj.com/node/22/minutes",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  });
  const wres = await woodbury.text()
  const $ = cheerio.load(wres)

  console.log(wres)

  const rows = $('div.views-row')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const urlSuffix = $(row).find('a').attr('href')
    const h3 = $(row).find('h3').text().trim()
    const timespan = $(row).find('span.date-display-single')
    const time = new Date($(timespan).attr('content'))

    const link = `https://claytonnj.com${urlSuffix}`

    posts.push({
      authors: ['Clayton Council'],
      guid: `clayton-${time.toDateString()}`,
      link,
      content: `View minutes at ${link}`,
      pubDate: time,
      title: `Clayton ${h3} ${timespan.text().trim()}`
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
        title: 'Clayton Township Government Minutes',
        icon: 'https://www.claytonnj.com/sites/all/themes/custom/sites/claytonnj/vts_claytonnj/logo.png',
      }
  
      if (key === 'township') {
        const woobury = await parseBoroMinutes()
        rss.entries.push(...woobury)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
