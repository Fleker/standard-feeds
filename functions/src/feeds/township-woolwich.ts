/**
 * Curator for https://serebii.net
 */

const cheerio = require('cheerio')
import * as fetch from 'node-fetch'
import { Curator, RssArticle, RssFeed } from './rss';

async function parseBoroMinutes(): Promise<RssArticle[]> {
  const res = await fetch.default("https://woolwichtwp.org/government/woolwich-township-minutes-agendas/")
  const pHtml = await res.text()
  // console.log(pHtml)
  const $ = cheerio.load(pHtml)

  const rows = $('div.responsiveTable tr')
  const posts: RssArticle[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowLinks = $(row).find('a')
    for (let j = 0; j < rowLinks.length; j++) {
      const title = $(rowLinks[j]).text()
      if (title !== 'Minutes') continue
      const cols = $(row).find('td')
      const currentYear = new Date().getFullYear()
      const date = `${$(cols[0]).text().replace('*Town Hall Meeting, ', '')} ${currentYear}`
      const pubDate = new Date(date)
      if (isNaN(pubDate.getTime())) continue
      const link = $(rowLinks[j]).attr('href')
      posts.push({
        authors: ['Woolwich Township Council'],
        guid: `${pubDate.toDateString()}`,
        link,
        content: `View minutes at ${link}`,
        pubDate,
        title: `Woolwich Township Council Minutes ${date}`
      })
    }
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
        title: 'Woolwich Township Government Minutes',
        icon: 'https://woolwichtwp.org/wp-content/uploads/2024/07/woolwich_nj_logo_small_horizontal-475-dark.fw_.png',
      }
  
      if (key === 'township') {
        const boromin = await parseBoroMinutes()
        rss.entries.push(...boromin)
      }
  
      return rss
    }
  } as Curator
}

export default getFeed
